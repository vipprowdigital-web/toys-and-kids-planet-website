/**
 * customerPassport.js
 *
 * Registers the "google-customer" passport strategy ONLY when
 * GOOGLE_CLIENT_ID_CUSTOMER and GOOGLE_CLIENT_SECRET_CUSTOMER are set in .env.
 *
 * If those env vars are missing / placeholder the strategy is simply skipped —
 * the server still starts fine and every other auth method (email OTP) works.
 * Google login will return a clear error message instead of crashing at boot.
 */

import dotenv from "dotenv";
dotenv.config(); // Must run before reading process.env — app.js calls it too late (after imports)

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Customer from "../models/customer.model.js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID_CUSTOMER;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET_CUSTOMER;

const isConfigured =
  !!CLIENT_ID &&
  !!CLIENT_SECRET &&
  CLIENT_ID !== "your_google_client_id_here" &&
  CLIENT_SECRET !== "your_google_client_secret_here";

if (isConfigured) {
  passport.use(
    "google-customer",
    new GoogleStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/customer/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          let customer = await Customer.findOne({ googleId: profile.id });

          if (!customer && email) {
            customer = await Customer.findOne({ email });
          }

          if (!customer) {
            customer = new Customer({
              googleId: profile.id,
              name: profile.displayName,
              email,
              avatar: profile.photos?.[0]?.value,
              provider: "google",
              isVerified: true,
            });
          } else {
            if (!customer.googleId) customer.googleId = profile.id;
            if (!customer.avatar && profile.photos?.[0]?.value)
              customer.avatar = profile.photos[0].value;
            customer.provider = "google";
            customer.isVerified = true;
          }

          await customer.save();
          return done(null, customer);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
  console.log("✅ Customer Google OAuth strategy registered.");
} else {
  console.warn(
    "⚠️  Customer Google OAuth is NOT configured. " +
      "Set GOOGLE_CLIENT_ID_CUSTOMER and GOOGLE_CLIENT_SECRET_CUSTOMER in .env to enable it. " +
      "Email OTP login works without it.",
  );
}

export { isConfigured as isGoogleCustomerConfigured };
