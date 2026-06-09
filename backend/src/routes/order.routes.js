import { Router } from "express";
import { ensureCustomer } from "../middleware/customerAuthMiddleware.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  placeCODOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from "../controllers/order.controller.js";

const router = Router();

// All order routes require customer auth
router.use(ensureCustomer);

// Payment
router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment", verifyRazorpayPayment);
router.post("/place-cod", placeCODOrder);

// My orders
router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderById);
router.patch("/my/:orderId/cancel", cancelMyOrder);

export default router;
