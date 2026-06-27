import express from "express";
import upload from "../config/multer.js";
import { ensureVendor } from "../middleware/vendorAuthMiddleware.js";
import {
  vendorCreateProduct,
  vendorGetProducts,
  vendorUpdateProduct,
  vendorPatchProduct,
  vendorDeleteProduct,
} from "../controllers/vendorProduct.controller.js";

const router = express.Router();

// All routes require vendor JWT
router.use(ensureVendor);

router.get("/", vendorGetProducts);
router.post("/", upload.array("images", 5), vendorCreateProduct);
router.put("/:id", upload.array("images", 5), vendorUpdateProduct);
router.patch("/:id", vendorPatchProduct);
router.delete("/:id", vendorDeleteProduct);

export default router;
