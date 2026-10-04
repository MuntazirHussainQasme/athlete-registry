const ActivityLog = require('../models/ActivityLog');
// Fire-and-forget audit trail; never blocks or breaks a request.
module.exports = (req, action, detail) => ActivityLog.create({ user: req.user.name, action, detail }).catch(() => {});
