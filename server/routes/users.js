const router = require('express').Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const log = require('../utils/log');

router.use(protect, adminOnly);
router.get('/', async (_req, res, next) => { try { res.json(await User.find().sort('-createdAt')); } catch (e) { next(e); } });

router.put('/:id/role', async (req, res, next) => {
  try {
    if (!['admin', 'user'].includes(req.body.role)) return res.status(400).json({ message: 'Role must be admin or user' });
    if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot change your own role' });
    const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!u) return res.status(404).json({ message: 'User not found' });
    log(req, 'Changed user role', `${u.name} → ${u.role}`);
    res.json(u);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account' });
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    log(req, 'Deleted user', u.name);
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
