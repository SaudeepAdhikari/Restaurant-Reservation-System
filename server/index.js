const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory data for demo
let tables = [
  { id: 1, seats: 2 },
  { id: 2, seats: 4 },
  { id: 3, seats: 6 }
];
let reservations = [];

// Get all tables
app.get('/api/tables', (req, res) => {
  res.json(tables);
});

// Get all reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// Make a reservation
app.post('/api/reservations', (req, res) => {
  const { name, tableId, time } = req.body;
  if (!name || !tableId || !time) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const table = tables.find(t => t.id === tableId);
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }
  // Check for double booking
  const conflict = reservations.find(r => r.tableId === tableId && r.time === time);
  if (conflict) {
    return res.status(409).json({ error: 'Table already reserved at this time' });
  }
  const reservation = { id: reservations.length + 1, name, tableId, time };
  reservations.push(reservation);
  res.status(201).json(reservation);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
