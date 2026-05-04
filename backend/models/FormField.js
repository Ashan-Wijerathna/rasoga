const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FormField = sequelize.define('FormField', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  formType: {
    type: DataTypes.ENUM('school_registration', 'event_application'),
    allowNull: false,
  },
  fieldName: { type: DataTypes.STRING, allowNull: false },
  fieldLabel: { type: DataTypes.STRING, allowNull: false },
  fieldLabelSinhala: { type: DataTypes.STRING, allowNull: true },
  fieldType: {
    type: DataTypes.ENUM(
      'text', 'textarea', 'email', 'tel', 'number', 'date',
      'select', 'radio', 'checkbox',
      'file_image', 'file_pdf', 'file_any'
    ),
    allowNull: false,
  },
  fieldOptions: { type: DataTypes.JSON, allowNull: true },
  isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  placeholder: { type: DataTypes.STRING, allowNull: true },
  placeholderSinhala: { type: DataTypes.STRING, allowNull: true },
  helpText: { type: DataTypes.STRING, allowNull: true },
  helpTextSinhala: { type: DataTypes.STRING, allowNull: true },
  validationRules: { type: DataTypes.JSON, allowNull: true },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  section: { type: DataTypes.STRING, allowNull: true },
  sectionSinhala: { type: DataTypes.STRING, allowNull: true },
  showOnStep: { type: DataTypes.INTEGER, allowNull: true },
  visibleToRoles: { type: DataTypes.JSON, defaultValue: ['public'] },
  adminOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
  eventId: { type: DataTypes.INTEGER, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'form_fields',
  timestamps: true,
  indexes: [],
});

module.exports = FormField;
