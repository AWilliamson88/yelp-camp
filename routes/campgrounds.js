const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const CatchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


router.get('/', CatchAsync(campgrounds.index));

router.get('/new',
    isLoggedIn,
    campgrounds.renderNewForm);

// Create a new campground
router.post('/',
    isLoggedIn,
    validateCampground,
    CatchAsync(campgrounds.createCampgrounds));

// show a single campground
router.get('/:id', CatchAsync(campgrounds.showCampground));

// Edit page for a single campground
router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    CatchAsync(campgrounds.editCampgrounds));

// Update a single campground.
router.put('/:id',
    isLoggedIn,
    validateCampground,
    isAuthor,
    CatchAsync(campgrounds.updateCampgrounds));

// Delete a single campground
router.delete('/:id',
    isLoggedIn,
    isAuthor,
    CatchAsync(campgrounds.deleteCampgrounds));

module.exports = router;