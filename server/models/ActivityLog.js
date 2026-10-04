const mongoose = require('mongoose');
module.exports = mongoose.model('ActivityLog', new mongoose.Schema({
  user: String, action: String, detail: String, createdAt: { type: Date, default: Date.now },
}));
