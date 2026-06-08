import express from "express";
const router = express.Router();
import upload from "../config/multer.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  patchProductPartial,
  updateProductFull,
} from "../controllers/product.controller.js";

// Public Pipeline API
router.get("/", getAllProducts);
router.get("/:slugOrId", getProductById);

// Protected Admin Actions using ensureAuth
router.post("/", ensureAuth, upload.array("images", 5), createProduct);
router.put("/:id", ensureAuth, upload.array("images", 5), updateProductFull);
router.patch("/:id", ensureAuth, patchProductPartial);
router.delete("/:id", ensureAuth, deleteProduct);

export default router;
