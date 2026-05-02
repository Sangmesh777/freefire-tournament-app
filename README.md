# 🔥 Free Fire Max Tournament App

A complete full-stack **Free Fire Max Tournament Management App** built with React Native (Expo), Node.js, MySQL and real-time capabilities.

![Free Fire Tournament App](https://img.shields.io/badge/Free%20Fire-Tournament%20App-orange?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-Sequelize-blue?style=for-the-badge)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| 📱 Mobile | React Native + Expo |
| ⚙️ Backend | Node.js + Express.js |
| 🗄️ Database | MySQL + Sequelize ORM |
| 🔐 Auth | Phone OTP via Twilio + JWT |
| 📡 Real-time | Socket.io |
| 🖼️ Storage | Cloudinary |

---

## 📁 Project Structure

```
freefire-tournament-app/
├── backend/
│   ├── config/db.js              # MySQL + Sequelize connection
│   ├── controllers/              # Route handlers
│   │   ├── authController.js     # OTP login/register
│   │   ├── profileController.js  # User profile
│   │   ├── tournamentController.js
│   │   ├── teamController.js
│   │   ├── matchController.js
│   │   ├── leaderboardController.js
│   │   └── adminController.js
│   ├── models/                   # Sequelize models
│   │   ├── User.js
│   │   ├── Team.js               # Team + TeamMember
│   │   ├── Tournament.js         # Tournament + Registration
│   │   ├── Match.js              # Match + MatchResult
│   │   └── Leaderboard.js
│   ├── routes/                   # Express routers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect + adminOnly
│   │   └── uploadMiddleware.js   # Cloudinary multer
│   ├── socket/socketHandler.js   # Socket.io events
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── mobile/
    ├── src/
    │   ├── screens/              # 11 fully built screens
    │   ├── components/           # Reusable UI components
    │   ├── navigation/           # Stack + Bottom Tab navigator
    │   ├── context/AuthContext.js
    │   ├── api/apiService.js     # Axios API calls
    │   └── utils/helpers.js
    ├── App.js
    ├── app.json
    └── package.json
```

---

## ✅ Features

### 🔐 Authentication
- Send OTP to phone number via **Twilio**
- Verify OTP → issue **JWT token**
- Secure routes with `authMiddleware`
- Admin-only routes with `adminOnly` guard

### 👤 Player Profile
- Register with phone, in-game name (IGN), Free Fire UID
- Upload profile picture → stored on **Cloudinary**
- View & edit profile

### 👥 Team Management
- Create a team (name, logo, max 4 players)
- Captain can add/remove members
- View team details and member list

### 🏆 Tournament
- Admin creates tournaments with prize pool, entry fee, max teams
- Teams register for tournaments
- View tournament brackets & registered teams
- Filter tournaments by status (upcoming/ongoing/completed)

### 🎮 Match Management
- Admin schedules matches between teams
- Update match status (scheduled → live → completed)
- Submit match results (kills, placement, points)
- Real-time match updates via **Socket.io**

### 📊 Leaderboard
- Per-tournament leaderboard
- Global leaderboard across all tournaments
- Top 3 podium display
- Points-based ranking with kills tiebreaker

### 🔔 Real-time Notifications
- Match start / live events via Socket.io
- Match result updates pushed to clients
- Kill counter updates in real-time

### 🛠️ Admin Panel
- Dashboard stats (users, teams, tournaments, matches)
- Create / delete tournaments
- Manage user roles (player ↔ admin)
- Monitor all platform data

---

## 🗄️ Database Schema

| Table | Key Fields |
|-------|-----------|
| `users` | id, phone, name, ign, ff_uid, profile_pic, role |
| `teams` | id, name, logo, captain_id |
| `team_members` | id, team_id, user_id |
| `tournaments` | id, name, start_date, end_date, prize_pool, max_teams, entry_fee, status |
| `tournament_registrations` | id, tournament_id, team_id, registered_at |
| `matches` | id, tournament_id, team1_id, team2_id, scheduled_at, status, winner_id, round |
| `match_results` | id, match_id, team_id, kills, placement, points |
| `leaderboard` | id, tournament_id, team_id, total_kills, total_points, rank |

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- Twilio account (for OTP)
- Cloudinary account (for images)

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Environment Variables

Create `backend/.env` based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=freefire_tournament
DB_USER=root
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MySQL Setup

```sql
CREATE DATABASE freefire_tournament;
```

The app will automatically create all tables on first run via Sequelize `sync({ alter: true })`.

---

## 📱 Mobile Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (or Android/iOS emulator)

### Installation

```bash
cd mobile
npm install
```

### Configure API URL

Edit `mobile/src/api/apiService.js`:
```js
const BASE_URL = 'http://YOUR_PC_IP:5000/api'; // e.g., http://192.168.1.100:5000/api
```

> ⚠️ Use your machine's local IP (not `localhost`) so the phone can reach it.

### Run the App

```bash
cd mobile
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT |
| GET | `/api/auth/me` | Get current user (🔐) |
| PUT | `/api/auth/profile` | Update profile (🔐) |

### Tournaments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tournaments` | List all tournaments |
| GET | `/api/tournaments/:id` | Get tournament details |
| POST | `/api/tournaments` | Create tournament (👑 Admin) |
| PUT | `/api/tournaments/:id` | Update tournament (👑 Admin) |
| DELETE | `/api/tournaments/:id` | Delete tournament (👑 Admin) |
| POST | `/api/tournaments/:id/register` | Register team (🔐) |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all teams |
| GET | `/api/teams/:id` | Get team details |
| POST | `/api/teams` | Create team (🔐) |
| PUT | `/api/teams/:id` | Update team (🔐 Captain) |
| POST | `/api/teams/:id/members` | Add member (🔐 Captain) |
| DELETE | `/api/teams/:id/members/:uid` | Remove member (🔐 Captain) |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List matches |
| GET | `/api/matches/:id` | Get match details |
| POST | `/api/matches` | Create match (👑 Admin) |
| PUT | `/api/matches/:id` | Update match (👑 Admin) |
| POST | `/api/matches/:id/result` | Submit result (👑 Admin) |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get global leaderboard |
| GET | `/api/leaderboard?tournament_id=X` | Get tournament leaderboard |
| POST | `/api/leaderboard/recalculate/:id` | Recalculate (👑 Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## 📡 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_tournament` | `tournamentId` | Subscribe to tournament updates |
| `leave_tournament` | `tournamentId` | Unsubscribe |
| `join_match` | `matchId` | Subscribe to match updates |
| `leave_match` | `matchId` | Unsubscribe |
| `broadcast_match_start` | `{ matchId, tournamentId }` | Admin: broadcast match start |
| `kill_update` | `{ matchId, teamId, kills }` | Admin: update kills live |

### Server → Client
| Event | Description |
|-------|-------------|
| `match_scheduled` | New match scheduled |
| `match_updated` | Match status changed |
| `match_live` | Match is now live |
| `match_started` | Match started broadcast |
| `match_result` | Match results submitted |
| `kill_update` | Live kill update |

---

## 🎨 UI Theme

- **Background:** `#0a0a0a` (Near black)
- **Cards:** `#111111`
- **Primary:** `#FF6B00` (Fire orange)
- **Success:** `#00C853` (Green)
- **Danger:** `#FF3B30` (Red)
- **Text:** `#FFFFFF` / `#888888`

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — Free to use and modify.
