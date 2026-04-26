import express from 'express';
import Offer from '../models/Offer.js';

const router = express.Router();

// Public: list offers (optionally filter by restaurantId)
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const skip = (page - 1) * limit;
    const now = new Date();

    const q = {};
    if (restaurantId) q.restaurantId = restaurantId;

    // Public listing returns only currently active offers by default.
    if (req.query.includeInactive !== 'true') {
      q.$and = [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
        { $or: [{ status: { $exists: false } }, { status: { $in: ['active', 'scheduled'] } }] }
      ];
    }

    const [offers, total] = await Promise.all([
      Offer.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('restaurantId', 'name images location'),
      Offer.countDocuments(q)
    ]);

    const normalizedOffers = offers.map((offer) => {
      const startDate = offer.startDate ? new Date(offer.startDate) : null;
      const endDate = offer.endDate ? new Date(offer.endDate) : null;
      let lifecycle = offer.status || 'active';

      if (startDate && startDate > now) lifecycle = 'scheduled';
      else if (endDate && endDate < now) lifecycle = 'expired';
      else lifecycle = 'active';

      return {
        ...offer.toObject(),
        lifecycle
      };
    });

    if (req.query.paginated === 'true') {
      return res.json({
        data: normalizedOffers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    res.json(normalizedOffers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
