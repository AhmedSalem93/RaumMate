const express = require('express');
const router = express.Router();
const Rating = require('../models/rating.model');
const Property = require('../models/property.model');
const { authMiddleware, requireRole, addUserToRequest } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Add a rating to a property
router.post('/:propertyId', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { propertyId } = req.params;
        const userId = req.userId;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user has already rated this property
        let userRating = await Rating.findOne({ property: propertyId, user: userId });

        if (userRating) {
            // Update existing rating
            userRating.rating = rating;
            userRating.comment = comment;
            await userRating.save();
        } else {
            // Create new rating
            userRating = new Rating({
                property: propertyId,
                user: userId,
                rating,
                comment
            });
            await userRating.save();
        }

        // Update property's average rating
        const allRatings = await Rating.find({ property: propertyId });
        const ratingSum = allRatings.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = ratingSum / allRatings.length;

        // Update property with new rating data - adapted for new structure
        property.reviews.averageRating = averageRating;
        property.reviews.count = allRatings.length;
        await property.save();

        res.status(201).json(userRating);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get the authenticated user's ratings for a specific property
router.get('/myratings/:propertyId', authMiddleware, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.userId;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Find the user's rating for this property
        const rating = await Rating.findOne({
            property: propertyId,
            user: userId
        }).populate('user', 'firstName lastName profilePicture');
        if (!rating) {
            return res.status(200).json({
                hasRated: false,
                message: 'You have not rated this property yet'
            });
        }
        console.log(rating);

        res.status(200).json({
            hasRated: true,
            rating
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all ratings by a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
    // TODO: Only verified users can access this route
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Verify the user exists or is the same user requesting (if not admin)
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to access these ratings' });
        }

        const totalRatings = await Rating.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalRatings / limit);

        const ratings = await Rating.find({ user: userId })
            .populate('property', 'title mediaPaths location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            ratings,
            pagination: {
                currentPage: page,
                totalPages,
                totalRatings,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Count ratings by star level (1-5)
        const ratingCounts = await Rating.aggregate([
            { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Create a map of rating level to count
        const ratingDistribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        ratingCounts.forEach(item => {
            ratingDistribution[item._id] = item.count;
        });

        res.status(200).json({
            averageRating: property.reviews.averageRating,
            totalReviews: property.reviews.count,
            distribution: ratingDistribution
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
// Routes with path segments after parameters must also come before plain parameter routes


// Get all ratings for a property with pagination
router.get('/:propertyId', authMiddleware, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.userId; // Get the authenticated user's ID

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Create query to exclude the current user's rating
        const query = { property: propertyId };
        if (userId) {
            query.user = { $ne: userId }; // Exclude ratings by the current user
        }

        const totalRatings = await Rating.countDocuments(query);
        const totalPages = Math.ceil(totalRatings / limit);

        const ratings = await Rating.find(query)
            .populate('user', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            ratings,
            summary: {
                averageRating: property.reviews.averageRating,
                count: property.reviews.count
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalRatings,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a rating (only the user who created it can delete)
router.delete('/:ratingId', authMiddleware, async (req, res) => {
    try {
        const { ratingId } = req.params;
        const userId = req.userId;

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        // Check if the user is the owner of the rating
        if (rating.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this rating' });
        }

        await Rating.deleteOne({ _id: ratingId });

        // Update property's average rating
        const propertyId = rating.property;
        const allRatings = await Rating.find({ property: propertyId });

        const property = await Property.findById(propertyId);

        if (allRatings.length === 0) {
            property.reviews.averageRating = 0;
            property.reviews.count = 0;
        } else {
            const ratingSum = allRatings.reduce((sum, item) => sum + item.rating, 0);
            property.reviews.averageRating = ratingSum / allRatings.length;
            property.reviews.count = allRatings.length;
        }

        await property.save();

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
