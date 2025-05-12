const mongoose = require("mongoose");

const SearchSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Search = mongoose.model("Search", SearchSchema);
module.exports = Search;
