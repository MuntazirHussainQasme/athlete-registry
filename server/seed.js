// npm run seed  ->  wipes the database and loads fresh sample data
require('dotenv').config();
const connectDB = require('./config/db');
const seed = require('./utils/seedData');
connectDB().then(() => seed(true)).then(() => {
  console.log('Seeded. Admin: admin@example.com / admin123   User: user@example.com / user123');
  process.exit(0);
}).catch((e) => { console.error(e.message); process.exit(1); });
