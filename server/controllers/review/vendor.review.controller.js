const Joi = require('joi');
const helper = require('../../utils/helper');

const vendorReviewSchmea = Joi.object({
    comment: Joi.string().required(),
    customer: Joi.string().required(),
    rating: Joi.number().max(5).min(1).required(),
    vendor: Joi.string().required(),
})

module.exports = {
    verifyCreate
}

function verifyCreate(review) { return helper.validator(review, vendorReviewSchmea) }

