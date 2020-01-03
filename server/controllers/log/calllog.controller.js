const Joi = require('joi');
const helper = require('../../utils/helper');

const callLogCreateSchema = Joi.object({
    vendor: Joi.string().required(),
    customer: Joi.string().required()
})

module.exports = {
    verifyCreate
}

function verifyCreate(area) { return helper.validator(area, callLogCreateSchema) }

