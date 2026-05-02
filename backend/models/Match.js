const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'completed'),
    defaultValue: 'scheduled',
  },
  winner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  round: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'matches',
  timestamps: true,
});

const MatchResult = sequelize.define('MatchResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  kills: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  placement: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'match_results',
  timestamps: true,
});

module.exports = { Match, MatchResult };
