const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");



// Create a new complaint
router.post("/", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body); // ✅ add this
    const { userId,crimeType, description, location, reportedBy, phone, email, evidence, date, isEmergency } = req.body;

    // ✅ Add this check
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    console.log("userId is valid:", userId);

    const complaint = new Complaint({
      userId,
      crimeType,
      description,
      location,
      reportedBy,
      phone,
      email,
      evidence,
      date,
      status: "Active",
      isEmergency: isEmergency || false
    });
    await complaint.save();
    res
      .status(201)
      .json({ message: "Complaint registered successfully", complaint });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to register complaint", error: error.message });
  }
});

// Add this BEFORE the /:id routes to avoid conflicts
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const complaints = await Complaint.find({ userId }).sort({ isEmergency: -1, date: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user complaints",
      error: error.message,
    });
  }
});

// Get all complaints

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch complaints", error: error.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const activeComplaints = await Complaint.find({ status: "Active" });
    res.status(200).json(activeComplaints);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch active complaints", error: error.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;  
    const { status } = req.body;
    const complaintToUpdate = await Complaint.findById(id);
    if (!complaintToUpdate) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    complaintToUpdate.status = status;
    await complaintToUpdate.save();
    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: complaintToUpdate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
});



module.exports = router;
