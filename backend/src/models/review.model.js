import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    // true if the customer has placed a delivered order containing this product
    verified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

// One review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

// Recalculate product rating/reviewCount after every save or remove
async function recalcProductRating(productId) {
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const avg = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats[0] ? stats[0].count : 0;
  await Product.findByIdAndUpdate(productId, { rating: avg, reviewCount: count });
}

reviewSchema.post("save", async function () {
  await recalcProductRating(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await recalcProductRating(doc.product);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  await recalcProductRating(this.product);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
