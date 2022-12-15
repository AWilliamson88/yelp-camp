const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('./campgrounds/new');
}

module.exports.createCampgrounds = async (req, res, next) => {
    // get the new campground data.
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id;
    // save the new campground into db
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully made a new campground.');
    res.redirect(`/campgrounds/${newCampground._id}`);
}


module.exports.showCampground = async (req, res) => {
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
}


module.exports.editCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('./campgrounds/edit', { campground });
}


module.exports.updateCampgrounds = async (req, res) => {
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
}


module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Campgrounds deleted successfully!');
    res.redirect('/campgrounds');
}