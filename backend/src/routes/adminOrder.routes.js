import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} from "../controllers/adminOrder.controller.js";

const router = Router();

// All admin order routes require admin JWT
router.use(ensureAuth);

router.get("/stats", getOrderStats);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
