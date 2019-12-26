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
  user_id: { type: String, required: true, unique: true, },
  full_name: { type: String, lowercase: true },
  email: {
    type: String, required: false, lowercase: true,
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
  },
  mobile_number: { type: String },
  is_active: { type: Boolean, default: false },
  password: {
    type: String, // required: true
  },
  profile_picture: { type: String, lowercase: true, trim: true },
  description: { type: String, lowercase: true, trim: true },
  landmark: { type: String },
  street_address: { type: String },
  H_no_society: { type: String }, 
  city: { type: String, lowercase: true, trim: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "user_role" },
  latitude: String,
  longitutde: String,
}, {
  versionKey: false
});

module.exports = mongoose.model('user', UserSchema);