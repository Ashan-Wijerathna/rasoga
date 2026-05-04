const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ResozaSchoolRegistration = sequelize.define('ResozaSchoolRegistration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  registrationNumber: { type: DataTypes.STRING, unique: true },

  schoolName:          { type: DataTypes.STRING,  allowNull: false },
  schoolAddress:       { type: DataTypes.TEXT,    allowNull: false },
  educationZone:       { type: DataTypes.STRING,  allowNull: false },
  principalName:       { type: DataTypes.STRING,  allowNull: false },
  contactPersonName:   { type: DataTypes.STRING,  allowNull: false },

  schoolEmail:         { type: DataTypes.STRING,  allowNull: false },
  whatsappNumber:      { type: DataTypes.STRING,  allowNull: false },

  numberOfStudents:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  competencyLevels:    { type: DataTypes.JSON,    allowNull: true  },
  additionalNotes:     { type: DataTypes.TEXT,    allowNull: true  },

  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  adminNote: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'resoza_school_registrations',
  timestamps: true,
  indexes: [],
  hooks: {
    beforeCreate: async (reg) => {
      const count = await ResozaSchoolRegistration.count();
      reg.registrationNumber = 'RSZ-2026-' + String(count + 1).padStart(4, '0');
    },
  },
});

module.exports = ResozaSchoolRegistration;
