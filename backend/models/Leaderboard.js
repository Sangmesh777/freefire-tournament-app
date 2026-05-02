const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Leaderboard = sequelize.define('Leaderboard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'null means global leaderboard',
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_kills: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'leaderboard',
  timestamps: true,
});

module.exports = Leaderboard;
