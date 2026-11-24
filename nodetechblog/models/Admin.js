const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    phone:    { type: String, required: true },
    status:   { type: String, default: "active" }
});

module.exports = mongoose.model("Admin", adminSchema);
