const mongoose = require("mongoose")

const schema = mongoose.Schema({
    rideID: String,
    userId: String,
    pickupLoc: String,
    dropLoc: String,
    pickupTs: Date,
    numSeats: Number,
    total: Number,
    tax: Number,
    netAmount: Number,
    email: String,
    phone: String,
    dateBooked: Date
})

module.exports = mongoose.model("Booking", schema);