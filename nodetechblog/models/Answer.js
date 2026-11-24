const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    answer:   { type: String, required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    user:     { type: String, required: true },
    ans_date: { type: Date, default: Date.now },
    status:   { type: String, default: "pending" },
    votes:    { type: Number, default: 0 }
});

module.exports = mongoose.model("Answer", answerSchema);
