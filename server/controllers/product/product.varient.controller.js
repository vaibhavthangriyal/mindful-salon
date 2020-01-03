const Joi = require('joi');
const helper = require('../../utils/helper');

const productVarientCreateSchema = Joi.object({
    attributes: Joi.array().items(Joi.object({
        attribute: Joi.string().required(),
        option: Joi.string().required(),
    })).required(),
    description: Joi.string().optional(),
    // name: Joi.string().required(),
    images: Joi.any().optional(),
    price: Joi.number().required(),
    product: Joi.string().required(),
    // sku_id: Joi.string().required(),
    stock: Joi.number().required()
    // is_active: Joi.boolean().required()
})
const productVarientUpdateSchema = Joi.object({
    // product: Joi.string().optional(),
    attributes: Joi.array().items(Joi.object({
        attribute: Joi.string().required(),
        option: Joi.string().required(),
    })).required(),
    description: Joi.string().optional(),
    // name: Joi.string().optional(),
    price: Joi.number().optional(),
    images: Joi.any().optional(),
    // sku_id: Joi.string().optional(),
    stock: Joi.number().optional()
    // is_active: Joi.boolean().optional()
})

module.exports = {
    verifyCreate,
    verifyUpdate
}

function verifyCreate(area) { return helper.validator(area, productVarientCreateSchema) }
function verifyUpdate(area) { return helper.validator(area, productVarientUpdateSchema) }
