const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Permission = require("../models/Permission");

const MASTER_ADMIN_EMAIL = "admin@dhaham.lk";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role", "isActive", "schoolId"],
      include: [
        {
          model: Permission,
          as: "userPermissions",
          required: false,
        },
      ],
    });

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error("Account disabled. Contact administrator.");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — invalid token");
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied. Your role: ${req.user.role}`);
    }
    next();
  };
};

const checkPermission = (module, action) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    // Master admin always passes
    if (req.user.email === MASTER_ADMIN_EMAIL) {
      return next();
    }

    // Non-admin roles: allow view-only pass-through (route logic handles data scoping)
    if (req.user.role !== "admin") {
      if (action === "view") return next();
      res.status(403);
      throw new Error("Access denied");
    }

    // Admin users: check granular permissions from DB
    // const permission = req.user.permissions?.find((p) => p.module === module);
    const permission = req.user.userPermissions?.find((p) => p.module === module);

    if (!permission) {
      res.status(403);
      throw new Error(`No access to ${module}`);
    }

    const actionMap = {
      view: "canView",
      create: "canCreate",
      edit: "canEdit",
      delete: "canDelete",
    };

    const field = actionMap[action];

    if (!field || !permission[field]) {
      res.status(403);
      throw new Error(`No permission to ${action} in ${module}`);
    }

    next();
  });
};

module.exports = { protect, authorize, checkPermission };
