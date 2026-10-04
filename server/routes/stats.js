const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const Athlete = require('../models/Athlete');
const Sport = require('../models/Sport');
const Federation = require('../models/Federation');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const groupBy = (field, limit = 20) => Athlete.aggregate([
  { $group: { _id: '$' + field, value: { $sum: 1 } } }, { $sort: { value: -1 } }, { $limit: limit },
  { $project: { _id: 0, label: '$_id', value: 1 } }]);

router.get('/', protect, adminOnly, async (_req, res, next) => {
  try {
    const since = new Date(); since.setMonth(since.getMonth() - 5); since.setDate(1); since.setHours(0, 0, 0, 0);
    const [athletes, sports, federations, events, perSport, perCategory, perGender, perCity, medalsRaw, leaderboard, monthly, recent] = await Promise.all([
      Athlete.countDocuments(), Sport.countDocuments(), Federation.countDocuments(), Event.countDocuments(),
      Athlete.aggregate([
        { $group: { _id: '$sport', value: { $sum: 1 } } },
        { $lookup: { from: 'sports', localField: '_id', foreignField: '_id', as: 's' } },
        { $project: { _id: 0, label: { $arrayElemAt: ['$s.sportName', 0] }, value: 1 } }, { $sort: { value: -1 } }]),
      groupBy('ageCategory'), groupBy('gender'), groupBy('city', 6),
      Registration.aggregate([{ $match: { medal: { $ne: 'None' } } }, { $group: { _id: '$medal', value: { $sum: 1 } } }]),
      Registration.aggregate([
        { $match: { medal: { $ne: 'None' } } },
        { $group: { _id: '$athlete', gold: { $sum: { $cond: [{ $eq: ['$medal', 'Gold'] }, 1, 0] } },
                    silver: { $sum: { $cond: [{ $eq: ['$medal', 'Silver'] }, 1, 0] } }, bronze: { $sum: { $cond: [{ $eq: ['$medal', 'Bronze'] }, 1, 0] } } } },
        { $sort: { gold: -1, silver: -1, bronze: -1 } }, { $limit: 5 },
        { $lookup: { from: 'athletes', localField: '_id', foreignField: '_id', as: 'a' } },
        { $project: { _id: 0, name: { $arrayElemAt: ['$a.name', 0] }, athleteId: { $arrayElemAt: ['$a.athleteId', 0] }, gold: 1, silver: 1, bronze: 1 } }]),
      Athlete.aggregate([{ $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, value: { $sum: 1 } } }]),
      Athlete.find().sort('-createdAt').limit(5).populate('sport', 'sportName').select('name athleteId sport createdAt'),
    ]);

    const byMonth = Object.fromEntries(monthly.map((m) => [m._id, m.value]));
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: d.toLocaleString('en-GB', { month: 'short' }), value: byMonth[key] || 0 });
    }
    const medals = { Gold: 0, Silver: 0, Bronze: 0 };
    medalsRaw.forEach((m) => { medals[m._id] = m.value; });
    res.json({ athletes, sports, federations, events, perSport, perCategory, perGender, perCity, medals, leaderboard, months, recent });
  } catch (e) { next(e); }
});

module.exports = router;
