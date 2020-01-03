const mongoose = require('mongoose');
const mongodb = require('mongodb');
const Schema = mongoose.Schema;
const att = Schema({
    attribute: { type: mongoose.Schema.Types.ObjectId, ref: 'product_attribute' },
    option: { type: mongoose.Schema.Types.ObjectId, ref: 'product_option' },
}, {
    versionKey: false,
    _id: false
})
const productType = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    attributes: [att],
    name: { type: String },
    description: { type: String },
    images: {
        primary:String,
        secondary:String
    },
    // sku_id: { type: String },
    price: { type: Number },
    stock: { type: Number },
    // is_active: { type: Boolean, required: true, default: false }
}, { versionKey: false });

module.exports = mongoose.model('product_varient', productType);