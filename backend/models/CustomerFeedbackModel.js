const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    image: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

dataSchema.index({ name: 1, location: 1 });

const CustomerFeedbackModel = mongoose.model('CustomerFeedback', dataSchema);

module.exports = CustomerFeedbackModel;
