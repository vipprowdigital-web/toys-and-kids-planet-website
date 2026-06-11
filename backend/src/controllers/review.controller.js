import Review from "../models/review.model.js";
import Order from "../models/order.model.js";

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/reviews/product/:productId
 * Returns approved reviews for a product, newest first.
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ product: productId, isApproved: true });
    const reviews = await Review.find({ product: productId, isApproved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Customer ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/reviews
 * Create a review. Customer must have a delivered order containing the product.
 * Body: { productId, rating, title?, body }
 */
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, body } = req.body;
    const customer = req.customer;

    if (!productId || !rating || !body) {
      return res.status(400).json({
        success: false,
        message: "productId, rating, and body are required.",
      });
    }

    // Check if this customer already reviewed this product
    const existing = await Review.findOne({ product: productId, customer: customer._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Check purchase — any delivered order containing the product
    const purchased = await Order.findOne({
      customer: customer._id,
      status: "delivered",
      "items.product": productId,
    });

    const review = await Review.create({
      product: productId,
      customer: customer._id,
      customerName: customer.name || customer.email?.split("@")[0] || "Customer",
      customerAvatar: customer.avatar,
      rating: Number(rating),
      title: title?.trim(),
      body: body.trim(),
      verified: !!purchased,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/v1/reviews/:id
 * Customer edits their own review.
 * Body: { rating?, title?, body? }
 */
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    if (review.customer.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your review." });
    }

    const { rating, title, body } = req.body;
    if (rating !== undefined) review.rating = Number(rating);
    if (title !== undefined) review.title = title.trim();
    if (body !== undefined) review.body = body.trim();

    await review.save();
    return res.status(200).json({ success: true, data: review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/reviews/:id
 * Customer deletes their own review.
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    if (review.customer.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your review." });
    }

    await review.deleteOne();
    return res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/reviews
 * Admin: get all reviews with pagination.
 */
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/v1/reviews/:id/admin
 * Admin edits any review body/rating/approval.
 */
export const adminUpdateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const { rating, title, body, isApproved } = req.body;
    if (rating !== undefined) review.rating = Number(rating);
    if (title !== undefined) review.title = title.trim();
    if (body !== undefined) review.body = body.trim();
    if (isApproved !== undefined) review.isApproved = isApproved;

    await review.save();
    return res.status(200).json({ success: true, data: review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/reviews/:id/admin
 * Admin deletes any review.
 */
export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    return res.status(200).json({ success: true, message: "Review deleted by admin." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
