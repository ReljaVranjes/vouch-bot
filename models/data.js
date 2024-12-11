const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    name: String,
    userID: String,
    pozitivni_vouch: Number,
    negativni_vouch: Number,
    postoji: Number,
    komentari: [String],
    verifikacija: String,
    baner: String,
});

module.exports = mongoose.model("Data", dataSchema);
