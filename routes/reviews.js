const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');
const CatchAsync = require('../utils/CatchAsync');

router.post('/',
    isLoggedIn,
    validateReview,
    CatchAsync(reviews.createReview));

router.delete('/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    CatchAsync(reviews.deleteReview));

module.exports = router;