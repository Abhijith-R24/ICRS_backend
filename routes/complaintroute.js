const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB per file
    files: 8,                     // max total files
  },
});

// // ✅ Upload image to Cloudinary
// router.post("/upload/image", uploadImage.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     res.status(200).json({ url: req.file.path });
//   } catch (error) {
//     console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
//     console.log("Image upload error:", error); // ✅ add this
//     res.status(500).json({ message: "Image upload failed", error: error.message });
//   }
// });

// // ✅ Upload video to Cloudinary
// router.post("/upload/video", uploadVideo.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     res.status(200).json({ url: req.file.path });
//   } catch (error) {
//     console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
//     console.log("Video upload error:", error);
//     res.status(500).json({ message: "Video upload failed", error: error.message });
//   }
// });

// // ✅ Upload document to Cloudinary
// router.post("/upload/document", uploadDocument.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     res.status(200).json({ url: req.file.path });
//   } catch (error) {
//     console.log("Image upload error:", JSON.stringify(error, null, 2)); // ✅ stringify
//     console.log("Document upload error:", error);
//     res.status(500).json({ message: "Document upload failed", error: error.message });
//   }
// });

// ✅ Add this after your upload routes
router.use((error, req, res, next) => {
  console.log("Middleware error:", error.message);
  console.log("Middleware error stack:", error.stack);
  res.status(500).json({ message: error.message });
});

const uploadToCloudinary = (buffer, folder, resource_type = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Create a new complaint
router.post("/", upload.fields([
  { name: "images", maxCount: 5 },
  { name: "videos", maxCount: 3 },
]), 
async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body); // ✅ add this
    console.log("FILES RECEIVED:", req.files); // ✅ add this
    const { userId,crimeType, description, location, reportedBy, phone, email, date, isEmergency } = req.body;

    // ✅ Add this check
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Replace your current imageUrls / videoUrls lines with this:

const imageUrls = req.files?.images
  ? await Promise.all(
      req.files.images.map((file, i) => {
        console.log(`Uploading image ${i}: ${file.originalname}, size: ${file.size}`);
        return uploadToCloudinary(file.buffer, "complaints/images", "image")
          .catch(err => {
            console.error(`Image ${i} failed:`, err.message);
            throw err; // re-throw so you see which one failed
          });
      })
    )
  : [];

const videoUrls = req.files?.videos
  ? await Promise.all(
      req.files.videos.map((file, i) => {
        console.log(`Uploading video ${i}: ${file.originalname}, size: ${file.size}`);
        return uploadToCloudinary(file.buffer, "complaints/videos", "video")
          .catch(err => {
            console.error(`Video ${i} failed:`, err.message);
            throw err;
          });
      })
    )
  : [];

    const complaint = new Complaint({
      userId,
      crimeType,
      description,
      location,
      reportedBy,
      phone,
      email,
      date,
      status: "Active",
      isEmergency: isEmergency || false,
      evidence: {
        images: imageUrls,
        videos: videoUrls,
      },
    });
    console.log("Evidence before save:", complaint.evidence);
    await complaint.save();
    console.log("Saved complaint evidence:", complaint.evidence.images);
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
