const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question:  { type: String, required: true },
    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    user:      { type: String, required: true },
    ques_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", questionSchema);
