/**
 * customerAuth.controller.js
 *
 * Handles customer (storefront) authentication — completely separate from
 * the admin User/auth system.
 *
 * Auth flows:
 *   1. Email OTP  — POST /send-otp  → POST /verify-otp
 *   2. Google OAuth — GET /google   → GET /google/callback
 *
 * No password is stored. OTP is a 6-digit code valid for 10 minutes.
 * After verification a JWT with role:"customer" is issued.
 *
 * Email delivery uses nodemailer with the SMTP env vars.
 * If SMTP is not configured the OTP is logged to console (dev fallback).
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import Customer from "../models/customer.model.js";
import {Resend} from "resend";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Hash OTP before storing so a DB leak doesn't expose codes */
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/** Sign a JWT for a verified customer */
function signToken(customer) {
  return jwt.sign(
    { id: customer._id, role: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
}

/** Try to send email via nodemailer — falls back to console.log if not configured */
const resend = new Resend(process.env.RESEND_API_KEY);
async function sendOTPEmail(toEmail, otp) {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `\n📧 OTP for ${toEmail}: ${otp} (RESEND_API_KEY not configured)\n`
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "Toys & Kids Planet <onboarding@resend.dev>",
      // to: toEmail,
      to: "vipprowdigital@gmail.com",
      subject: "Your login OTP — Toys & Kids Planet",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#1a2236;margin-bottom:8px;">🪀 Toys & Kids Planet</h2>

          <p style="color:#3d4a5c;font-size:15px;">
            Use the OTP below to sign in. It expires in <strong>10 minutes</strong>.
          </p>

          <div style="margin:24px 0;background:#f0fafa;border-radius:10px;padding:20px;text-align:center;">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a2236;">
              ${otp}
            </span>
          </div>

          <p style="color:#707f94;font-size:13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✅ OTP email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw error;
  }
}

// async function sendOTPEmail(toEmail, otp) {
//   const SMTP_HOST = process.env.SMTP_HOST;
//   const SMTP_USER = process.env.SMTP_USER;
//   const SMTP_PASS = process.env.SMTP_PASS;
//   const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

//   if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
//     // Dev fallback — print to terminal
//     console.log(`\n📧  OTP for ${toEmail}: ${otp}  (SMTP not configured)\n`);
//     return;
//   }

//   // Dynamic import so the app doesn't crash if nodemailer isn't installed yet
//   const nodemailer = await import("nodemailer").catch(() => null);
//   if (!nodemailer) {
//     console.log(`\n📧  OTP for ${toEmail}: ${otp}  (nodemailer not installed)\n`);
//     return;
//   }

//   const transporter = nodemailer.default.createTransport({
//     host: SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: process.env.SMTP_SECURE === "true",
//     auth: { user: SMTP_USER, pass: SMTP_PASS },
//   });

//   await transporter.sendMail({
//     from: `"Toys & Kids Planet" <${SMTP_FROM}>`,
//     to: toEmail,
//     subject: "Your login OTP — Toys & Kids Planet",
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
//         <h2 style="color:#1a2236;margin-bottom:8px;">🪀 Toys & Kids Planet</h2>
//         <p style="color:#3d4a5c;font-size:15px;">Use the OTP below to sign in. It expires in <strong>10 minutes</strong>.</p>
//         <div style="margin:24px 0;background:#f0fafa;border-radius:10px;padding:20px;text-align:center;">
//           <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a2236;">${otp}</span>
//         </div>
//         <p style="color:#707f94;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
//       </div>
//     `,
//   });
// }

// ─── Public safe customer shape ───────────────────────────────────────────────

function safeCustomer(c) {
  return {
    _id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar,
    provider: c.provider,
    isVerified: c.isVerified,
    wishlist: c.wishlist,
    addresses: c.addresses,
    createdAt: c.createdAt,
  };
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/customer/auth/send-otp
 * Body: { email }
 *
 * Creates or looks up the customer by email, generates an OTP, stores the
 * hashed version, then emails the plain OTP.
 */
export const sendEmailOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid email address is required." });
    }

    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert — create customer on first login
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({ email, provider: "email_otp" });
    }
    customer.otp = hashedOtp;
    customer.otpExpiresAt = expiresAt;
    await customer.save();

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Valid for 10 minutes.`,
    });
  } catch (err) {
    console.error("sendEmailOTP error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/v1/customer/auth/verify-otp
 * Body: { email, otp }
 *
 * Verifies the OTP. On success clears otp fields, marks isVerified, returns JWT.
 */
export const verifyEmailOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    const customer = await Customer.findOne({ email });
    if (!customer || !customer.otp || !customer.otpExpiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "No pending OTP for this email. Please request a new one." });
    }

    if (new Date() > customer.otpExpiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (customer.otp !== hashOTP(otp)) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect OTP. Please try again." });
    }

    // Clear OTP fields and mark verified
    customer.otp = undefined;
    customer.otpExpiresAt = undefined;
    customer.isVerified = true;
    await customer.save();

    const token = signToken(customer);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      customer: safeCustomer(customer),
    });
  } catch (err) {
    console.error("verifyEmailOTP error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Called by passport-google-oauth20 strategy callback.
 * Looks up or creates the customer, returns JWT as a redirect.
 *
 * GET /api/v1/customer/auth/google/callback  (passport sets req.user)
 */
export const googleCallback = async (req, res) => {
  try {
    const profile = req.user; // set by passport strategy in customerPassport.js
    if (!profile) {
      return res.redirect(
        `${process.env.NEXT_FRONTEND_URL}/auth?error=google_failed`,
      );
    }

    const token = signToken(profile);

    // Redirect back to frontend with token in query — frontend stores it
    return res.redirect(
      `${process.env.NEXT_FRONTEND_URL}/auth/callback?token=${token}`,
    );
  } catch (err) {
    console.error("googleCallback error:", err);
    return res.redirect(
      `${process.env.NEXT_FRONTEND_URL}/auth?error=server_error`,
    );
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/customer/me
 * Returns the authenticated customer's profile.
 */
export const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: safeCustomer(req.customer),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/v1/customer/me
 * Body: { name, phone }
 * Updates name and/or phone of the authenticated customer.
 */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const customer = req.customer;

    if (name !== undefined) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone.trim() || undefined;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: safeCustomer(customer),
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/customer/me/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const customer = await req.customer.populate({
      path: "wishlist",
      select: "name slug price originalPrice discount images badge inStock rating",
    });
    return res.status(200).json({ success: true, data: customer.wishlist });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/v1/customer/me/wishlist/:productId
 * Adds a product to wishlist (idempotent).
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = req.customer;

    const alreadyIn = customer.wishlist.some(
      (id) => id.toString() === productId,
    );
    if (!alreadyIn) {
      customer.wishlist.push(productId);
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadyIn ? "Already in wishlist." : "Added to wishlist.",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/v1/customer/me/wishlist/:productId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = req.customer;

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId,
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist.",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Addresses ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/customer/me/addresses
 */
export const getAddresses = async (req, res) => {
  return res
    .status(200)
    .json({ success: true, data: req.customer.addresses });
};

/**
 * POST /api/v1/customer/me/addresses
 * Body: { label, fullName, phone, line1, line2, city, state, pincode, isDefault }
 */
export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } =
      req.body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ success: false, message: "fullName, phone, line1, city, state and pincode are required." });
    }

    const customer = req.customer;

    // If new address is default, clear existing default
    if (isDefault) {
      customer.addresses.forEach((a) => (a.isDefault = false));
    }

    customer.addresses.push({
      label: label || "Home",
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    });

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Address added.",
      data: customer.addresses,
    });
  } catch (err) {
    console.error("addAddress error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/v1/customer/me/addresses/:addressId
 */
export const updateAddress = async (req, res) => {
  try {
    const customer = req.customer;
    const addr = customer.addresses.id(req.params.addressId);

    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found." });
    }

    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } =
      req.body;

    if (isDefault) customer.addresses.forEach((a) => (a.isDefault = false));

    if (label !== undefined) addr.label = label;
    if (fullName !== undefined) addr.fullName = fullName;
    if (phone !== undefined) addr.phone = phone;
    if (line1 !== undefined) addr.line1 = line1;
    if (line2 !== undefined) addr.line2 = line2;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;
    if (isDefault !== undefined) addr.isDefault = isDefault;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address updated.",
      data: customer.addresses,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/v1/customer/me/addresses/:addressId
 */
export const deleteAddress = async (req, res) => {
  try {
    const customer = req.customer;
    const addr = customer.addresses.id(req.params.addressId);

    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found." });
    }

    addr.deleteOne();
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted.",
      data: customer.addresses,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
