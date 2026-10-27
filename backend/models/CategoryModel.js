const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, unique: true },
    showOnNavbar: { type: Boolean, default: true, required: true },
    image: { type: String },
    showOnHomePage: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CategoryModel = mongoose.model('Category', dataSchema);

module.exports = CategoryModel;
