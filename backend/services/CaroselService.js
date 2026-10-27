const fs = require('fs');
const path = require('path');
const CarouselModel = require('../models/CarouselModel');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteOldFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Create Carousel

const createCarousel = async (imgSrc, link) => {
  return await CarouselModel.create({ imgSrc, link });
};

// Get All Carousel

const getAllCarousels = async () => {
  return await CarouselModel.find();
};

// Update Carousel Link

const updateCarouselLink = async (id, link) => {
  return await CarouselModel.findByIdAndUpdate(id, { link }, { new: true });
};

// Delete Carousel

const deleteCarousel = async (id) => {
  const carousel = await CarouselModel.findById(id);
  if (carousel && carousel.imgSrc) {
    deleteOldFile(carousel.imgSrc);
  }
  return await CarouselModel.findByIdAndDelete(id);
};

module.exports = {
  createCarousel,
  getAllCarousels,
  updateCarouselLink,
  deleteCarousel,
};
