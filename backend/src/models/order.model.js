import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      color: String,
      size: String,
      sku: String,
    },
    // Which vendor fulfilled this item (for payout attribution)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    // ── Customer ───────────────────────────────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    // Denormalised so the order is readable even if customer is deleted
    customerEmail: { type: String },
    customerPhone: { type: String },

    // ── Items ──────────────────────────────────────────────────────────────
    items: [orderItemSchema],

    // ── Pricing ───────────────────────────────────────────────────────────
    subtotal: { type: Number, required: true },   // before shipping/tax
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // final amount charged

    // ── Shipping ──────────────────────────────────────────────────────────
    shippingAddress: { type: shippingAddressSchema, required: true },

    // ── Payment ───────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Razorpay IDs — filled once payment is initiated / confirmed
    razorpayOrderId: { type: String },    // from Razorpay order creation
    razorpayPaymentId: { type: String },  // from frontend after success
    razorpaySignature: { type: String },  // for verification

    // ── Order status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "placed",       // payment done / COD placed
        "confirmed",    // admin confirmed
        "processing",   // being packed
        "shipped",      // dispatched
        "delivered",    // delivered to customer
        "cancelled",    // cancelled
        "returned",     // return initiated
      ],
      default: "placed",
    },

    // Tracking info (filled by admin)
    trackingNumber: { type: String },
    courierName: { type: String },

    // Optional notes
    customerNote: { type: String },
    adminNote: { type: String },

    // Cancellation
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Auto-generate a human-readable order number: TKP-YYYYMMDD-XXXXX
orderSchema.pre("save", function (next) {
  if (!this.isNew) return next();
  const date = new Date();
  const ymd =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 90000);
  this._orderNumber = `TKP-${ymd}-${rand}`;
  next();
});

orderSchema.add({ _orderNumber: { type: String } });

const Order = mongoose.model("Order", orderSchema);
export default Order;
