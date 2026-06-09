import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const ensureCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "customer") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    req.customer = await Customer.findById(decoded.id).select(
      "-otp -otpExpiresAt"
    );
    if (!req.customer) {
      return res
        .status(401)
        .json({ success: false, message: "Customer not found." });
    }

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};
