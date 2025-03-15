const express = require('express');
const router = express.Router();

const Property = require('../models/property.model');
const upload = require('../middleware/upload.middleware');
const { authMiddleware, requireRole, addUserToRequest } = require('../middleware/auth.middleware');
const fs = require('fs');

require("../models/user.model");

// get endpoint with multi-criteria search filtering
router.get('/', addUserToRequest, async (req, res) => {
  try {
    console.log(req.query);
    let {
      city,
      minPrice,
      maxPrice,
      isSublet,
      amenities,
      subletStartDate,
      subletEndDate,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;

    // Build the query object
    const query = {};

    // Location filter
    if (city) {
      query['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Must be available filter
    query.isAvailable = true;

    // Sublet filter
    if (isSublet !== undefined) {
      query.isSublet = isSublet === 'true';
    }

    // Amenities filter
    if (amenities) {
      // get any properties that have at least one of the amenities
      query.amenities = { $in: amenities };
    }

    // Sublet dates filter
    if (subletStartDate || subletEndDate) {

      if (subletStartDate) {
        // We want properties that are available at the requested start date
        // This means their start date must be on or before our requested date
        // AND their end date must be after our requested date
        query['subletDates.start'] = { $lte: new Date(subletStartDate) };
        // Add this to ensure the property is still available at the requested date
        if (!subletEndDate) {
          query['subletDates.end'] = { $gte: new Date(subletStartDate) };
        }
      }

      if (subletEndDate) {
        // For end date, we want properties that are still available at that date
        query['subletDates.end'] = { $gte: new Date(subletEndDate) };
      }
    }

    // Log the query for debugging
    console.log("Query: " + JSON.stringify(query));
    // Create sort configuration
    const sortConfig = {};

    // Valid sort fields
    const validSortFields = ['price', 'date'];
    if (!validSortFields.includes(sortBy)) {
      throw new Error('Invalid sortBy field');
    }

    sortBy = sortBy || 'date';
    // Default sort is by createdAt (newest first)
    const field = sortBy === 'price' ? 'price' : 'createdAt';

    // Sort order (1 for ascending, -1 for descending)
    // Default to descending for dates (newest first) and ascending for price (cheapest first)
    let order = 1; // default ascending
    if (sortOrder === 'desc') {
      order = -1;
    } else if (!sortOrder && field === 'createdAt') {
      // If no order specified and sorting by date, use descending (newest first)
      order = -1;
    }

    sortConfig[field] = order;

    // Calculate skip value for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    // Apply pagination to query
    const properties = await Property.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner');



    // if the user is a guest, we only show the city as the location and not the full address
    if (req.user.role === 'guest') {
      properties.forEach(property => {
        property.location.address = undefined;
        property.location.coordinates = undefined;
      });
    }


    // console.log("Search Results" + properties);
    res.status(200).json({
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error in search: " + error);
    res.status(500).json({ message: error.message });
  }
});


// Placeholder routes
// router.get('/', async (req, res) => {
//   try {
//     const properties = await Property.find().populate('owner');
//     res.status(200).json(properties);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.post('/', authMiddleware, addUserToRequest, requireRole('verified'), upload.array('media'), async (req, res) => {
  try {
    const filePaths = req.files.map(file => `/static/${file.filename}`);
    const property = new Property({
      mediaPaths: filePaths,
      owner: req.userId,
      ...req.body
    });
    console.log("UserID: " + req.userId);
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


// Move the amenities route BEFORE the :id route to fix the routing order
router.get('/amenities', async (req, res) => {
  try {
    const amenities = await Property.distinct('amenities');
    console.log("Amenities: " + amenities);
    res.status(200).json(amenities);
  } catch (error) {
    console.log("Error in getting amenities: " + error);
    res.status(500).json({ message: error.message });
  }
});

// find property by id
router.get('/:id', addUserToRequest, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  }
  catch (error) {
    console.error("Error fetching property:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', addUserToRequest, upload.array('media'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const oldMediaPaths = property.mediaPaths;
    const filePaths = req.files.map(file => `/static/${file.filename}`);

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        mediaPaths: filePaths,
        ...req.body
      },
      { new: true }
    );

    // delete old media files
    oldMediaPaths.forEach(path => {
      fs.unlink(path.replace('/static/', './static/'), (error) => {
        if (error) {
          console.error("Error deleting file:", error);
        }
      });
    });

    res.status(200).json(updatedProperty);
  }
  catch (error) {
    console.error("Error updating property:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
