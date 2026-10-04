const mongoose = require('mongoose');
const User = require('../models/User'), Sport = require('../models/Sport'), Federation = require('../models/Federation');
const Athlete = require('../models/Athlete'), Event = require('../models/Event'), Registration = require('../models/Registration');
const ActivityLog = require('../models/ActivityLog');

// Fills an empty database with an admin, a demo user and realistic sample data.
module.exports = async function seed(force = false) {
  if (!force && (await User.countDocuments())) return false;
  await Promise.all([User, Sport, Federation, Athlete, Event, Registration, ActivityLog].map((m) => m.deleteMany()));
  await mongoose.connection.collection('counters').deleteMany({});

  await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user123' });

  const sp = await Sport.create([
    { sportName: 'Cricket', category: 'Team', description: 'Bat-and-ball team sport' },
    { sportName: 'Athletics', category: 'Individual', description: 'Track and field' },
    { sportName: 'Hockey', category: 'Team', description: 'Field hockey' },
    { sportName: 'Squash', category: 'Individual', description: 'Racket sport' },
    { sportName: 'Boxing', category: 'Individual', description: 'Combat sport' },
  ]);
  const fe = await Federation.create([
    { federationName: 'Pakistan Cricket Board', president: 'TBD', contact: '042-0000001' },
    { federationName: 'Athletics Federation of Pakistan', president: 'TBD', contact: '051-0000002' },
    { federationName: 'Pakistan Hockey Federation', president: 'TBD', contact: '042-0000003' },
    { federationName: 'Pakistan Squash Federation', president: 'TBD', contact: '051-0000004' },
    { federationName: 'Pakistan Boxing Federation', president: 'TBD', contact: '042-0000005' },
  ]);

  // [name, father, age, gender, sportIdx, city, status]
  const people = [
    ['Ahmed Khan', 'Imran Khan', 17, 'Male', 0, 'Peshawar'], ['Usman Tariq', 'Tariq Mehmood', 22, 'Male', 0, 'Lahore'],
    ['Sana Malik', 'Tariq Malik', 24, 'Female', 1, 'Lahore'], ['Hira Noor', 'Noor Ahmed', 16, 'Female', 1, 'Haripur'],
    ['Bilal Raza', 'Asif Raza', 38, 'Male', 2, 'Haripur', 'Inactive'], ['Zain Ali', 'Ali Hassan', 26, 'Male', 2, 'Peshawar'],
    ['Faizan Shah', 'Shah Nawaz', 19, 'Male', 2, 'Abbottabad'], ['Mariam Yousaf', 'Yousaf Khan', 21, 'Female', 3, 'Islamabad'],
    ['Haris Gul', 'Gul Rehman', 28, 'Male', 3, 'Peshawar'], ['Nimra Iqbal', 'Iqbal Hussain', 18, 'Female', 4, 'Karachi'],
    ['Taimoor Butt', 'Butt Sahib', 33, 'Male', 4, 'Lahore', 'Suspended'], ['Ayesha Rauf', 'Rauf Ahmed', 15, 'Female', 1, 'Quetta'],
    ['Kamran Afridi', 'Afridi Khan', 41, 'Male', 3, 'Peshawar'], ['Rida Fatima', 'Fatima Ali', 23, 'Female', 1, 'Islamabad'],
  ];
  const athletes = [];
  for (const [i, p] of people.entries()) {
    athletes.push(await Athlete.create({ name: p[0], fatherName: p[1], age: p[2], gender: p[3], sport: sp[p[4]]._id,
      federation: fe[p[4]]._id, city: p[5], status: p[6] || 'Active', contact: `03${10 + i}-${1000000 + i * 7919}`,
      email: p[0].split(' ')[0].toLowerCase() + '@example.com' }));
  }

  const events = await Event.create([
    { title: 'National Athletics Championship', sport: sp[1]._id, venue: 'Punjab Stadium', city: 'Lahore', startDate: new Date('2026-03-14'), status: 'Completed', description: 'Annual national championship across track events.' },
    { title: 'KP Inter-District Hockey Cup', sport: sp[2]._id, venue: 'Peshawar Hockey Ground', city: 'Peshawar', startDate: new Date('2026-11-02'), status: 'Upcoming' },
    { title: 'National Squash Open', sport: sp[3]._id, venue: 'Jahangir Khan Squash Complex', city: 'Islamabad', startDate: new Date('2026-10-01'), status: 'Ongoing' },
  ]);
  const by = (sportIdx) => athletes.filter((a, i) => people[i][4] === sportIdx);
  const [track] = [by(1)];
  await Registration.create([
    { athlete: track[0]._id, event: events[0]._id, medal: 'Gold', position: 1 },
    { athlete: track[1]._id, event: events[0]._id, medal: 'Silver', position: 2 },
    { athlete: track[2]._id, event: events[0]._id, medal: 'Bronze', position: 3 },
    { athlete: track[3]._id, event: events[0]._id },
    ...by(2).map((a) => ({ athlete: a._id, event: events[1]._id })),
    { athlete: by(3)[0]._id, event: events[2]._id }, { athlete: by(3)[1]._id, event: events[2]._id },
  ]);
  return true;
};
