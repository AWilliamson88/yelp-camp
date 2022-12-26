const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

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

    // Get & add the geodata
    await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    })
        .send()
        .then(response => {
            newCampground.geometry = response.body.features[0].geometry;
        });

    // save the new campground into db
    await newCampground.save();
    console.log(newCampground)
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
    console.log(req.body);
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    const updatedCampground =
        await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCampground.images.push(...images);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(updatedCampground);
    }
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