const customerFeedbackService = require('../services/customerFeedbackService');

const isValidRating = (value) => {
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5;
};

const parseBoolean = (value) =>
  value === true || value === 'true'
    ? true
    : value === false || value === 'false'
      ? false
      : undefined;

const handleBadRequest = (res, error) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid customer feedback id' });
  }
  if (error.statusCode === 400) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: error.message });
};

const createFeedback = async (req, res) => {
  try {
    const { name, message, rating, location } = req.body;

    if (!name || !message || rating === undefined || rating === '') {
      return res.status(400).json({ message: 'Name, message and rating are required' });
    }

    if (!isValidRating(rating)) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const feedbackData = {
      name,
      message,
      rating: Number(rating),
      location: location || '',
      image: req.files?.customerImage?.[0]?.filename || '',
    };

    const isActive = parseBoolean(req.body.isActive);
    if (isActive !== undefined) {
      feedbackData.isActive = isActive;
    }

    const feedback = await customerFeedbackService.createFeedback(feedbackData);

    return res.status(201).json({
      message: 'Customer feedback created successfully',
      data: feedback,
    });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = customerFeedbackService.buildFilters(req.query);

    const [feedbacks, total] = await Promise.all([
      customerFeedbackService.getPaginatedFeedback(filters, skip, limit),
      customerFeedbackService.getFeedbackCount(filters),
    ]);

    return res.status(200).json({
      message: 'Customer feedback fetched successfully',
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await customerFeedbackService.getFeedbackById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Customer feedback not found' });
    }

    return res.status(200).json({ data: feedback });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

// Public: only active feedback for the storefront testimonials slider
const getActiveFeedback = async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 20;

    const feedbacks = await customerFeedbackService.getActiveFeedback(limit);

    return res.status(200).json({
      message: 'Customer feedback fetched successfully',
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

const updateFeedback = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.image;

    if (updates.rating !== undefined && updates.rating !== '') {
      if (!isValidRating(updates.rating)) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
      }
      updates.rating = Number(updates.rating);
    } else {
      delete updates.rating;
    }

    if (updates.isActive !== undefined) {
      updates.isActive = parseBoolean(updates.isActive);
    }

    if (req.files?.customerImage?.[0]?.filename) {
      updates.image = req.files.customerImage[0].filename;
    } else if (req.body.removeImage === 'true') {
      updates.image = '';
    }

    const feedback = await customerFeedbackService.updateFeedback(req.params.id, updates);

    if (!feedback) {
      return res.status(404).json({ message: 'Customer feedback not found' });
    }

    return res.status(200).json({
      message: 'Customer feedback updated successfully',
      data: feedback,
    });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await customerFeedbackService.deleteFeedback(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Customer feedback not found' });
    }

    return res.status(200).json({ message: 'Customer feedback deleted successfully' });
  } catch (error) {
    return handleBadRequest(res, error);
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  getActiveFeedback,
  updateFeedback,
  deleteFeedback,
};
