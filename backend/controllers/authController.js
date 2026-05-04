const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');
const Permission = require('../models/Permission');

const MASTER_ADMIN_EMAIL = 'admin@dhaham.lk';

const MODULES = [
  'applications', 'events', 'results', 'schools',
  'users', 'reports', 'slides', 'resoza', 'formBuilder',
];

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

function buildPermissionsMap(email, permissionRows) {
  const isMaster = email === MASTER_ADMIN_EMAIL;
  const map = {};
  if (isMaster) {
    MODULES.forEach(m => {
      map[m] = { canView: true, canCreate: true, canEdit: true, canDelete: true };
    });
  } else {
    permissionRows.forEach(p => {
      map[p.module] = {
        canView:   p.canView,
        canCreate: p.canCreate,
        canEdit:   p.canEdit,
        canDelete: p.canDelete,
      };
    });
  }
  return map;
}

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: School, as: 'school', required: false }],
  });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated. Contact admin.');
  }

  user.lastLogin = new Date();
  user.refreshToken = generateRefreshToken(user.id);
  await user.save();

  const permissionRows = await Permission.findAll({ where: { userId: user.id } });
  const permissionsMap = buildPermissionsMap(user.email, permissionRows);
  const isMaster = user.email === MASTER_ADMIN_EMAIL;

  res.json({
    success: true,
    token: generateToken(user.id),
    refreshToken: user.refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      schoolId: user.schoolId,
      school: user.school || null,
      isMasterAdmin: isMaster,
      permissions: permissionsMap,
    },
  });
});

exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, schoolId } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const school = schoolId ? await School.findOne({ where: { id: schoolId } }) : null;
  if (schoolId && !school) {
    res.status(404);
    throw new Error('School not found');
  }

  const user = await User.create({ name, email, password, role: 'school' });
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token required');
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
  const user = await User.findOne({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }
  res.json({ success: true, token: generateToken(user.id) });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'isActive', 'schoolId', 'lastLogin'],
    include: [
      { model: School, as: 'school', attributes: ['id', 'name', 'code'], required: false },
      // { model: Permission, as: 'permissions', required: false },
      { model: Permission, as: 'userPermissions', required: false },
    ],
  });

  const isMaster = user.email === MASTER_ADMIN_EMAIL;
  // const permissionsMap = buildPermissionsMap(user.email, user.permissions || []);
  const permissionsMap = buildPermissionsMap(user.email, user.userPermissions || []);

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      schoolId: user.schoolId,
      lastLogin: user.lastLogin,
      school: user.school || null,
      isMasterAdmin: isMaster,
      permissions: permissionsMap,
    },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await User.update({ refreshToken: null }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Logged out successfully' });
});
