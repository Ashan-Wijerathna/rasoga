const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("school", "zonal", "provincial"),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "art",
        "sports",
        "academic",
        "cultural",
        "religious",
        "other",
      ),
      defaultValue: "other",
    },
    grades: { type: DataTypes.JSON, allowNull: false },
    eventDate: { type: DataTypes.DATE, allowNull: false },
    applicationDeadline: { type: DataTypes.DATE, allowNull: false },
    venue: { type: DataTypes.STRING, allowNull: false },
    maxParticipants: { type: DataTypes.INTEGER },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    bannerImageUrl: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.INTEGER },
    eventMode: {
      type: DataTypes.ENUM("individual", "group"),
      defaultValue: "individual",
      allowNull: false,
    },
    groupMinSize: { type: DataTypes.INTEGER, defaultValue: 2 },
    groupMaxSize: { type: DataTypes.INTEGER, defaultValue: 5 },
  },
  { tableName: "events", timestamps: true, indexes: [] },
);

module.exports = Event;
