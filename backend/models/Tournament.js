const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  prize_pool: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  max_teams: {
    type: DataTypes.INTEGER,
    defaultValue: 16,
  },
  entry_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
    defaultValue: 'upcoming',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tournaments',
  timestamps: true,
});

const TournamentRegistration = sequelize.define('TournamentRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tournament_registrations',
  timestamps: false,
});

module.exports = { Tournament, TournamentRegistration };
