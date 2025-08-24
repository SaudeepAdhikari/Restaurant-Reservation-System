// (user routes moved below after app initialization)

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const models = require('./models');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // Change this in production

// Simple JWT auth middleware for admin-only routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin privileges required' });
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get all tables from DB
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await models.Table.find().populate('restaurant');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Create a table
app.post('/api/tables', authMiddleware, async (req, res) => {
  const { restaurantId, name, capacity } = req.body;
  if (!name || typeof capacity === 'undefined') return res.status(400).json({ error: 'Missing fields' });
  try {
    const table = new models.Table({ restaurant: restaurantId || null, name, capacity, status: 'available' });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// Update a table
app.put('/api/tables/:id', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    const { name, capacity, status } = req.body;
    if (name) updates.name = name;
    if (typeof capacity !== 'undefined') updates.capacity = capacity;
    if (status) updates.status = status;
    const table = await models.Table.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// Delete a table
app.delete('/api/tables/:id', authMiddleware, async (req, res) => {
  try {
    const t = await models.Table.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: 'Table not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

  // User registration - isAdmin is determined server-side only (never trust client-sent isAdmin)
  app.post('/api/register', async (req, res) => {
    const { name, email, password, phone } = req.body; // ignore isAdmin from client
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    try {
      const existing = await models.User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      // By default new users are not admins. To create an admin, use a separate server-side process or protected endpoint.
      const user = new models.User({ name, email, password: hashedPassword, phone, isAdmin: false });
      await user.save();
      res.status(201).json({ message: 'User registered' });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // User login
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    try {
      const user = await models.User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
// Get all reservations from DB
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await models.Reservation.find()
      .populate('user')
      .populate('restaurant')
      .populate('table');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Make a reservation and store in DB
app.post('/api/reservations', async (req, res) => {
  const { userId, restaurantId, tableId, guests, date, time } = req.body;
  if (!userId || !restaurantId || !tableId || !guests || !date || !time) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // Check for double booking
    const conflict = await models.Reservation.findOne({
      table: tableId,
      date: new Date(date),
      time: time
    });
    if (conflict) {
      return res.status(409).json({ error: 'Table already reserved at this time' });
    }
    const reservation = new models.Reservation({
      user: userId,
      restaurant: restaurantId,
      table: tableId,
      guests,
      date: new Date(date),
      time
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Update reservation (confirm/cancel/status)
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updates = {};
    if (status) updates.status = status;
    const r = await models.Reservation.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!r) return res.status(404).json({ error: 'Reservation not found' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Menu items CRUD
app.get('/api/menu', async (req, res) => {
  try {
    const items = await models.MenuItem.find().populate('restaurant');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.post('/api/menu', authMiddleware, async (req, res) => {
  const { restaurantId, name, price, category, description } = req.body;
  if (!name || typeof price === 'undefined') return res.status(400).json({ error: 'Missing fields' });
  try {
    const item = new models.MenuItem({ restaurant: restaurantId || null, name, price, category, description });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu/:id', authMiddleware, async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (typeof price !== 'undefined') updates.price = price;
    if (category) updates.category = category;
    if (description) updates.description = description;
    const item = await models.MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu/:id', authMiddleware, async (req, res) => {
  try {
    const it = await models.MenuItem.findByIdAndDelete(req.params.id);
    if (!it) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Update user details by ID
app.put('/api/user/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const update = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone
    };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await models.User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [f = '', l = ''] = (user.name || '').split(' ');
    res.json({
      id: user._id,
      firstName: f,
      lastName: l,
      email: user.email,
      phone: user.phone || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user details by ID
app.get('/api/user/:id', authMiddleware, async (req, res) => {
  try {
    // Only allow the owning user to fetch their profile
    if (!req.user || String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await models.User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Split name into first and last for frontend
    const [firstName = '', lastName = ''] = (user.name || '').split(' ');
    res.json({
      id: user._id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user details by email (fallback)
app.get('/api/user/email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await models.User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [firstName = '', lastName = ''] = (user.name || '').split(' ');
    res.json({ id: user._id, firstName, lastName, email: user.email, phone: user.phone || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user by email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
