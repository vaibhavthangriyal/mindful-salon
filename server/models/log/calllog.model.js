const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callLogSchema = new Schema({
    vendor: { type: Schema.Types.ObjectId, ref: "user", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "user", required: true },
    created_date: { type: Date, default: new Date() }
},
    { versionKey: false });

module.exports = mongoose.model('calllog', callLogSchema);
