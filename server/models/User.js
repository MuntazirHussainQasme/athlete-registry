const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
           match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password needs at least 6 characters'], select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matches = function (plain) { return bcrypt.compare(plain, this.password); };
module.exports = mongoose.model('User', userSchema);
