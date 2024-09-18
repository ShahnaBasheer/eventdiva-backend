const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.memoryStorage();

// // File filter for multer (optional)
// const fileFilter = (req, file, cb) => {
//     // Check file type based on MIME type
//     if (file.mimetype === 'image/jpeg' ||
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'application/pdf') {
//         cb(null, true); // Accept file
//     } else {
//         cb(new Error('Only JPEG, PNG, and PDF files are allowed')); // Reject file
//     }
// };


const fileFields = [
    { name: 'coverPic', maxCount: 1 },
    { name: 'document', maxCount: 1 },  // For a single document file
    { name: 'portfolios', maxCount: 5 }  // For up to 5 portfolio files
  ];

// Configure multer upload
const upload = multer({ storage }).fields(fileFields);

export {
    upload
};
