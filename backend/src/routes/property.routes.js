const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const upload = require('../middleware/upload.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const fs = require('fs');

require("../models/user.model");
// Placeholder routes
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', upload.array('media'), async (req, res) => {
  try {
    const filePaths = req.files.map(file => `/static/${file.filename}`);
    const property = new Property({
      mediaPaths: filePaths,
      // userId: req.userId,
      ...req.body
    });
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    // delete media files
    req.files.forEach(file => {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.error(error);
        }
      })
    });

    res.status(400).json({ message: error.message });
  }
});


// find property by id
router.get('/:id', (req, res) => {
  try {
    const property = Property.findById(req.params.id).populate('owner');
    res.status(200).json(property);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', upload.array('media'), (req, res) => {
  try {
    const filePaths = req.files.map(file => `/static/${file.filename}`);
    const property = Property.findById(req.params.id);
    const oldMediaPaths = property.mediaPaths;

    const updatedProperty = Property.findByIdAndUpdate(req.params.id, {
      mediaPaths: filePaths,
      ...req.body
    });
    updatedProperty.save();
    // delete old media files
    oldMediaPaths.forEach(path => {
      fs.unlink(path, (error
      ) => {
        if (error) {
          console.error(error);
        }
      }
      );
    }
    );
    res.status(200).json(property);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
