const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html')

// create an escapeHTML rule.
const htmlSafe = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(htmlSafe);

// Campground validation schema
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
        price: Joi.number().min(0).precision(2).required()
    }).required(),
    deleteImages: Joi.array()
});

// Review validation schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).integer().required(),
        body: Joi.string().required().escapeHTML()
    }).required()
});