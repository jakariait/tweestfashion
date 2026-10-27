const brandService = require('../services/brandService');
const fs = require('fs');
const path = require('path');

const createBrand = async (req, res) => {
  try {
    const { name, isTopBrand } = req.body;
    const brandData = { name, isTopBrand: isTopBrand === 'true' || isTopBrand === true };

    if (req.files && req.files.logo) {
      brandData.logo = req.files.logo[0].filename;
    }

    const brand = await brandService.createBrand(brandData);
    res.status(201).json({ success: true, message: 'Brand created successfully', data: brand });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'Brand with this name already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await brandService.getBrands();
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isTopBrand } = req.body;
    const brandData = { name, isTopBrand: isTopBrand === 'true' || isTopBrand === true };

    const existingBrand = await brandService.getBrandById(id);
    if (!existingBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    if (req.files && req.files.logo) {
      // If a new logo is uploaded, delete the old one
      if (existingBrand.logo) {
        const oldLogoPath = path.join(__dirname, '..', 'uploads', existingBrand.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      brandData.logo = req.files.logo[0].filename;
    }

    const brand = await brandService.updateBrand(id, brandData);
    res.status(200).json({ success: true, message: 'Brand updated successfully', data: brand });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'Brand with this name already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Delete the logo file
    if (brand.logo) {
      const logoPath = path.join(__dirname, '..', 'uploads', brand.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await brandService.deleteBrand(id);
    res.status(200).json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandBySlug = async (req, res) => {
  try {
    const brand = await brandService.getBrandBySlug(req.params.slug);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandBySlug,
};
