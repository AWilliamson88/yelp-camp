const Joi = require('joi');

// Campground validation schema
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        // image: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).precision(2).required()
    }).required(),
    deleteImages: Joi.array()
});

// Review validation schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).integer().required(),
        body: Joi.string().required()
    }).required()
});