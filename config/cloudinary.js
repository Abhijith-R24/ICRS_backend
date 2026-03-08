const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints/images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// ✅ Storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov"],
  },
});

// // ✅ Storage for documents
// const documentStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "complaints/documents",
//     resource_type: "raw",
//     allowed_formats: ["pdf", "doc", "docx"],
//   },
// });

const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });
// const uploadDocument = multer({ storage: documentStorage });

module.exports = { uploadImage, uploadVideo };