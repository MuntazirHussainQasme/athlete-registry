require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seed = require('./utils/seedData');
const Sport = require('./models/Sport');
const Federation = require('./models/Federation');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/athletes', require('./routes/athletes'));
app.use('/api/sports', require('./routes/lookups')(Sport, 'sport', 'sport', 'sportName'));
app.use('/api/federations', require('./routes/lookups')(Federation, 'federation', 'federation', 'federationName'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/stats', require('./routes/stats'));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('. ') });
  if (err.code === 11000) return res.status(409).json({ message: 'That value already exists' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

connectDB()
  .then(async () => { if (await seed()) console.log('Empty database: loaded sample data (admin@example.com / admin123)'); })
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')))
  .catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });
