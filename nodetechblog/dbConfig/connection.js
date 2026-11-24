const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/techblog")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err.message));

module.exports = mongoose;
