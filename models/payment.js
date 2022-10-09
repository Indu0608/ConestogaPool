const mongoose = require("mongoose")

const schema = mongoose.Schema({
    bookingId: String,
    bookingReferenceId: String,
    amount: Number,
    paymentMethod: String,
})

module.exports = mongoose.model("Payment", schema);