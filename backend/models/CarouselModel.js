const mongoose = require('mongoose');

const DataSchema = mongoose.Schema(
  {
    imgSrc: { type: String, required: true },
    link: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CarouselModel = mongoose.model('Carousel', DataSchema);

module.exports = CarouselModel;
