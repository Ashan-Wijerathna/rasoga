const dotenv = require("dotenv");
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: require("path").join(__dirname, "../.env.local") });
} else {
  dotenv.config({ path: require("path").join(__dirname, "../.env") });
}

const { connectDB, sequelize } = require("../config/db");
const User = require("../models/User");
const School = require("../models/School");
const Event = require("../models/Event");
require("../models/FormField");
require("../models/FormSubmissionData");
const seedFormFields = require("./seedFormFields");

const seed = async () => {
  await connectDB();
  console.log("Connected to MySQL\n");

  const [admin, adminCreated] = await User.findOrCreate({
    where: { email: "admin@dhaham.lk" },
    defaults: {
      name: "System Admin",
      email: "admin@dhaham.lk",
      password: "Admin@123",
      role: "admin",
    },
  });
  console.log(
    adminCreated
      ? "✅ Admin created: admin@dhaham.lk / Admin@123"
      : "ℹ️  Admin already exists",
  );

  const schoolData = [
    {
      name: "Dhaham School Colombo",
      code: "DSC001",
      address: "12 Galle Road, Colombo 03",
      district: "Colombo",
      province: "Western",
      zone: "Zone 1",
      contactEmail: "colombo@dhaham.lk",
      contactPhone: "0112345678",
    },
    {
      name: "Dhaham School Kandy",
      code: "DSK001",
      address: "45 Peradeniya Road, Kandy",
      district: "Kandy",
      province: "Central",
      zone: "Zone 2",
      contactEmail: "kandy@dhaham.lk",
      contactPhone: "0812345678",
    },
    {
      name: "Dhaham School Galle",
      code: "DSG001",
      address: "22 Fort Road, Galle",
      district: "Galle",
      province: "Southern",
      zone: "Zone 3",
      contactEmail: "galle@dhaham.lk",
      contactPhone: "0912345678",
    },
  ];

  for (const s of schoolData) {
    const [school, schoolCreated] = await School.findOrCreate({
      where: { code: s.code },
      defaults: s,
    });
    const [, userCreated] = await User.findOrCreate({
      where: { email: s.contactEmail },
      defaults: {
        name: s.name,
        email: s.contactEmail,
        password: `Dhaham@${s.code}`,
        role: "school",
        schoolId: school.id,
      },
    });
    if (userCreated) {
      await school.update({
        userId: (await User.findOne({ where: { email: s.contactEmail } })).id,
      });
    }
    console.log(
      schoolCreated
        ? `✅ School created: ${s.name}`
        : `ℹ️  School already exists: ${s.name}`,
    );
  }

  const eventData = [
    {
      title: "Provincial Art Competition 2025",
      description:
        'Annual provincial-level art competition. Theme: "Harmony in Nature".',
      type: "provincial",
      category: "art",
      grades: ["6", "7", "8", "9", "10", "11"],
      eventDate: new Date("2025-08-15"),
      applicationDeadline: new Date("2025-07-30"),
      venue: "BMICH, Colombo",
      maxParticipants: 200,
      isActive: true,
      createdBy: admin.id,
    },
    {
      title: "Zonal Dhamma Quiz 2025",
      description: "Zonal-level Dhamma knowledge quiz for Grade 9–10.",
      type: "zonal",
      category: "academic",
      grades: ["9", "10"],
      eventDate: new Date("2025-07-10"),
      applicationDeadline: new Date("2025-06-25"),
      venue: "Temple Hall, Kandy",
      isActive: true,
      createdBy: admin.id,
    },
    {
      title: "School-Level Sports Meet 2025",
      description: "Annual sports meet for all Dhaham school students.",
      type: "school",
      category: "sports",
      grades: ["6", "7", "8", "9", "10", "11"],
      eventDate: new Date("2025-09-20"),
      applicationDeadline: new Date("2025-09-05"),
      venue: "Sugathadasa Stadium, Colombo",
      isActive: true,
      createdBy: admin.id,
    },
  ];

  for (const ev of eventData) {
    const [, created] = await Event.findOrCreate({
      where: { title: ev.title },
      defaults: ev,
    });
    console.log(
      created
        ? `✅ Event created: ${ev.title}`
        : `ℹ️  Event already exists: ${ev.title}`,
    );
  }

  await seedFormFields();

  console.log("\n🎉 Seed complete!");
  console.log("Admin login:  admin@dhaham.lk  /  Admin@123");
  console.log("School login: colombo@dhaham.lk  /  Dhaham@DSC001");
  await sequelize.close();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
