const mongoose = require('mongoose');
module.exports = mongoose.model('Federation', new mongoose.Schema({
  federationName: { type: String, required: [true, 'Federation name is required'], unique: true, trim: true },
  president: { type: String, trim: true },
  contact: { type: String, trim: true },
}));
