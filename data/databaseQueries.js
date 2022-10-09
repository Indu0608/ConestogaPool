let MongoClient = require('mongodb').MongoClient
let url = "mongodb+srv://manu_shaju_mongo:626688@cluster0.rgqoc.mongodb.net/"
let dbo = undefined

async function getValidBookings(){
   return new Promise ( async (promise) => {
        dbo = await connectDB()
        dbo.collection("bookings").aggregate([
            { 
                "$lookup":
                {
                    from: 'listings',
                    localField: 'bookings.parkingSpaceId',
                    foreignField: 'listings._id',
                    as: 'bookingDetails'
                }
            },
        ]).toArray( (err, data) => {
            if (err) throw err
            promise(data)
        })
   })
}




function connectDB(){
    return new Promise (promise => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err
            promise(db.db("tempDB"))
          });
    })
}

module.exports = {getValidBookings}