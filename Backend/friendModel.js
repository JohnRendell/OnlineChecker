const mongoose = require('mongoose');

//friend schema
const { Schema } = mongoose;

const friendSchema = new Schema({
    username: { type: String, required: true },
    list: { type: Array, required: true },
    request: { type: Array, required: true }
});
const friendModel = mongoose.model('friendlist', friendSchema);

module.exports = friendModel;