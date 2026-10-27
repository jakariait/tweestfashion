const mongoose = require('mongoose');

const DataSchema = mongoose.Schema(
  {
    PrimaryLogo: { type: String },
    SecondaryLogo: { type: String },
    Favicon: { type: String },
    CompanyName: { type: String },
    PhoneNumber: { type: [String] },
    CompanyEmail: { type: [String] },
    ShortDescription: { type: String },
    CompanyAddress: { type: String },
    GoogleMapLink: { type: String },
    WhatsAppNumber: { type: String },
    WhatsAppNumberIsActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const GeneralInfoModel = mongoose.model('GeneralInfo', DataSchema);

module.exports = GeneralInfoModel;
