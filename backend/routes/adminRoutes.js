const express = require("express");
const r = express.Router();
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { protect, authorize, checkPermission } = require("../middleware/auth");
const User = require("../models/User");
const School = require("../models/School");

const MASTER_ADMIN_EMAIL = "admin@dhaham.lk";

r.get(
  "/users",
  protect,
  checkPermission("users", "view"),
  asyncHandler(async (req, res) => {
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      include: [
        {
          model: School,
          as: "school",
          attributes: ["name", "code"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password", "refreshToken"] },
    });
    res.json({ success: true, users });
  }),
);

r.put(
  "/users/:id/toggle",
  protect,
  checkPermission("users", "edit"),
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.id === req.user.id) {
      res.status(400);
      throw new Error("Cannot disable your own account");
    }
    if (user.email === MASTER_ADMIN_EMAIL) {
      res.status(403);
      throw new Error("Master admin account cannot be modified");
    }
    await user.update({ isActive: !user.isActive });
    res.json({
      success: true,
      message: user.isActive ? "User enabled successfully" : "User disabled successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }),
);

r.put(
  "/users/:id/role",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const allowedRoles = ["admin", "school"];
    if (!allowedRoles.includes(role)) {
      res.status(400);
      throw new Error("Invalid role");
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.id === req.user.id) {
      res.status(400);
      throw new Error("Cannot change your own role");
    }
    if (user.email === MASTER_ADMIN_EMAIL) {
      res.status(403);
      throw new Error("Master admin account cannot be modified");
    }
    await user.update({ role });
    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }),
);

r.put(
  "/users/:id/reset-password",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password reset successfully" });
  }),
);

r.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin") {
      res.status(403);
      throw new Error("Cannot delete admin accounts");
    }
    await user.destroy();
    res.json({ success: true, message: "User deleted successfully" });
  }),
);

r.get(
  "/users/:id",
  protect,
  checkPermission("users", "view"),
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "refreshToken"] },
      include: [{ model: School, as: "school", attributes: ["name", "code"], required: false }],
    });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ success: true, user });
  }),
);

r.put(
  "/users/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { name, email, role, permissions } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        res.status(400);
        throw new Error("Email already in use");
      }
    }

    await user.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      permissions: Array.isArray(permissions)
        ? permissions.length > 0
          ? permissions
          : null
        : user.permissions,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  }),
);

module.exports = r;
