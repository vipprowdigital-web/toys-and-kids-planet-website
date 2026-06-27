import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";

const signToken = (vendor) =>
  jwt.sign(
    { id: vendor._id, email: vendor.email, role: "vendor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

// @desc   Register / create a new vendor shop
// @route  POST /api/v1/vendor/register
// @access Public
export const registerVendor = async (req, res) => {
  try {
    const { shopName, ownerName, email, phone, password, description, address, gstNumber, panNumber } =
      req.body;

    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: "shopName, ownerName, email and password are required." });
    }

    const existing = await Vendor.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "A shop with this email already exists." });
    }

    const vendor = await Vendor.create({
      shopName,
      ownerName,
      email,
      phone,
      password,
      description,
      address,
      gstNumber,
      panNumber,
      status: "pending", // must be approved by platform admin before they can list products
    });

    res.status(201).json({
      success: true,
      message: "Shop registration submitted. You will be notified once approved.",
      data: {
        _id: vendor._id,
        shopName: vendor.shopName,
        slug: vendor.slug,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Vendor login
// @route  POST /api/v1/vendor/login
// @access Public
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = signToken(vendor);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      data: {
        _id: vendor._id,
        shopName: vendor.shopName,
        slug: vendor.slug,
        email: vendor.email,
        ownerName: vendor.ownerName,
        logo: vendor.logo,
        status: vendor.status,
        commissionRate: vendor.commissionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get logged-in vendor's own profile
// @route  GET /api/v1/vendor/me
// @access Vendor
export const getVendorMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.vendor });
};

// @desc   Update own vendor profile
// @route  PATCH /api/v1/vendor/me
// @access Vendor
export const updateVendorMe = async (req, res) => {
  try {
    const allowed = ["shopName", "description", "phone", "address", "gstNumber", "panNumber"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const vendor = await Vendor.findByIdAndUpdate(req.vendor._id, { $set: updates }, { new: true, runValidators: true }).select("-password");
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
