const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');
router.get('/', protect, adminOnly, async (_req, res, next) => { try { res.json(await ActivityLog.find().sort('-createdAt').limit(100)); } catch (e) { next(e); } });
module.exports = router;
