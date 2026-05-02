require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/db');

// Models
const User = require('./models/User');
const { Team, TeamMember } = require('./models/Team');
const { Tournament, TournamentRegistration } = require('./models/Tournament');
const { Match, MatchResult } = require('./models/Match');
const Leaderboard = require('./models/Leaderboard');

// ─── Associations ─────────────────────────────────────────────────────────────

// User ↔ Team
Team.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });
User.hasMany(Team, { foreignKey: 'captain_id', as: 'captainedTeams' });

// Team ↔ TeamMember ↔ User
Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(TeamMember, { foreignKey: 'user_id', as: 'teamMemberships' });

// Tournament ↔ User (creator)
Tournament.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Tournament, { foreignKey: 'created_by', as: 'createdTournaments' });

// Tournament ↔ TournamentRegistration ↔ Team
Tournament.hasMany(TournamentRegistration, { foreignKey: 'tournament_id', as: 'registrations' });
TournamentRegistration.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
TournamentRegistration.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Team.hasMany(TournamentRegistration, { foreignKey: 'team_id', as: 'tournamentRegistrations' });

// Match ↔ Tournament
Match.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
Tournament.hasMany(Match, { foreignKey: 'tournament_id', as: 'matches' });

// Match ↔ Teams
Match.belongsTo(Team, { foreignKey: 'team1_id', as: 'team1' });
Match.belongsTo(Team, { foreignKey: 'team2_id', as: 'team2' });
Match.belongsTo(Team, { foreignKey: 'winner_id', as: 'winner' });

// Match ↔ MatchResult
Match.hasMany(MatchResult, { foreignKey: 'match_id', as: 'results' });
MatchResult.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
MatchResult.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

// Leaderboard ↔ Team / Tournament
Leaderboard.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Leaderboard.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
Team.hasMany(Leaderboard, { foreignKey: 'team_id', as: 'leaderboardEntries' });

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Socket.io
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io enabled`);
  });
});
