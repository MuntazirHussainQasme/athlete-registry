const router = require('express').Router();
const Event = require('../models/Event');
const Athlete = require('../models/Athlete');
const Registration = require('../models/Registration');
const { protect, adminOnly } = require('../middleware/auth');
const log = require('../utils/log');

router.use(protect);

router.get('/', async (_req, res, next) => {
  try {
    const events = await Event.find().populate('sport', 'sportName').sort('-startDate').lean();
    const counts = await Registration.aggregate([{ $group: { _id: '$event', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(events.map((e) => ({ ...e, entries: map[String(e._id)] || 0 })));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('sport', 'sportName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const entries = await Registration.find({ event: event._id }).populate('athlete', 'name athleteId city ageCategory').sort('position');
    res.json({ event, entries });
  } catch (e) { next(e); }
});

router.post('/', adminOnly, async (req, res, next) => {
  try { const e = await Event.create(req.body); log(req, 'Created event', e.title); res.status(201).json(await e.populate('sport', 'sportName')); } catch (e) { next(e); }
});

router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const e = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('sport', 'sportName');
    if (!e) return res.status(404).json({ message: 'Event not found' });
    log(req, 'Updated event', e.title);
    res.json(e);
  } catch (e) { next(e); }
});

router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const e = await Event.findByIdAndDelete(req.params.id);
    if (!e) return res.status(404).json({ message: 'Event not found' });
    await Registration.deleteMany({ event: e._id });
    log(req, 'Deleted event', e.title);
    res.json({ message: 'Event deleted' });
  } catch (e) { next(e); }
});

// Enter an athlete (must play the event's sport)
router.post('/:id/entries', adminOnly, async (req, res, next) => {
  try {
    const [event, athlete] = await Promise.all([Event.findById(req.params.id), Athlete.findById(req.body.athlete)]);
    if (!event || !athlete) return res.status(404).json({ message: 'Event or athlete not found' });
    if (String(athlete.sport) !== String(event.sport)) return res.status(400).json({ message: `${athlete.name} does not play this event's sport` });
    if (await Registration.exists({ event: event._id, athlete: athlete._id })) return res.status(409).json({ message: `${athlete.name} is already entered` });
    const r = await Registration.create({ event: event._id, athlete: athlete._id });
    log(req, 'Entered athlete in event', `${athlete.name} → ${event.title}`);
    res.status(201).json(await r.populate('athlete', 'name athleteId city ageCategory'));
  } catch (e) { next(e); }
});

router.put('/:id/entries/:entryId', adminOnly, async (req, res, next) => {
  try {
    const { medal, position } = req.body;
    const r = await Registration.findOneAndUpdate({ _id: req.params.entryId, event: req.params.id },
      { medal, position: position || undefined }, { new: true, runValidators: true }).populate('athlete', 'name athleteId city ageCategory');
    if (!r) return res.status(404).json({ message: 'Entry not found' });
    log(req, 'Recorded result', `${r.athlete.name}: ${r.medal}${r.position ? ' (position ' + r.position + ')' : ''}`);
    res.json(r);
  } catch (e) { next(e); }
});

router.delete('/:id/entries/:entryId', adminOnly, async (req, res, next) => {
  try {
    const r = await Registration.findOneAndDelete({ _id: req.params.entryId, event: req.params.id }).populate('athlete', 'name');
    if (!r) return res.status(404).json({ message: 'Entry not found' });
    log(req, 'Withdrew athlete from event', r.athlete?.name);
    res.json({ message: 'Entry removed' });
  } catch (e) { next(e); }
});

module.exports = router;
