const express = require('express');
const router = express.Router();
const Rating = require('../models/rating.model');
const Property = require('../models/property.model');
const authMiddleware = require('../middleware/auth.middleware');

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
        property.Reviews.averageRating = averageRating;
        property.Reviews.count = allRatings.length;
        await property.save();

        res.status(201).json(userRating);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all ratings for a property
router.get('/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const ratings = await Rating.find({ property: propertyId })
            .populate('user', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            ratings,
            summary: {
                averageRating: property.Reviews.averageRating,
                count: property.Reviews.count
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
            property.Reviews.averageRating = 0;
            property.Reviews.count = 0;
        } else {
            const ratingSum = allRatings.reduce((sum, item) => sum + item.rating, 0);
            property.Reviews.averageRating = ratingSum / allRatings.length;
            property.Reviews.count = allRatings.length;
        }

        await property.save();

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get rating stats by property
router.get('/:propertyId/stats', async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Count ratings by star level (1-5)
        const ratingCounts = await Rating.aggregate([
            { $match: { property: mongoose.Types.ObjectId(propertyId) } },
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
            averageRating: property.Reviews.averageRating,
            totalReviews: property.Reviews.count,
            distribution: ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
