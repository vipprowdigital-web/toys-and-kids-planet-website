import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" }, // "Home", "Office", "Other"
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows null + unique
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    avatar: { type: String },
    provider: {
      type: String,
      enum: ["google", "email_otp", "phone_otp"],
      required: true,
    },
    googleId: { type: String, sparse: true, unique: true },
    // OTP fields (cleared after verification)
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    // Wishlist — array of product ObjectIds
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // Saved addresses
    addresses: [addressSchema],
  },
  { timestamps: true, versionKey: false }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
