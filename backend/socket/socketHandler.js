const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) {
          socket.user = user;
        }
      } catch (err) {
        // Allow unauthenticated connections for public rooms
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join tournament room for real-time updates
    socket.on('join_tournament', (tournamentId) => {
      socket.join(`tournament_${tournamentId}`);
      console.log(`Socket ${socket.id} joined tournament_${tournamentId}`);
    });

    // Leave tournament room
    socket.on('leave_tournament', (tournamentId) => {
      socket.leave(`tournament_${tournamentId}`);
    });

    // Join match room
    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
    });

    // Admin broadcasts match start
    socket.on('broadcast_match_start', ({ matchId, tournamentId }) => {
      if (socket.user && socket.user.role === 'admin') {
        io.to(`tournament_${tournamentId}`).emit('match_started', { matchId });
        io.to(`match_${matchId}`).emit('match_started', { matchId });
      }
    });

    // Real-time kill update
    socket.on('kill_update', ({ matchId, teamId, kills }) => {
      if (socket.user && socket.user.role === 'admin') {
        io.to(`match_${matchId}`).emit('kill_update', { matchId, teamId, kills });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
