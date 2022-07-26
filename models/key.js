const mongoose = require('mongoose');

const schema = mongoose.Schema({
    key: String,
    limit: Number, /* Requests per minute */
    owner: String,
});

module.exports = mongoose.model("key", schema);