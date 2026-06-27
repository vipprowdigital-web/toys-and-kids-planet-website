import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinaryService.js";
import Product from "../models/product.model.js";

const CLOUDINARY_FOLDER = "toysKidsPlanet/products";

// @desc   Create a product under the logged-in vendor's shop
// @route  POST /api/v1/vendor/products
// @access Vendor
export const vendorCreateProduct = async (req, res) => {
  try {
    const {
      name, description, category, ageGroup, price, originalPrice,
      specifications, variants, badge, inStock, stockQuantity,
    } = req.body;

    if (!name || !description || !category || !price) {
      return res.status(400).json({ success: false, message: "name, description, category and price are required." });
    }

    let imageObjects = [];
    if (req.files && req.files.length > 0) {
      const results = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.path || f.buffer, { folder: CLOUDINARY_FOLDER })),
      );
      imageObjects = results.map((r) => ({ url: r.secure_url || r.url, publicId: r.public_id }));
    }

    const product = await Product.create({
      name,
      description,
      category,
      ageGroup: ageGroup || "all",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      images: imageObjects,
      specifications: typeof specifications === "string" ? JSON.parse(specifications) : specifications,
      variants: typeof variants === "string" ? JSON.parse(variants) : variants,
      badge: badge || null,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      vendor: req.vendor._id,
      isActive: true,
    });

    res.status(201).json({ success: true, message: "Product created.", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   List vendor's own products
// @route  GET /api/v1/vendor/products
// @access Vendor
export const vendorGetProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = { vendor: req.vendor._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update vendor's own product
// @route  PUT /api/v1/vendor/products/:id
// @access Vendor
export const vendorUpdateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or not owned by your shop." });
    }

    const fields = ["name", "description", "category", "ageGroup", "price", "originalPrice", "badge", "inStock", "stockQuantity", "isFeatured"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    if (req.body.specifications) {
      product.specifications = typeof req.body.specifications === "string"
        ? JSON.parse(req.body.specifications) : req.body.specifications;
    }
    if (req.body.variants) {
      product.variants = typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants) : req.body.variants;
    }

    if (req.files && req.files.length > 0) {
      if (product.images?.length) {
        await Promise.all(product.images.map((img) => destroyFromCloudinary(img.publicId))).catch(() => {});
      }
      const results = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.path || f.buffer, { folder: CLOUDINARY_FOLDER })),
      );
      product.images = results.map((r) => ({ url: r.secure_url || r.url, publicId: r.public_id }));
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated.", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Patch vendor product (toggle isActive etc.)
// @route  PATCH /api/v1/vendor/products/:id
// @access Vendor
export const vendorPatchProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or not owned by your shop." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete vendor's own product
// @route  DELETE /api/v1/vendor/products/:id
// @access Vendor
export const vendorDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or not owned by your shop." });
    }

    if (product.images?.length) {
      await Promise.all(product.images.map((img) => destroyFromCloudinary(img.publicId))).catch(() => {});
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
