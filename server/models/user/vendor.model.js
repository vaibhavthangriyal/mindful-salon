const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendor_id: { type: String, required: true, unique: true, },
    description: { type: String, lowercase: true, trim: true },
    full_name: { type: String, lowercase: true, trim: true },
    email: {
        type: String, required: false, lowercase: true,
        // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    },
    mobile_number: { type: String },
    is_active: { type: Boolean, default: false },
    password: {
        type: String, // required: true
    },
    profile_picture: { type: String, lowercase: true, trim: true },
    city: { type: String, lowercase: true, trim: true },
    area: { type: String, lowercase: true, trim: true },
    street_address: { type: String, lowercase: true, trim: true },
    shop_number: { type: String, lowercase: true, trim: true },
    latitude: String,
    longitutde: String
}, {
    versionKey: false
});

module.exports = mongoose.model('vendor', VendorSchema);