const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const Athlete = require('../models/Athlete');
const log = require('../utils/log');

module.exports = (Model, athleteField, label, nameKey) => {
  const router = express.Router();
  router.use(protect);
  router.get('/', async (_req, res, next) => { try { res.json(await Model.find().sort('createdAt')); } catch (e) { next(e); } });
  router.post('/', adminOnly, async (req, res, next) => {
    try { const d = await Model.create(req.body); log(req, `Added ${label}`, d[nameKey]); res.status(201).json(d); } catch (e) { next(e); }
  });
  router.delete('/:id', adminOnly, async (req, res, next) => {
    try {
      if (await Athlete.exists({ [athleteField]: req.params.id }))
        return res.status(409).json({ message: 'Athletes are still assigned to this entry. Reassign or remove them first' });
      const d = await Model.findByIdAndDelete(req.params.id);
      if (d) log(req, `Deleted ${label}`, d[nameKey]);
      res.json({ message: 'Deleted' });
    } catch (e) { next(e); }
  });
  return router;
};
