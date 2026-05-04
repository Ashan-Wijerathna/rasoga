const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Result = sequelize.define('Result', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId: { type: DataTypes.INTEGER, allowNull: false },
  entries: { type: DataTypes.JSON, defaultValue: [] },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  publishedAt: { type: DataTypes.DATE },
  createdBy: { type: DataTypes.INTEGER },
  updatedBy: { type: DataTypes.INTEGER },
}, { tableName: 'results', timestamps: true, indexes: [] });

module.exports = Result;
