import mongoose from "mongoose";

// Sub-schema for size variants (e.g., Small / Medium / Large, or specific sizes)
const productVariantSchema = new mongoose.Schema({
  sku: {
    type: String,
    sparse: true,
  },
  // e.g., "Red", "Blue", "Green" for toys that come in colour variants
  color: {
    type: String,
  },
  // e.g., "Small", "Medium", "Large", or "Pack of 2", "Pack of 4"
  size: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  // Selling price after discount
  discountPrice: {
    type: Number,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: [true, "Product must belong to a category"],
    },

    // Target age group for the toy
    ageGroup: {
      type: String,
      enum: ["0-2", "3-5", "6-8", "9-12", "13+", "all"],
      default: "all",
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    // Pricing
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: null, // null = no original price (no discount)
    },
    // Computed or manually set discount percentage (0–100)
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Toy-specific details
    specifications: {
      material: { type: String }, // e.g., "BPA-free plastic", "Wood", "Fabric"
      batteryRequired: { type: Boolean, default: false },
      batteryType: { type: String }, // e.g., "AA x 3"
      dimensions: { type: String }, // e.g., "30cm x 20cm x 10cm"
      weight: { type: String }, // e.g., "500g"
      safetyStandards: [{ type: String }], // e.g., ["BIS", "CE", "ASTM"]
      includedItems: [{ type: String }], // e.g., ["Toy car", "Remote control", "Manual"]
    },

    // Optional size/colour variants
    variants: [productVariantSchema],

    // Ratings & reviews (can be updated via separate review system later)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Badge shown on product card, e.g. "Best Seller", "New Arrival", "Hot Deal"
    badge: {
      type: String,
      default: null,
    },

    // Stock status
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },

    // How many units sold (for bestseller ranking)
    soldCount: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Multi-vendor: which shop owns this product (null = platform product)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from name on save
productSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

// Auto-calculate discount percentage when price and originalPrice are present
productSchema.pre("save", function (next) {
  if (this.originalPrice && this.originalPrice > 0 && this.price > 0) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  } else {
    this.discount = 0;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
