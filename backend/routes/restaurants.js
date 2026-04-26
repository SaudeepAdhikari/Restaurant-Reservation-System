import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { rankRestaurants } from '../services/recommendationService.js';
import { getCache, setCache } from '../services/cacheService.js';

const router = express.Router();

// Public: list restaurants (development: returns all)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const skip = (page - 1) * limit;
    const sortMode = req.query.sort === 'recommended' ? 'recommended' : 'recent';

    const userLat = Number(req.query.userLat);
    const userLng = Number(req.query.userLng);
    const userLocation = Number.isFinite(userLat) && Number.isFinite(userLng)
      ? { lat: userLat, lng: userLng }
      : null;

    const cacheKey = `restaurants:list:sort=${sortMode}:page=${page}:limit=${limit}:lat=${userLat}:lng=${userLng}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // For now return all restaurants so newly uploaded entries are visible in the UI.
    // In production you may want to filter by { approved: true }.
    let list;
    let total;

    if (sortMode === 'recommended') {
      const all = await Restaurant.find().lean();
      total = all.length;
      const ranked = rankRestaurants(all, userLocation);
      list = ranked.slice(skip, skip + limit);
    } else {
      const [paged, count] = await Promise.all([
        Restaurant.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Restaurant.countDocuments()
      ]);
      list = paged;
      total = count;
    }

    const response = req.query.paginated === 'true'
      ? {
          data: list,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      : list;

    await setCache(cacheKey, response, 60);
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single restaurant by id
router.get('/:id', async (req, res) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (err) {
    console.error('Failed to fetch restaurant by id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
