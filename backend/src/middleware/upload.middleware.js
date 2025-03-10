const multer = require('multer');
const path = require('path');

// Define storage location and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/')  // Files will be saved in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + Math.floor(Math.random() * 9999999) + '_' + file.originalname)  // Unique filename with timestamp and Random Number
    }
});

const upload = multer({ storage });

module.exports = upload;
