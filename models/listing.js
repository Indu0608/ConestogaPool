const mongoose = require("mongoose")

const schema = mongoose.Schema({
    userId: String,
    fromaddressLine: String,
    toaddressLine: String,
    availableFromTs: Date,
    availableToTs: Date,
    driverName: String,
    carModel: String,
    carLicense: String,
    carMake: String,
    carColour: String,
    images: Array,
    noSeats: Number,
    pricePerSeat: String,
    instructions: String
})

module.exports = mongoose.model("Listing", schema);
