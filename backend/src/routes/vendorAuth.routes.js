import express from "express";
import {
  registerVendor,
  loginVendor,
  getVendorMe,
  updateVendorMe,
} from "../controllers/vendorAuth.controller.js";
import { ensureVendor } from "../middleware/vendorAuthMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// Protected (approved vendors only)
router.get("/me", ensureVendor, getVendorMe);
router.patch("/me", ensureVendor, updateVendorMe);

export default router;
