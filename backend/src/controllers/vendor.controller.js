import Vendor from "../models/vendor.model.js";
import Product from "../models/product.model.js";

// ─── Public Routes ────────────────────────────────────────────────────────────

// @desc   List all approved vendors (for frontend shop directory)
// @route  GET /api/v1/vendors
// @access Public
export const listVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const query = { status: "approved" };
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .select("-password -gstNumber -panNumber -email -phone -address")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get a single vendor shop by slug or id
// @route  GET /api/v1/vendors/:slugOrId
// @access Public
export const getVendor = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const query = slugOrId.match(/^[0-9a-fA-F]{24}$/) ? { _id: slugOrId } : { slug: slugOrId };

    const vendor = await Vendor.findOne({ ...query, status: "approved" })
      .select("-password -gstNumber -panNumber");

    if (!vendor) return res.status(404).json({ success: false, message: "Shop not found." });

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all active products belonging to a vendor shop
// @route  GET /api/v1/vendors/:slugOrId/products
// @access Public
export const getVendorProducts = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const vendorQuery = slugOrId.match(/^[0-9a-fA-F]{24}$/) ? { _id: slugOrId } : { slug: slugOrId };

    const vendor = await Vendor.findOne({ ...vendorQuery, status: "approved" });
    if (!vendor) return res.status(404).json({ success: false, message: "Shop not found." });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const ageGroup = req.query.ageGroup || "";

    const productQuery = { vendor: vendor._id, isActive: true };
    if (search) productQuery.$or = [{ name: { $regex: search, $options: "i" } }];
    if (category) productQuery.category = category;
    if (ageGroup) productQuery.ageGroup = ageGroup;

    const total = await Product.countDocuments(productQuery);
    const products = await Product.find(productQuery)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      vendor: {
        _id: vendor._id,
        shopName: vendor.shopName,
        slug: vendor.slug,
        logo: vendor.logo,
        banner: vendor.banner,
        description: vendor.description,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
      },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Platform Admin Routes ────────────────────────────────────────────────────

// @desc   List ALL vendors (including pending/rejected) — for admin
// @route  GET /api/v1/admin/vendors
// @access Admin
export const adminListVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const search = req.query.search || "";

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get a single vendor (admin)
// @route  GET /api/v1/admin/vendors/:id
// @access Admin
export const adminGetVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("-password");
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found." });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve / reject / suspend a vendor
// @route  PATCH /api/v1/admin/vendors/:id/status
// @access Admin
export const adminUpdateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).select("-password");

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found." });

    res.status(200).json({ success: true, message: `Vendor ${status}.`, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update commission rate for a vendor
// @route  PATCH /api/v1/admin/vendors/:id/commission
// @access Admin
export const adminUpdateCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ success: false, message: "commissionRate must be 0–100." });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { commissionRate },
      { new: true },
    ).select("-password");

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found." });

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a vendor and all their products
// @route  DELETE /api/v1/admin/vendors/:id
// @access Admin
export const adminDeleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found." });

    // Remove all products belonging to this vendor
    await Product.deleteMany({ vendor: vendor._id });
    await vendor.deleteOne();

    res.status(200).json({ success: true, message: "Vendor and their products deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
