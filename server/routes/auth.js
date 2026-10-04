const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const payload = (u) => ({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role } });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'That email is already registered' });
    res.status(201).json(payload(await User.create({ name, email, password })));   // role is always "user"
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matches(password))) return res.status(401).json({ message: 'Incorrect email or password' });
    res.json(payload(user));
  } catch (e) { next(e); }
});
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
module.exports = router;
