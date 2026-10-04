# Athlete Registration and Management System v2 (MERN)

## Run it (Node 18+)
Easiest: use the built-in database. `server/.env.example` already has `MONGO_URI=memory`, which stores data in `server/.data`.
No Atlas account or MongoDB install is needed. The first start downloads a MongoDB binary (about 100 MB).

```bash
# Terminal 1: API
cd server
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
npm run dev                 # http://localhost:5000  (loads sample data on first run)

# Terminal 2: client
cd client
npm install
copy .env.example .env
npm run dev                 # http://localhost:5173
```
Logins: `admin@example.com / admin123` (admin) and `user@example.com / user123` (viewer).

To use Atlas or a local MongoDB instead, set `MONGO_URI` in `server/.env`. To reset sample data run `npm run seed`
(stop the dev server first when using `MONGO_URI=memory`).

## What's new in v2
- **Athlete bib IDs** (ATH-0001), auto-generated and permanent.
- **Athletes**: pagination, sorting, search by name or ID, more filters (gender, status), table/cards views, detail drawer with event history, CSV export (admin), email and notes fields.
- **Events**: create events, enter athletes (only those who play the event's sport), record positions and gold/silver/bronze.
- **Dashboard**: totals, athletes by sport, age and gender donuts, 6-month registrations, top cities, medal table and leaderboard, recent registrations.
- **Users** (admin): promote or demote roles, delete accounts.
- **Activity log** (admin): who changed what.

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/athletes?q=&sport=&category=&gender=&status=&city=&sort=&page=&limit= | logged in |
| GET | /api/athletes/:id | logged in (athlete + event history) |
| GET | /api/athletes/export | admin (CSV) |
| POST / PUT / DELETE | /api/athletes[/:id] | admin |
| GET / POST / DELETE | /api/sports, /api/federations | read: logged in, write: admin |
| GET | /api/events, /api/events/:id | logged in |
| POST / PUT / DELETE | /api/events[/:id] | admin |
| POST / PUT / DELETE | /api/events/:id/entries[/:entryId] | admin |
| GET / PUT / DELETE | /api/users, /api/users/:id/role, /api/users/:id | admin |
| GET | /api/activity, /api/stats | admin |
