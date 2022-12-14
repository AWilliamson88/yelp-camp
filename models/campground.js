const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});

const options = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options);

CampgroundSchema.virtual('properties.popUpHTML').get(function () {
    return `<a href="/campgrounds/${this._id}"><h5>${this.title}</h5></a>
        <p>${this.description.substring(0, 50)}...</p>
        <strong>$${this.price}/Night</strong>`;
});

CampgroundSchema.virtual('properties.avgRating').get(function () {
    let total = 0;
    for (let review of this.reviews) {
        total += review.rating;
    }
    return (total / this.reviews.length).toFixed(1);
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log(doc);
})


module.exports = mongoose.model('Campground', CampgroundSchema);