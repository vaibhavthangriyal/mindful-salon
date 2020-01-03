const mongoose = require("mongoose");

module.exports = mongoose.model("product_category", new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "product_category" },
    name: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, required: true, lowercase: true, trim: true },
    image: { type: String },
    is_active: { type: Boolean, default: true }
}, {
    versionKey: false
}))