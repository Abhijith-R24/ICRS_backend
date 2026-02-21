const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // adjust path if db.js is elsewhere

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// 🔹 Import authRoutes
const authRoutes = require("./routes/authroute");

// 🔹 Use authRoutes
app.use("/api/auth", authRoutes);

// 🔹 Import complaintRoutes
const complaintRoutes = require("./routes/complaintroute");

// 🔹 Use complaintRoutes
app.use("/api/complaints", complaintRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server Listen
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
