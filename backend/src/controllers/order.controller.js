/**
 * order.controller.js
 *
 * Razorpay payment flow:
 *   1. POST /orders/create-razorpay-order
 *      → Creates a Razorpay order, returns { razorpayOrderId, amount, currency, key }
 *   2. Frontend opens Razorpay checkout, customer pays
 *   3. POST /orders/verify-payment
 *      → Verifies HMAC signature, marks order paid, saves to DB
 *
 * COD flow:
 *   1. POST /orders/place-cod
 *      → Directly creates the Order document with paymentStatus "pending"
 */

import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// ─── Razorpay instance ────────────────────────────────────────────────────────

let razorpay;

function getRazorpay() {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
    }
    razorpay = new Razorpay({ key_id, key_secret });
  }
  return razorpay;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate and price cart items against the live DB */
async function resolveItems(cartItems) {
  const errors = [];
  const resolved = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.productId).lean();
    if (!product) {
      errors.push(`Product ${item.productId} not found.`);
      continue;
    }
    if (!product.inStock) {
      errors.push(`"${product.name}" is out of stock.`);
      continue;
    }

    resolved.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      price: product.price,
      quantity: item.quantity,
      variant: item.variant || {},
    });
  }

  return { resolved, errors };
}

function calcAmounts(items, shippingCharge = 0, discount = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // 18% GST — adjust or make configurable as needed
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + tax + shippingCharge - discount;
  return { subtotal, tax, shippingCharge, discount, totalAmount };
}

// ─── 1. Create Razorpay order ─────────────────────────────────────────────────

/**
 * POST /api/v1/orders/create-razorpay-order
 * Auth: customer
 * Body: { items: [{productId, quantity, variant?}], shippingAddress, customerNote? }
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddress, customerNote } = req.body;

    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ success: false, message: "items and shippingAddress are required." });
    }

    const { resolved, errors } = await resolveItems(items);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(" ") });
    }

    const FREE_SHIPPING_THRESHOLD = 999;
    const { subtotal, tax, totalAmount } = calcAmounts(resolved);
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
    const finalTotal = totalAmount + shippingCharge;

    // Create Razorpay order (amount in paise)
    const rzpOrder = await getRazorpay().orders.create({
      // amount: Math.round(finalTotal * 100),
      amount: 100,
      currency: "INR",
      receipt: `tkp_${Date.now()}`,
    });

    // Persist a "pending" order so we can verify later
    const order = await Order.create({
      customer: req.customer._id,
      customerEmail: req.customer.email,
      customerPhone: req.customer.phone,
      items: resolved,
      subtotal,
      shippingCharge,
      tax,
      discount: 0,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
      status: "placed",
      customerNote,
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
      orderNumber: order._orderNumber,
    });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error." });
  }
};

// ─── 2. Verify Razorpay payment ───────────────────────────────────────────────

/**
 * POST /api/v1/orders/verify-payment
 * Auth: customer
 * Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: "All payment fields are required." });
    }

    // HMAC-SHA256 verification
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      // Mark order as failed
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", status: "cancelled" });
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    // Mark order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        razorpayPaymentId,
        razorpaySignature,
        status: "placed",
      },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order confirmed!",
      orderId: order._id,
      orderNumber: order._orderNumber,
    });
  } catch (err) {
    console.error("verifyRazorpayPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── 3. COD order ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/orders/place-cod
 * Auth: customer
 * Body: { items, shippingAddress, customerNote? }
 */
export const placeCODOrder = async (req, res) => {
  try {
    const { items, shippingAddress, customerNote } = req.body;

    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ success: false, message: "items and shippingAddress are required." });
    }

    const { resolved, errors } = await resolveItems(items);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(" ") });
    }

    const FREE_SHIPPING_THRESHOLD = 999;
    const { subtotal, tax, totalAmount } = calcAmounts(resolved);
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
    const finalTotal = totalAmount + shippingCharge;

    const order = await Order.create({
      customer: req.customer._id,
      customerEmail: req.customer.email,
      customerPhone: req.customer.phone,
      items: resolved,
      subtotal,
      shippingCharge,
      tax,
      discount: 0,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "placed",
      customerNote,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Pay on delivery.",
      orderId: order._id,
      orderNumber: order._orderNumber,
    });
  } catch (err) {
    console.error("placeCODOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── 4. My orders ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/my
 * Auth: customer
 */
export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Order.countDocuments({ customer: req.customer._id });
    const orders = await Order.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("items.product", "name slug images price")
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/v1/orders/my/:orderId
 * Auth: customer
 */
export const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.customer._id,
    })
      .populate("items.product", "name slug images price")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/v1/orders/my/:orderId/cancel
 * Auth: customer — only allowed while status is "placed" or "confirmed"
 */
export const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.customer._id,
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    if (!["placed", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}".`,
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by customer";
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled.", data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
