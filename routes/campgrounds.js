const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const CatchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


router.route('/')
    .get(CatchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        validateCampground,
        CatchAsync(campgrounds.createCampgrounds));

router.get('/new',
    isLoggedIn,
    campgrounds.renderNewForm);

router.route('/:id')
    .get(CatchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,
        validateCampground,
        isAuthor,
        CatchAsync(campgrounds.updateCampgrounds))
    .delete(
        isLoggedIn,
        isAuthor,
        CatchAsync(campgrounds.deleteCampgrounds));

router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    CatchAsync(campgrounds.editCampgrounds));

module.exports = router;