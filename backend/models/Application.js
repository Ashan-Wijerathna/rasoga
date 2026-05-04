const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    registrationNumber: { type: DataTypes.STRING, unique: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    schoolId: { type: DataTypes.INTEGER, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    dateOfBirth: { type: DataTypes.DATE, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    grade: { type: DataTypes.STRING, allowNull: false },
    schoolName: { type: DataTypes.STRING, allowNull: false },
    passportPhotoUrl: { type: DataTypes.STRING },
    birthCertificateUrl: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    adminNote: { type: DataTypes.TEXT },
    reviewedBy: { type: DataTypes.INTEGER },
    reviewedAt: { type: DataTypes.DATE },
    emailSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    applicationType: {
      type: DataTypes.ENUM("individual", "group"),
      defaultValue: "individual",
      allowNull: false,
    },
    groupName: { type: DataTypes.STRING },
    groupMembers: { type: DataTypes.JSON },
    groupSize: { type: DataTypes.INTEGER },

    studentNameSinhala: { type: DataTypes.STRING, allowNull: true },
    studentNameEnglish: { type: DataTypes.STRING, allowNull: true },

    regionalEducationZone: { type: DataTypes.STRING, allowNull: true },
    diocese: { type: DataTypes.STRING, allowNull: true },

    competencyAssessment: { type: DataTypes.STRING, allowNull: true },
    competencyDescription: { type: DataTypes.TEXT, allowNull: true },

    classTeacherName: { type: DataTypes.STRING, allowNull: true },
    classTeacherSignatureUrl: { type: DataTypes.STRING, allowNull: true },
    principalSignatureUrl: { type: DataTypes.STRING, allowNull: true },
    officialSealUrl: { type: DataTypes.STRING, allowNull: true },

    round1Date: { type: DataTypes.DATE, allowNull: true },
    round1StudentNumber: { type: DataTypes.STRING, allowNull: true },
    round1CompetencyAssessment: { type: DataTypes.STRING, allowNull: true },
    round1EvaluatorSignature: { type: DataTypes.STRING, allowNull: true },

    finalStudentNumber: { type: DataTypes.STRING, allowNull: true },
    finalCompetencyAssessment: { type: DataTypes.STRING, allowNull: true },
    finalRankObtained: { type: DataTypes.STRING, allowNull: true },
    finalEvaluatorSignature: { type: DataTypes.STRING, allowNull: true },

    formType: {
      type: DataTypes.ENUM("standard", "resoza2026"),
      defaultValue: "standard",
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    indexes: [],
    hooks: {
      beforeCreate: async (app) => {
        const count = await Application.count();
        const year = new Date().getFullYear();
        app.registrationNumber =
          "DHS-" + year + "-" + String(count + 1).padStart(5, "0");
      },
    },
  },
);

module.exports = Application;
