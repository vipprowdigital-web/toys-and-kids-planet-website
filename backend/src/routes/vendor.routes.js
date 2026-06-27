import express from "express";
import {
  listVendors,
  getVendor,
  getVendorProducts,
  adminListVendors,
  adminGetVendor,
  adminUpdateVendorStatus,
  adminUpdateCommission,
  adminDeleteVendor,
} from "../controllers/vendor.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public: customer-facing shop directory ────────────────────────────────────
router.get("/", listVendors);
router.get("/:slugOrId", getVendor);
router.get("/:slugOrId/products", getVendorProducts);

// ── Platform Admin: vendor management ────────────────────────────────────────
router.get("/admin/all", ensureAuth, adminListVendors);
router.get("/admin/:id", ensureAuth, adminGetVendor);
router.patch("/admin/:id/status", ensureAuth, adminUpdateVendorStatus);
router.patch("/admin/:id/commission", ensureAuth, adminUpdateCommission);
router.delete("/admin/:id", ensureAuth, adminDeleteVendor);

export default router;
