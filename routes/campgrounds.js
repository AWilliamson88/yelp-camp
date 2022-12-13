const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const CatchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


// Routes
router.get('/', CatchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('./campgrounds/new');
});

// Create a new campground
router.post('/', isLoggedIn, validateCampground, CatchAsync(async (req, res, next) => {
    // get the new campground data.
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    // save the new campground into db
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground.');
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

// show a single campground
router.get('/:id', CatchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate:
            {
                path: 'author'
            }
        })
        .populate('author');

    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('./campgrounds/show', { campground });
}));

// Edit page for a single campground
router.get('/:id/edit', isLoggedIn, isAuthor, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('./campgrounds/edit', { campground });
}));

// Update a single campground.
router.put('/:id', isLoggedIn, validateCampground, isAuthor, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    const update =
        await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true });
    req.flash('success', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete a single campground
router.delete('/:id', isLoggedIn, isAuthor, CatchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Campgrounds deleted successfully!');
    res.redirect('/campgrounds');
}));

module.exports = router;