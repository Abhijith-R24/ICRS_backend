const express = require("express");
const router = express.Router();
const Admin = require("../models/users"); // make sure this exists
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const complaint = require("../models/complaint");
const dotenv = require("dotenv");

dotenv.config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {   
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Admin registration
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// admin gets all complaints
router.get("/complaint", async (req, res) => {
  try {
    const complaints = await complaint.find();
    res.status(200).json(complaints);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch complaints data",
        error: error.message,
      });
  }
});


// Update complaint status and send acknowledgement email
router.put("/complaint/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaintToUpdate = await complaint.findById(id);
    if (!complaintToUpdate) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    complaintToUpdate.status = status;

    // Send acknowledgement ONLY if not already sent
    // if (!complaintToUpdate.acknowledgementSent) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: complaintToUpdate.email,
        subject: "Complaint Acknowledgement",
        html: `
          <h3>Complaint Received</h3>
          <p>Your complaint has been acknowledged.</p>
          <p><strong>Complaint ID:</strong> ${complaintToUpdate._id}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p>We will investigate and update you soon.</p>
        `,
      });



    //   complaintToUpdate.acknowledgementSent = true;
    // }

    await complaintToUpdate.save();

    res
      .status(200)
      .json({
        message: "Complaint status updated successfully",
        complaint: complaintToUpdate,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update complaint status",
        error: error.message,
      });
  }
});

module.exports = router;
