const mongoose = require('mongoose');
module.exports = mongoose.model('Event', new mongoose.Schema({
  title: { type: String, required: [true, 'Event title is required'], trim: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: [true, 'Sport is required'] },
  venue: { type: String, trim: true },
  city: { type: String, trim: true },
  startDate: { type: Date, required: [true, 'Start date is required'] },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  description: { type: String, trim: true },
}, { timestamps: true }));
