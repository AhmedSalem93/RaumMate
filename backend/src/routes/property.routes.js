const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const upload = require('../middleware/upload.middleware');
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
      ...req.body
    });
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
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

router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Update property ${req.params.id} endpoint` });
});

module.exports = router;
