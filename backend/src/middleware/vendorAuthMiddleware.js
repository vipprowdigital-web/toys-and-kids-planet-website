import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";

export const ensureVendor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "vendor") {
      return res.status(403).json({ message: "Access denied. Vendor token required." });
    }

    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (!vendor) {
      return res.status(401).json({ message: "Vendor not found." });
    }

    if (vendor.status !== "approved") {
      return res.status(403).json({
        message: `Your shop is ${vendor.status}. Contact support for assistance.`,
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Admin can also act on vendor routes (e.g. platform admin reviewing vendor products)
export const ensureVendorOrAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "vendor") {
      const vendor = await Vendor.findById(decoded.id).select("-password");
      if (!vendor) return res.status(401).json({ message: "Vendor not found." });
      if (vendor.status !== "approved") {
        return res.status(403).json({ message: `Shop is ${vendor.status}.` });
      }
      req.vendor = vendor;
    } else {
      // Treat as admin (existing User model)
      const User = (await import("../models/user.model.js")).default;
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "Admin not found." });
      req.user = user;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
