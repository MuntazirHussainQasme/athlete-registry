const router = require('express').Router();
const Athlete = require('../models/Athlete');
const Registration = require('../models/Registration');
const { protect, adminOnly } = require('../middleware/auth');
const log = require('../utils/log');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populate = [{ path: 'sport', select: 'sportName category' }, { path: 'federation', select: 'federationName' }];
const SORTS = { newest: '-createdAt', name: 'name', age: 'age', city: 'city' };

function filterFrom(q) {
  const f = {};
  if (q.q) f.$or = [{ name: new RegExp(esc(q.q), 'i') }, { athleteId: new RegExp(esc(q.q), 'i') }];
  if (q.city) f.city = new RegExp(esc(q.city), 'i');
  for (const k of ['sport', 'federation', 'gender', 'status']) if (q[k]) f[k] = q[k];
  if (q.category) f.ageCategory = q.category;
  return f;
}

router.use(protect);

// CSV export of the current filter (admin)
router.get('/export', adminOnly, async (req, res, next) => {
  try {
    const rows = await Athlete.find(filterFrom(req.query)).populate(populate).sort('athleteId');
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['ID', 'Name', "Father's name", 'Age', 'Category', 'Gender', 'Sport', 'Federation', 'City', 'Contact', 'Email', 'Status'];
    const lines = rows.map((a) => [a.athleteId, a.name, a.fatherName, a.age, a.ageCategory, a.gender, a.sport?.sportName,
      a.federation?.federationName, a.city, a.contact, a.email, a.status].map(cell).join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="athletes.csv"');
    res.send([head.map(cell).join(','), ...lines].join('\n'));
  } catch (e) { next(e); }
});

// GET /api/athletes?q=&sport=&category=&city=&gender=&status=&sort=newest|name|age|city&page=1&limit=12
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const filter = filterFrom(req.query);
    const [items, total] = await Promise.all([
      Athlete.find(filter).populate(populate).sort(SORTS[req.query.sort] || SORTS.newest).skip((page - 1) * limit).limit(limit),
      Athlete.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const athlete = await Athlete.findById(req.params.id).populate(populate);
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });
    const entries = await Registration.find({ athlete: athlete._id }).populate('event', 'title startDate city status').sort('-createdAt');
    res.json({ athlete, entries });
  } catch (e) { next(e); }
});

router.post('/', adminOnly, async (req, res, next) => {
  try {
    const a = await Athlete.create(req.body);
    log(req, 'Added athlete', `${a.name} (${a.athleteId})`);
    res.status(201).json(await a.populate(populate));
  } catch (e) { next(e); }
});

router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const a = await Athlete.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Athlete not found' });
    const { athleteId, ...rest } = req.body;       // the bib number never changes
    a.set(rest);
    await a.save();
    log(req, 'Updated athlete', `${a.name} (${a.athleteId})`);
    res.json(await a.populate(populate));
  } catch (e) { next(e); }
});

router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const a = await Athlete.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Athlete not found' });
    await Registration.deleteMany({ athlete: a._id });
    log(req, 'Deleted athlete', `${a.name} (${a.athleteId})`);
    res.json({ message: 'Athlete deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
