const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { connectDB } = require("./config/db");
const User = require("./models/User");
const School = require("./models/School");
const Event = require("./models/Event");
const Application = require("./models/Application");
const Result = require("./models/Result");
const Announcement = require("./models/Announcement");
const ResozaSchoolRegistration = require("./models/ResozaSchoolRegistration");
const FormField = require("./models/FormField");
const FormSubmissionData = require("./models/FormSubmissionData");
const Permission = require("./models/Permission");

User.belongsTo(School, { foreignKey: "schoolId", as: "school" });
School.hasOne(User, { foreignKey: "schoolId", as: "user" });
Application.belongsTo(Event, { foreignKey: "eventId", as: "event" });
Application.belongsTo(School, { foreignKey: "schoolId", as: "school" });
Result.belongsTo(Event, { foreignKey: "eventId", as: "event" });
Event.hasMany(Application, { foreignKey: "eventId", as: "applications" });
School.hasMany(Application, { foreignKey: "schoolId", as: "applications" });
FormField.hasMany(FormSubmissionData, {
  foreignKey: "fieldId",
  as: "submissions",
});
FormSubmissionData.belongsTo(FormField, { foreignKey: "fieldId", as: "field" });
User.hasMany(Permission, { foreignKey: "userId", as: "userPermissions" });
Permission.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(helmet());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://www.rasogha.com",
      "https://rasogha.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => req.path.includes("/auth/me"),
});
app.use("/api/", limiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/schools", require("./routes/schoolRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/slides", require("./routes/slideRoutes"));
app.use("/api/resoza", require("./routes/resozaRoutes"));
app.use("/api/form-fields", require("./routes/formBuilderRoutes"));
app.use("/api/permissions", require("./routes/permissionRoutes"));
app.use(
  "/uploads/custom-fields",
  express.static(path.join(__dirname, "uploads/custom-fields")),
);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "Dhaham EMS API running" }),
);


app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    process.stdout.write('Rasogha EMS running on port ' + PORT + '\n');
  });
});
