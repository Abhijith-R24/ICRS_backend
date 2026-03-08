const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");
const mongoose = require("mongoose");
const { uploadImage, uploadVideo, uploadDocument } = require("../config/cloudinary");

// ✅ Upload image to Cloudinary
router.post("/upload/image", uploadImage.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ url: req.file.path });
  } catch (error) {
    console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
    console.log("Image upload error:", error); // ✅ add this
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});

// ✅ Upload video to Cloudinary
router.post("/upload/video", uploadVideo.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ url: req.file.path });
  } catch (error) {
    console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
    console.log("Video upload error:", error);
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
});

// ✅ Upload document to Cloudinary
router.post("/upload/document", uploadDocument.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ url: req.file.path });
  } catch (error) {
    console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
    console.log("Document upload error:", error);
    res.status(500).json({ message: "Document upload failed", error: error.message });
  }
});

// ✅ Add this after your upload routes
router.use((error, req, res, next) => {
  console.log("Middleware error:", error.message);
  console.log("Middleware error stack:", error.stack);
  res.status(500).json({ message: error.message });
});

// Create a new complaint
router.post("/", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body); // ✅ add this
    const { userId,crimeType, description, location, reportedBy, phone, email, evidence, date, isEmergency } = req.body;

    // ✅ Add this check
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
    // const complaints = await Complaint.find({ userId }).sort({ isEmergency: -1, date: -1 });
    // res.status(200).json(complaints);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const complaints = await Complaint.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ isEmergency: -1, date: -1 });
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
