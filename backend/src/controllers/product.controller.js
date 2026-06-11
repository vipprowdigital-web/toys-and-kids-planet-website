import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinaryService.js";
import Product from "../models/product.model.js";

const CLOUDINARY_FOLDER = "toysKidsPlanet/products";

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      ageGroup,
      price,
      originalPrice,
      specifications,
      variants,
      badge,
      inStock,
      stockQuantity,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category, and price are required fields.",
      });
    }

    // Handle multiple product image uploads
    let imageObjects = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path || file.buffer, {
          folder: CLOUDINARY_FOLDER,
        }),
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageObjects = uploadResults.map((result) => ({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      }));
    }

    const parsedSpecifications =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    const newProduct = new Product({
      name,
      description,
      category,
      ageGroup: ageGroup || "all",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      images: imageObjects,
      specifications: parsedSpecifications,
      variants: parsedVariants,
      badge: badge || null,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      isFeatured: isFeatured ?? false,
      isActive: isActive ?? true,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products with Pagination and Query Filtering
// @route   GET /api/v1/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.category || "";
    const ageGroup = req.query.ageGroup || "";
    const featured = req.query.featured || "";
    const inStock = req.query.inStock || "";

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (categoryId) query.category = categoryId;
    if (ageGroup) query.ageGroup = ageGroup;
    if (featured === "true") query.isFeatured = true;
    if (inStock === "true") query.inStock = true;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name slug icon color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Error",
      error: error.message,
    });
  }
};

// @desc    Get single product by Slug or ID
// @route   GET /api/v1/products/:slugOrId
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const query = slugOrId.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slugOrId }
      : { slug: slugOrId };

    const product = await Product.findOne(query);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a whole product record (Full Overwrite)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
const updateProductFull = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      ageGroup,
      price,
      originalPrice,
      specifications,
      variants,
      badge,
      inStock,
      stockQuantity,
      isFeatured,
      isActive,
    } = req.body;

    let product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.ageGroup = ageGroup || product.ageGroup;
    product.price = price !== undefined ? Number(price) : product.price;
    product.originalPrice =
      originalPrice !== undefined
        ? originalPrice
          ? Number(originalPrice)
          : null
        : product.originalPrice;
    product.badge = badge !== undefined ? badge : product.badge;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.stockQuantity =
      stockQuantity !== undefined
        ? Number(stockQuantity)
        : product.stockQuantity;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    if (specifications) {
      product.specifications =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
    }
    if (variants) {
      product.variants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    // Process new replacement images if supplied
    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((img) =>
          destroyFromCloudinary(img.publicId),
        );
        await Promise.all(deletePromises).catch((err) =>
          console.log("Old asset cleanup skip:", err.message),
        );
      }
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path || file.buffer, {
          folder: CLOUDINARY_FOLDER,
        }),
      );
      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => ({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      }));
    }

    await product.save();
    res.status(200).json({
      success: true,
      message: "Product fully updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patch partial product fields
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin
const patchProductPartial = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.images) {
      return res.status(400).json({
        success: false,
        message: "Use PUT endpoint to modify structured image arrays.",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("category", "name slug");

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product target not found" });
    }

    res.status(200).json({
      success: true,
      message: "Field patched successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product profile and clean storage buckets
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product profile target not found" });
    }

    // Direct, elegant asset removal from Cloudinary without URL substring splits
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((img) =>
        destroyFromCloudinary(img.publicId),
      );
      await Promise.all(deletePromises).catch((err) =>
        console.log("Cloudinary asset removal skip:", err.message),
      );
    }

    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: "Product and associated media deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductFull,
  patchProductPartial,
  deleteProduct,
};
