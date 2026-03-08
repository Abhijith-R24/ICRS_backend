const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,  // ✅ matches _id in User schema
    ref: "User",                            // ✅ links to User model
    required: true
  },

  reportedBy: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  crimeType: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ["Active", "Approved", "Rejected", "Review", "Resolved"],
    default: "Active"
  },

  isEmergency: {
    type: Boolean,
    default: false
  },

  evidence: {
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);