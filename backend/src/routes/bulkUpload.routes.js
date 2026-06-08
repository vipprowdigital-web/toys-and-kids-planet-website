/**
 * bulkUpload.routes.js
 */

import express from "express";
import {
  uploadMiddleware,
  bulkUploadProducts,
} from "../controllers/bulkUpload.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/v1/bulk-upload
 *
 * Expects multipart/form-data with:
 *   - excel: single .xlsx file (field name "excel")
 *   - images: multiple image files (field name "images"), up to 5000
 *
 * Response: Server-Sent Events stream (text/event-stream)
 *   Events:
 *     { type: "progress",          message: "...", percent: 0-100 }
 *     { type: "validation_errors", message: "...", errors: [...] }
 *     { type: "done",              message: "...", inserted: N, failed: N, errors: [...] }
 *     { type: "error",             message: "..." }    ← fatal/unexpected errors
 */
router.post("/", ensureAuth, uploadMiddleware, bulkUploadProducts);

export default router;
