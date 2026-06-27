import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vendorSchema = new mongoose.Schema(
  {
    // Shop identity
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      url: { type: String },
      publicId: { type: String },
    },
    banner: {
      url: { type: String },
      publicId: { type: String },
    },

    // Owner / contact
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // Address
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Business details
    gstNumber: { type: String },
    panNumber: { type: String },

    // Platform control
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    commissionRate: {
      type: Number,
      default: 10, // platform takes 10% by default
      min: 0,
      max: 100,
    },

    // Aggregate ratings (updated by review hooks later)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Auto-generate slug from shopName
vendorSchema.pre("save", function (next) {
  if (!this.isModified("shopName")) return next();
  this.slug = this.shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

// Hash password before saving
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

vendorSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
