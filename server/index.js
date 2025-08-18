
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


// Get all tables from DB
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await models.Table.find().populate('restaurant');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'your_jwt_secret'; // Change this in production
  }
});

  // User registration
  app.post('/api/register', async (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    try {
      const existing = await models.User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new models.User({ name, email, password: hashedPassword, isAdmin: !!isAdmin });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
