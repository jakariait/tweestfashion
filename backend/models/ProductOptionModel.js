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
        value: {
          type: String,
          trim: true,
          required: true,
        },
        numberOfProduct: {
          type: Number,
          default: 1,
          min: 1,
        },
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
