const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  medal: { type: String, enum: ['None', 'Gold', 'Silver', 'Bronze'], default: 'None' },
  position: { type: Number, min: [1, 'Position starts at 1'] },
}, { timestamps: true });
schema.index({ athlete: 1, event: 1 }, { unique: true });
module.exports = mongoose.model('Registration', schema);
