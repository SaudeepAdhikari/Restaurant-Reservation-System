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

// JWT middleware that only validates token and sets req.user (does not require isAdmin)
function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
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
app.post('/api/tables', jwtMiddleware, async (req, res) => {
  const { restaurantId, name, capacity } = req.body;
  if (!name || typeof capacity === 'undefined' || !restaurantId) return res.status(400).json({ error: 'Missing fields' });
  try {
    // verify restaurant ownership
    const rest = await models.Restaurant.findById(restaurantId);
    if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
    if (String(rest.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    const table = new models.Table({ restaurant: restaurantId, name, capacity, status: 'available' });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// Update a table
app.put('/api/tables/:id', jwtMiddleware, async (req, res) => {
  try {
    const updates = {};
    const { name, capacity, status } = req.body;
    if (name) updates.name = name;
    if (typeof capacity !== 'undefined') updates.capacity = capacity;
    if (status) updates.status = status;
  // ensure table exists and belongs to a restaurant owned by the user
  const table = await models.Table.findById(req.params.id).populate('restaurant');
  if (!table) return res.status(404).json({ error: 'Table not found' });
  if (!table.restaurant) return res.status(400).json({ error: 'Table has no restaurant' });
  if (String(table.restaurant.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(table, updates);
  await table.save();
  res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// Delete a table
app.delete('/api/tables/:id', jwtMiddleware, async (req, res) => {
  try {
  const t = await models.Table.findById(req.params.id).populate('restaurant');
  if (!t) return res.status(404).json({ error: 'Table not found' });
  if (!t.restaurant) return res.status(400).json({ error: 'Table has no restaurant' });
  if (String(t.restaurant.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  await models.Table.findByIdAndDelete(req.params.id);
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
  // For this deployment the register endpoint is used to create admin accounts from the admin UI.
  // New users created via this endpoint will be admins so they can access the admin panel.
  const user = new models.User({ name, email, password: hashedPassword, phone, isAdmin: true });
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

app.post('/api/menu', jwtMiddleware, async (req, res) => {
  const { restaurantId, name, price, category, description } = req.body;
  if (!name || typeof price === 'undefined') return res.status(400).json({ error: 'Missing fields' });
  try {
  if (!restaurantId) return res.status(400).json({ error: 'Missing restaurantId' });
  const rest = await models.Restaurant.findById(restaurantId);
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  if (String(rest.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  const item = new models.MenuItem({ restaurant: restaurantId, name, price, category, description });
  await item.save();
  res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu/:id', jwtMiddleware, async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (typeof price !== 'undefined') updates.price = price;
    if (category) updates.category = category;
    if (description) updates.description = description;
  const item = await models.MenuItem.findById(req.params.id).populate('restaurant');
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  if (!item.restaurant) return res.status(400).json({ error: 'Menu item has no restaurant' });
  if (String(item.restaurant.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(item, updates);
  await item.save();
  res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu/:id', jwtMiddleware, async (req, res) => {
  try {
  const it = await models.MenuItem.findById(req.params.id).populate('restaurant');
  if (!it) return res.status(404).json({ error: 'Menu item not found' });
  if (!it.restaurant) return res.status(400).json({ error: 'Menu item has no restaurant' });
  if (String(it.restaurant.owner) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  await models.MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get restaurants for the authenticated user
app.get('/api/restaurants', jwtMiddleware, async (req, res) => {
  try {
    const restaurants = await models.Restaurant.find({ owner: req.user.id });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Create a restaurant (owner is the authenticated user)
app.post('/api/restaurants', jwtMiddleware, async (req, res) => {
  try {
    const { name, location, description, cuisine, openingHours, contactInfo } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const rest = new models.Restaurant({ name, location, description, cuisine, openingHours, contactInfo, owner: req.user.id });
    await rest.save();
    res.status(201).json(rest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update user details by ID
app.put('/api/user/:id', authMiddleware, async (req, res) => {
  try {
    // Only allow owning user to update their profile
    if (!req.user || String(req.user.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });

    const { name, email, phone, password, oldPassword } = req.body;
    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof phone !== 'undefined') updates.phone = phone;

    // If changing password, verify oldPassword first
    if (password) {
      const user = await models.User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const match = await bcrypt.compare(oldPassword || '', user.password);
      if (!match) return res.status(401).json({ error: 'Current password incorrect' });
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await models.User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    const [firstName = '', lastName = ''] = (updatedUser.name || '').split(' ');
    res.json({ id: updatedUser._id, firstName, lastName, email: updatedUser.email, phone: updatedUser.phone || '' });
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
