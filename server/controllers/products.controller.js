const Joi = require('joi');
const helper = require('../utils/helper');

const newProductSchema = Joi.object({
    image: Joi.string().optional().allow(''),
    name: Joi.string().required(),
    category: Joi.string().required(),
    farm_price: Joi.number().required(),
    is_active: Joi.boolean().required(),
    selling_price: Joi.number().required(),
    brand: Joi.string().required(),
    product_dms: Joi.string().required(),
    product_id: Joi.string().required(),
    details: Joi.string().optional().allow(''),
    created_by: Joi.string().required(),
    available_for: Joi.string().required()
})

const updateProductSchema = Joi.object({
    available_for: Joi.string().optional(),
    _id: Joi.string().required(),
    brand: Joi.string().optional(),
    category: Joi.string().optional(),
    created_by: Joi.string().optional(),
    details: Joi.string().optional(),
    farm_price: Joi.number().optional(),
    is_active: Joi.boolean().required(),
    image: Joi.string().optional(),
    name: Joi.string().optional(),
    product_dms: Joi.string().optional(),
    product_id: Joi.string().required(),
    selling_price: Joi.number().optional()
})



module.exports = {
    verifyUpdate(product) {
        return helper.validator(product, updateProductSchema);
    },
    verifyCreate(product) {
        return helper.validator(product, newProductSchema)
    }
}
//  {
//     insert
// }

// function insert(product) { return helper.validator(product, productSchema) }
