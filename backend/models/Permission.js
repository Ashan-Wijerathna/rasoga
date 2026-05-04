const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Permission = sequelize.define('Permission', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  module: {
    type: DataTypes.ENUM(
      'applications', 'events', 'results', 'schools',
      'users', 'reports', 'slides', 'resoza', 'formBuilder'
    ),
    allowNull: false,
  },
  canView:   { type: DataTypes.BOOLEAN, defaultValue: false },
  canCreate: { type: DataTypes.BOOLEAN, defaultValue: false },
  canEdit:   { type: DataTypes.BOOLEAN, defaultValue: false },
  canDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'permissions', timestamps: true });

module.exports = Permission;
