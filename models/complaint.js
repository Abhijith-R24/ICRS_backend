const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
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
  reportedBy: {
    type: String
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
