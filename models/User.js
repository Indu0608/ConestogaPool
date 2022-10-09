const mongoose = require("mongoose")

const schema = mongoose.Schema({
	name: String,
    addressLine1: String,
    addressLine2: String,
    phone: String,
    email: String,
    image: Array,
    userName: String,
    password: String,
})

module.exports = mongoose.model("User", schema);