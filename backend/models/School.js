const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const School = sequelize.define('School', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  district: { type: DataTypes.STRING, allowNull: false },
  province: { type: DataTypes.STRING, allowNull: false },
  zone: { type: DataTypes.STRING, allowNull: false },
  contactEmail: { type: DataTypes.STRING, allowNull: false },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
  principalName: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  userId: { type: DataTypes.INTEGER },
}, { tableName: 'schools', timestamps: true, indexes: [] });

module.exports = School;
