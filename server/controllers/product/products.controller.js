const Joi = require('joi');
const helper = require('../../utils/helper');

const newProductSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    is_active: Joi.boolean().required(),
    base_price: Joi.number().optional(),
    brand: Joi.string().required(),
    details: Joi.string().optional().allow(''),
    type: Joi.string().required(),
    is_service: Joi.boolean().required().default(false),
})

const updateProductSchema = Joi.object({
    available_for: Joi.array().items(Joi.string()).optional(),
    brand: Joi.string().optional(),
    category: Joi.string().optional(),
    details: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
    image: Joi.string().optional(),
    name: Joi.string().optional(),
    base_price: Joi.number().optional(),
    is_service: Joi.boolean().optional(),
    type: Joi.string().optional().allow('')
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
