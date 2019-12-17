const mongoose = require('mongoose');
const KYC = mongoose.Schema({
  documentType: { type: String },
  image: { type: String },
  verified: { type: Boolean }
}, {
  _id: false,
  versionKey: false
})

const UserSchema = new mongoose.Schema({
  //for all =>
  user_id: { type: String, required: true, unique: true, },
  full_name: { type: String, lowercase: true },
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
  description: { type: String, lowercase: true, trim: true },
  landmark: { type: String },
  street_address: { type: String },
  H_no_society: { type: String },
  city: { type: String },
  area: { type: mongoose.Schema.Types.ObjectId, ref: "area" },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "user_role" },
  latitude: String,
  longitutde: String,
  gender: String,
  //for customers =>
  dob: { type: Date },
  profile_picture: { type: String },
  anniversary: { type: Date },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "route" },
  //for driver =>
  emergency_contact: { type: String },
  dl_number: { type: String },
  shop_name: { type: String },
  retailer_number: { type: String },
  //for dboy =>
  kyc: KYC,
  permanent_address: String,
  vehicle_type: String
}, {
  versionKey: false
});

module.exports = mongoose.model('user', UserSchema);