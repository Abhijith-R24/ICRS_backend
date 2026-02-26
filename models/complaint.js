const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

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
    enum: ["Active", "Review", "Resolved"],
    default: "Active"
  },
  
  evidence: {
    images: {
      type: [String], // Array of image URLs
      default: []
    },
    videos: {
      type: [String], // Array of video URLs
      default: []
    },
    documents: {
      type: [String], // Array of document URLs
      default: []
    }
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
