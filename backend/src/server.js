// src/ server.js

import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 7000;

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
