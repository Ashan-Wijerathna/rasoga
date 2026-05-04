const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Permission = require('../models/Permission');
const User = require('../models/User');

const MASTER_ADMIN_EMAIL = 'admin@dhaham.lk';

const isMasterAdmin = (req, res, next) => {
  if (req.user.email !== MASTER_ADMIN_EMAIL) {
    res.status(403);
    throw new Error('Only master admin can manage permissions');
  }
  next();
};

router.get('/user/:userId',
  protect,
  isMasterAdmin,
  asyncHandler(async (req, res) => {
    const permissions = await Permission.findAll({
      where: { userId: req.params.userId },
    });
    res.json({ success: true, permissions });
  })
);

router.post('/user/:userId',
  protect,
  isMasterAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.email === MASTER_ADMIN_EMAIL) {
      res.status(403);
      throw new Error('Cannot modify master admin permissions');
    }

    await Permission.destroy({ where: { userId } });

    if (permissions && permissions.length > 0) {
      const toCreate = permissions.map(p => ({
        userId: parseInt(userId),
        module: p.module,
        canView:   p.canView   || false,
        canCreate: p.canCreate || false,
        canEdit:   p.canEdit   || false,
        canDelete: p.canDelete || false,
      }));
      await Permission.bulkCreate(toCreate);
    }

    const updated = await Permission.findAll({ where: { userId } });

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      permissions: updated,
    });
  })
);

module.exports = router;
