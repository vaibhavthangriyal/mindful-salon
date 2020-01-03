const Joi = require('joi');
const helper = require('../../utils/helper');

const vendorCreateSchema = Joi.object({
    area: Joi.string().optional().allow(''),
    street_address: Joi.string().required(),
    email: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    full_name: Joi.string().required(),
    is_active: Joi.boolean().required(),
    password: Joi.string().required(),
    mobile_number: Joi.string().required(),
    profile_picture: Joi.string().optional().allow(''),
    street_address: Joi.string().optional().allow(''),
    shop_number: Joi.string().optional().allow(''),
})
const vendoUpdateSchema = Joi.object({
    area: Joi.string().optional().allow(''),
    street_address: Joi.string().required(),
    full_name: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    is_active: Joi.boolean().required(),
    mobile_number: Joi.string().required(),
    password: Joi.string().required(),
    profile_picture: Joi.string().optional().allow(''),
    street_address: Joi.string().optional().allow(''),
    shop_number: Joi.string().optional().allow(''),
})

module.exports = {
    verifyVendorCreate,
    verifyVendorUpdate
}

function verifyVendorCreate(vendor) { return helper.validator(vendor, vendorCreateSchema) }
function verifyVendorUpdate(vendor) { return helper.validator(vendor, vendoUpdateSchema) }

