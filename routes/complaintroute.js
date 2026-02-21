const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");

// Create a new complaint
router.post("/", async (req, res) => {
  try {
    const { crimeType, description, location, repoertedB } = req.body;

    const complaint = new Complaint({
      crimeType,
      description,
      location,
      repoertedB,
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

module.exports = router;
