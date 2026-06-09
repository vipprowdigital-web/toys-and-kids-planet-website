/**
 * customerAuth.routes.js
 *
 * All routes are under /api/v1/customer
 * Completely separate from the admin /api/v1/auth routes.
 */

import { Router } from "express";
import passport from "passport";
import {
  sendEmailOTP,
  verifyEmailOTP,
  googleCallback,
  getMyProfile,
  updateMyProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/customerAuth.controller.js";
import { ensureCustomer } from "../middleware/customerAuthMiddleware.js";
import { isGoogleCustomerConfigured } from "../config/customerPassport.js";

const router = Router();

// ── Email OTP auth ─────────────────────────────────────────────────────────
router.post("/auth/send-otp", sendEmailOTP);
router.post("/auth/verify-otp", verifyEmailOTP);

// ── Google OAuth — only mount if credentials are configured ───────────────
if (isGoogleCustomerConfigured) {
  router.get(
    "/auth/google",
    passport.authenticate("google-customer", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google-customer", {
      failureRedirect: `${process.env.NEXT_FRONTEND_URL}/auth?error=google_failed`,
      session: false,
    }),
    googleCallback,
  );
} else {
  // Return a helpful error instead of crashing
  router.get("/auth/google", (_req, res) => {
    res.status(503).json({
      success: false,
      message:
        "Google login is not configured on this server. Please use email OTP to sign in.",
    });
  });
  router.get("/auth/google/callback", (_req, res) => {
    res.redirect(
      `${process.env.NEXT_FRONTEND_URL}/auth?error=google_not_configured`,
    );
  });
}

// ── Authenticated customer routes ──────────────────────────────────────────
router.get("/me", ensureCustomer, getMyProfile);
router.patch("/me", ensureCustomer, updateMyProfile);

// Wishlist
router.get("/me/wishlist", ensureCustomer, getWishlist);
router.post("/me/wishlist/:productId", ensureCustomer, addToWishlist);
router.delete("/me/wishlist/:productId", ensureCustomer, removeFromWishlist);

// Addresses
router.get("/me/addresses", ensureCustomer, getAddresses);
router.post("/me/addresses", ensureCustomer, addAddress);
router.put("/me/addresses/:addressId", ensureCustomer, updateAddress);
router.delete("/me/addresses/:addressId", ensureCustomer, deleteAddress);

export default router;
