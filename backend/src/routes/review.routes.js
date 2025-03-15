const express = require('express');
const router = express.Router();
const Review = require('../models/review.model');
const { authMiddleware } = require('../middleware/auth.middleware');


// ✅ Add a Review (for a roommate or apartment)
router.post('/', authMiddleware, async (req, res) => {
  const { reviewedUser, reviewedApartment, rating, comment } = req.body;

  if (!reviewedUser && !reviewedApartment) {
    return res.status(400).json({ message: 'You must review either a roommate or an apartment.' });
  }

  try {
    const review = new Review({
      reviewer: req.user.userId,
      reviewedUser,
      reviewedApartment,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ✅ Get Reviews for a User (on Profile Dashboard)
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId }).populate('reviewer', 'firstName lastName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Reviews for an Apartment
router.get('/apartment/:apartmentId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedApartment: req.params.apartmentId }).populate('reviewer', 'firstName lastName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete a Review (Only by the reviewer)
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.reviewer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
