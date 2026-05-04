const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HeroSlide = sequelize.define('HeroSlide', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  publicId: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  subtitle: { type: DataTypes.STRING },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'hero_slides', timestamps: true, indexes: [] });

module.exports = HeroSlide;
