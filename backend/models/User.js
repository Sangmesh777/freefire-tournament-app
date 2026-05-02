const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ign: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'In-game name',
  },
  ff_uid: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Free Fire UID',
  },
  profile_pic: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('player', 'admin'),
    defaultValue: 'player',
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
