const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('general', 'urgent', 'event', 'result'), defaultValue: 'general' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.INTEGER },
}, { tableName: 'announcements', timestamps: true, indexes: [] });

module.exports = Announcement;
