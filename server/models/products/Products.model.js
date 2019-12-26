const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Create Schema
const ProductSchema = new Schema({
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brand', required: true, lowercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "product_category", required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    created_date: { type: Date, default: Date.now },
    details: { type: String, default: "", lowercase: true, trim: true },
    is_active: { type: Boolean, default: true, required: true },
    is_available: { type: Boolean, default: false, required: false },
    service_type: { type: Boolean, default: false, required: false },
    image: { type: String },
    name: { type: String, required: true, lowercase: true, trim: true },
    product_id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    base_price: { type: Number },
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'product_type', required: true },
    stock: { type: Number, default: 0, required: true },
}, {
    versionKey: false
});

module.exports = Product = mongoose.model('product', ProductSchema);