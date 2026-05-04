const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const School = require("../models/School");
const User = require("../models/User");

const DISTRICT_CODES = {
  colombo: "CMB",
  kandy: "KDY",
  galle: "GLE",
  matara: "MAT",
  gampaha: "GMP",
  kurunegala: "KRL",
  ratnapura: "RAT",
  badulla: "BDL",
  ampara: "AMP",
  anuradhapura: "ANR",
  batticaloa: "BAT",
  hambantota: "HMB",
  jaffna: "JFN",
  kalutara: "KLT",
  kegalle: "KGL",
  kilinochchi: "KLN",
  mannar: "MNR",
  matale: "MTL",
  monaragala: "MNL",
  mullaitivu: "MLT",
  "nuwara eliya": "NWE",
  polonnaruwa: "PLN",
  puttalam: "PTL",
  trincomalee: "TRM",
  vavuniya: "VVN",
};

const generateSchoolCode = async (district) => {
  const key = district.toLowerCase().trim();
  const districtCode =
    DISTRICT_CODES[key] ||
    district.replace(/\s+/g, "").toUpperCase().substring(0, 3);
  let num = 1;
  while (num <= 999) {
    const code = `DHS-${districtCode}-${String(num).padStart(3, "0")}`;
    const exists = await School.findOne({ where: { code } });
    if (!exists) return code;
    num++;
  }
  throw new Error("Could not generate unique school code for this district");
};

exports.createSchool = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    address,
    district,
    province,
    zone,
    contactEmail,
    contactPhone,
    principalName,
    password,
  } = req.body;

  const existingUser = await User.findOne({ where: { email: contactEmail } });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const schoolCode = code
    ? code.toUpperCase().trim()
    : await generateSchoolCode(district);

  if (code) {
    const existing = await School.findOne({ where: { code: schoolCode } });
    if (existing) {
      res.status(400);
      throw new Error(`School code "${schoolCode}" is already in use`);
    }
  }

  const school = await School.create({
    name,
    code: schoolCode,
    address,
    district,
    province,
    zone,
    contactEmail,
    contactPhone,
    principalName,
  });
  const user = await User.create({
    name,
    email: contactEmail,
    password: password || `Dhaham@${schoolCode}`,
    role: "school",
    schoolId: school.id,
  });
  await school.update({ userId: user.id });

  res.status(201).json({ success: true, school, loginEmail: contactEmail });
});

exports.getSchools = asyncHandler(async (req, res) => {
  const { province, zone, search } = req.query;
  const where = {};
  if (province) where.province = province;
  if (zone) where.zone = zone;
  if (search) where.name = { [Op.like]: `%${search}%` };

  const schools = await School.findAll({ where, order: [["name", "ASC"]] });
  res.json({ success: true, schools });
});

exports.getSchool = asyncHandler(async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }
  res.json({ success: true, school });
});

exports.updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }
  const {
    name,
    address,
    district,
    province,
    zone,
    contactEmail,
    contactPhone,
    principalName,
  } = req.body;
  await school.update({
    name,
    address,
    district,
    province,
    zone,
    contactEmail,
    contactPhone,
    principalName,
  });
  res.json({ success: true, school });
});

exports.deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }
  if (school.userId) await User.destroy({ where: { id: school.userId } });
  await school.destroy();
  res.json({ success: true, message: "School deleted successfully" });
});

exports.toggleSchool = asyncHandler(async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error("School not found");
  }
  await school.update({ isActive: !school.isActive });
  if (school.userId)
    await User.update(
      { isActive: school.isActive },
      { where: { id: school.userId } },
    );
  res.json({
    success: true,
    message: `School ${school.isActive ? "activated" : "deactivated"}`,
    school,
  });
});
