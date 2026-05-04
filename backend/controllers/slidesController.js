const HeroSlide = require("../models/HeroSlide");
const path = require("path");
const fs = require("fs").promises;

exports.getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.findAll({ order: [["order", "ASC"]] });
    res.json({ slides });
  } catch (error) {
    console.error("Get slides error:", error);
    res.status(500).json({ message: "Failed to fetch slides" });
  }
};

exports.uploadSlide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const { title, subtitle, order, link } = req.body;

    const slide = await HeroSlide.create({
      imageUrl: `/uploads/${req.file.filename}`,
      publicId: req.file.filename,
      title: title || null,
      subtitle: subtitle || null,
      order: parseInt(order) || 999,
      link: link || null,
      isActive: true,
    });

    res.json({ success: true, slide });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.toggleSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });

    slide.isActive = !slide.isActive;
    await slide.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Toggle error:", error);
    res.status(500).json({ message: "Failed to toggle slide" });
  }
};

exports.updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });

    if (req.body.order !== undefined) slide.order = parseInt(req.body.order);
    if (req.body.title !== undefined) slide.title = req.body.title || null;
    if (req.body.subtitle !== undefined)
      slide.subtitle = req.body.subtitle || null;
    if (req.body.link !== undefined) slide.link = req.body.link || null;

    await slide.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update slide" });
  }
};

exports.deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });

    try {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(slide.imageUrl),
      );
      await fs.unlink(filePath).catch(() => {});
    } catch (fileError) {
      console.warn("File delete warning:", fileError.message);
    }

    await slide.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete slide" });
  }
};
