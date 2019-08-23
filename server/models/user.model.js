const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, },
  full_name: { type: String },
  email: {
    type: String,required:false,
    // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
  },
  mobile_number: { type: String },
  is_active: { type: Boolean, default: true },
  password: {
    type: String, // required: true
  },
  landmark: {type:String},
  street_address: {type:String},
  city: { type: String },
  dob: { type: Date },
  anniversary: { type: Date },
  dl_number:{type:String},
  role: { type: mongoose.Schema.Types.ObjectId, ref: "user_role" }
}, {
    versionKey: false
  });

module.exports = mongoose.model('user', UserSchema);