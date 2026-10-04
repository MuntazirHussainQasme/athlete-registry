const mongoose = require('mongoose');
module.exports = mongoose.model('Sport', new mongoose.Schema({
  sportName: { type: String, required: [true, 'Sport name is required'], unique: true, trim: true },
  category: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
  description: { type: String, trim: true },
}));
