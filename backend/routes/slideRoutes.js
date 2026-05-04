const express = require('express');
const r = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, checkPermission } = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');
const HeroSlide = require('../models/HeroSlide');

r.get('/', asyncHandler(async (req, res) => {
  const slides = await HeroSlide.findAll({
    where: { isActive: true },
    order: [['order', 'ASC'], ['createdAt', 'ASC']],
  });
  res.json({ success: true, slides });
}));

r.get('/all', protect, checkPermission('slides', 'view'), asyncHandler(async (req, res) => {
  const slides = await HeroSlide.findAll({ order: [['order', 'ASC'], ['createdAt', 'ASC']] });
  res.json({ success: true, slides });
}));

r.post('/', protect, checkPermission('slides', 'create'), uploadPhoto.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Image is required'); }

  let imageUrl, publicId;
  if (req.file.path && req.file.filename && req.file.path.startsWith('http')) {
    imageUrl = req.file.path;
    publicId = req.file.filename;
  } else {
    const rel = req.file.path.replace(/\\/g, '/');
    const uploadsIdx = rel.indexOf('/uploads/');
    imageUrl = uploadsIdx !== -1 ? rel.slice(uploadsIdx) : '/uploads/photos/' + req.file.filename;
    publicId = null;
  }

  const { title, subtitle, order } = req.body;
  const slide = await HeroSlide.create({
    imageUrl,
    publicId: publicId || null,
    title: title || null,
    subtitle: subtitle || null,
    order: order ? parseInt(order) : 0,
  });
  res.status(201).json({ success: true, slide });
}));

r.put('/:id', protect, checkPermission('slides', 'edit'), asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByPk(req.params.id);
  if (!slide) { res.status(404); throw new Error('Slide not found'); }
  const { title, subtitle, order, isActive } = req.body;
  await slide.update({
    title:    title    !== undefined ? title    : slide.title,
    subtitle: subtitle !== undefined ? subtitle : slide.subtitle,
    order:    order    !== undefined ? parseInt(order) : slide.order,
    isActive: isActive !== undefined ? isActive : slide.isActive,
  });
  res.json({ success: true, slide });
}));

r.put('/:id/toggle', protect, checkPermission('slides', 'edit'), asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByPk(req.params.id);
  if (!slide) { res.status(404); throw new Error('Slide not found'); }
  await slide.update({ isActive: !slide.isActive });
  res.json({ success: true, isActive: slide.isActive });
}));

r.delete('/:id', protect, checkPermission('slides', 'delete'), asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByPk(req.params.id);
  if (!slide) { res.status(404); throw new Error('Slide not found'); }
  if (slide.imageUrl && slide.imageUrl.startsWith('/uploads/')) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', slide.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await slide.destroy();
  res.json({ success: true, message: 'Slide deleted' });
}));

module.exports = r;
