const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    comment:    { type: String, required: true },
    user:       { type: String, required: true },
    blog:       { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    comment_dt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
