const mongoose = require('mongoose');

//lobby schema
const { Schema } = mongoose;

const lobbySchema = new Schema({
    lobbyType: { type: String, required: true },
    lobbyRoom: { type: String, required: true },
    host: { type: String, require: true },
    invited: { type: String, required: true },
    turnIndicator: { type: Array, required: true },
    blueTeam: { type: Array, required: true },
    redTeam: { type: Array, required: true }
});
const lobbyModel = mongoose.model('lobby', lobbySchema);

module.exports = lobbyModel;