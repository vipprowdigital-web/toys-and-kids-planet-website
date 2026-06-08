import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Emoji or icon identifier shown on the category card, e.g. "🎓", "🧱"
    // icon: {
    //   type: String,
    //   default: "🎁",
    // },
    // Tailwind CSS colour class used on the frontend, e.g. "bg-teal", "bg-coral"
    // color: {
    //   type: String,
    //   default: "bg-teal",
    // },
    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

productCategorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();

  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

const ProductCategory = mongoose.model(
  "ProductCategory",
  productCategorySchema,
);

export default ProductCategory;
