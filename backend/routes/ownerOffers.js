import express from 'express';
import Offer from '../models/Offer.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';
import { sendOfferNotificationEmail } from '../services/notificationService.js';
import { emitEvent } from '../utils/socket.js';

const router = express.Router();

// List offers for the logged-in owner
router.get('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;
    const now = new Date();

    const [offers, total] = await Promise.all([
      Offer.find({ ownerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('restaurantId', 'name'),
      Offer.countDocuments({ ownerId })
    ]);

    const enriched = offers.map((offer) => {
      const startDate = offer.startDate ? new Date(offer.startDate) : null;
      const endDate = offer.endDate ? new Date(offer.endDate) : null;

      let lifecycle = offer.status || 'active';
      if (startDate && startDate > now) lifecycle = 'scheduled';
      else if (endDate && endDate < now) lifecycle = 'expired';
      else lifecycle = 'active';

      return { ...offer.toObject(), lifecycle };
    });

    if (req.query.paginated === 'true') {
      return res.json({
        data: enriched,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create an offer for one of the owner's restaurants
router.post('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { restaurantId, title, description, image, startDate, endDate, promoCode, discountPercent } = req.body;
    if (!restaurantId || !title) return res.status(400).json({ message: 'restaurantId and title required' });
    // verify restaurant belongs to owner
    const rest = await Restaurant.findById(restaurantId);
    if (!rest) return res.status(404).json({ message: 'Restaurant not found' });
    if (String(rest.ownerId) !== String(ownerId)) return res.status(403).json({ message: 'Not allowed to add offer for this restaurant' });

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    const now = new Date();

    let status = 'active';
    if (parsedStartDate && parsedStartDate > now) status = 'scheduled';
    if (parsedEndDate && parsedEndDate < now) status = 'expired';

    const offer = new Offer({
      ownerId,
      restaurantId,
      title,
      description,
      image,
      promoCode,
      discountPercent,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      status
    });
    await offer.save();

    // Notify recently active customers for this restaurant.
    Booking.find({ restaurantId, status: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('customerId')
      .then(async (bookings) => {
        const customerIds = [...new Set(bookings.map((b) => String(b.customerId)))];
        if (!customerIds.length) return;
        const customers = await Customer.find({ _id: { $in: customerIds } }).select('name email');
        await Promise.allSettled(
          customers.map((customer) => sendOfferNotificationEmail({
            email: customer.email,
            name: customer.name,
            restaurantName: rest.name,
            offerTitle: title,
            promoCode
          }))
        );
      })
      .catch(() => null);

    emitEvent('offer:created', { offerId: offer._id, restaurantId: String(restaurantId), ownerId: String(ownerId) }, `owner:${String(ownerId)}`);
    res.status(201).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const offer = await Offer.findOne({ _id: req.params.id, ownerId });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const updatable = ['title', 'description', 'promoCode', 'discountPercent', 'image', 'startDate', 'endDate'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        offer[key] = (key === 'startDate' || key === 'endDate') && req.body[key]
          ? new Date(req.body[key])
          : req.body[key];
      }
    }

    const now = new Date();
    if (offer.startDate && offer.startDate > now) offer.status = 'scheduled';
    else if (offer.endDate && offer.endDate < now) offer.status = 'expired';
    else offer.status = 'active';

    await offer.save();
    emitEvent('offer:updated', { offerId: offer._id, ownerId: String(ownerId) }, `owner:${String(ownerId)}`);
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optionally delete an offer
router.delete('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (String(offer.ownerId) !== String(ownerId)) return res.status(403).json({ message: 'Not allowed' });
    await offer.deleteOne();
    emitEvent('offer:deleted', { offerId: req.params.id, ownerId: String(ownerId) }, `owner:${String(ownerId)}`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
