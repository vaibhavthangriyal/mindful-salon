const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorReviewSchema = new Schema({
    comment: { type: String, required: true, trim: true, lowercase: true },
    customer: { type: Schema.Types.ObjectId, ref: "user" },
    created_date: { type: Date, default: new Date() },
    rating: { type: Number, max: 5, min: 1, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "user" },
},
    { versionKey: false });

module.exports = mongoose.model('vendorreview', vendorReviewSchema);
