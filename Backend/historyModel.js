const mongoose = require('mongoose');

//history schema
const { Schema } = mongoose;

const historySchema = new Schema({
    username: { type: String, required: true },
    history: { type: Array, required: true }
});
const historyModel = mongoose.model('history', historySchema);

module.exports = historyModel;