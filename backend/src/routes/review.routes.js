import { Router } from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  adminUpdateReview,
  adminDeleteReview,
} from "../controllers/review.controller.js";
import { ensureCustomer } from "../middleware/customerAuthMiddleware.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/product/:productId", getProductReviews);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", ensureAuth, getAllReviews);
router.patch("/:id/admin", ensureAuth, adminUpdateReview);
router.delete("/:id/admin", ensureAuth, adminDeleteReview);

// ── Customer ──────────────────────────────────────────────────────────────────
router.post("/", ensureCustomer, createReview);
router.patch("/:id", ensureCustomer, updateReview);
router.delete("/:id", ensureCustomer, deleteReview);

export default router;
