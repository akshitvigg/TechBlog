const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    message:  { type: String, required: true },
    user:     { type: String, required: true },
    blog_dt:  { type: Date, default: Date.now },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    title:    { type: String, required: true }
});

module.exports = mongoose.model("Blog", blogSchema);
