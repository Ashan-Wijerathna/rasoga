const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FormSubmissionData = sequelize.define('FormSubmissionData', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  submissionType: {
    type: DataTypes.ENUM('school_registration', 'event_application'),
    allowNull: false,
  },
  submissionId: { type: DataTypes.INTEGER, allowNull: false },
  fieldId: { type: DataTypes.INTEGER, allowNull: true },
  fieldName: { type: DataTypes.STRING, allowNull: false },
  fieldValue: { type: DataTypes.TEXT, allowNull: true },
  fieldValueJson: { type: DataTypes.JSON, allowNull: true },
  fileUrl: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'form_submission_data',
  timestamps: true,
  indexes: [],
});

module.exports = FormSubmissionData;
