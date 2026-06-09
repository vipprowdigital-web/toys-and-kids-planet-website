/**
 * adminOrder.controller.js
 * Admin-only order management — protected by ensureAuth (admin JWT).
 * Does NOT touch the customer-facing order routes.
 */

import Order from "../models/order.model.js";

const VALID_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

// ─── GET all orders (paginated, filterable) ───────────────────────────────────

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const paymentStatus = req.query.paymentStatus || "";
    const search = req.query.search || "";

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { _orderNumber: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { razorpayOrderId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customer", "name email phone avatar")
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllOrders:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET single order by ID ───────────────────────────────────────────────────

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone avatar")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── PATCH update order status / tracking ────────────────────────────────────

export const updateOrderStatus = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      trackingNumber,
      courierName,
      adminNote,
      cancelReason,
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid status "${status}".` });
      }
      order.status = status;
      if (status === "cancelled") {
        order.cancelledAt = new Date();
        order.cancelReason = cancelReason || "Cancelled by admin";
      }
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (adminNote !== undefined) order.adminNote = adminNote;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated.",
      data: order,
    });
  } catch (err) {
    console.error("updateOrderStatus:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── DELETE order by ID ───────────────────────────────────────────────────────

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Order deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [statusCounts, paymentCounts, revenueResult] = await Promise.all([
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalOrders = await Order.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        byStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
        byPayment: Object.fromEntries(
          paymentCounts.map((s) => [s._id, s.count]),
        ),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
