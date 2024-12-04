const mongoose = require('mongoose');

//account schema
const { Schema } = mongoose;

const accountSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    profile: { type: String, require: true },
    trophy: { type: Number, require: true },
    allow_change_profile: { type: String, require: true }
});
const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel;