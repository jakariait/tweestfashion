const mongoose = require('mongoose');

const productOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    values: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductOptionModel = mongoose.model('ProductOption', productOptionSchema);

module.exports = ProductOptionModel;
