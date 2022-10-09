const express = require('express')
const router = express.Router()
const NodeGeocoder = require('node-geocoder')
const alerts = require('../data/alerts')
let mapsData = require('../data/mapsData')
let middlewareObj = require('../middleware/index')
let listings = require('../models/listing')
let bookings = require('../models/booking')
let {getValidBookings} = require('../data/databaseQueries')
//for adding Distance Calculations
const Client  = require('@googlemaps/google-maps-services-js').Client

const client = new Client({
    key: process.env.GEOCODER_API_KEY
})

const today = new Date()
const tomorrow = new Date(today)
let inputVal = {
    location: "",
    fromTs: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:00`,
    toTs: `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String((tomorrow.getDate() + 1)).padStart(2, '0')}T12:00`,
}

// Setup Geocoder options
let options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

let geocoder = NodeGeocoder(options)



router.get('/', async function(req, res)  {

    tomorrow.setDate(tomorrow.getDate() + 1)
    const urlParams = new URLSearchParams(req._parsedOriginalUrl.search)
    
    if(urlParams.get('location') > "") {
        inputVal.location = urlParams.get('location')
    }
    if(urlParams.get('fromTs') > "") {
        inputVal.fromTs = urlParams.get('fromTs')
    }
    if(urlParams.get('toTs') > "") {
        inputVal.toTs = urlParams.get('toTs')
    }
    geocoder.geocode(inputVal.location, function (err, data) {
        if (err || !data.length) {
          alerts.data = "Invalid address, try again"
          alerts.type = "danger"
          res.render("searchPage", {alert: true, alerts: alerts, markers:[[]], inputVal: inputVal, session: req.session})
        } else if (data.length) {
            let eligibleLocations = []
            let locations = []
            let locationsData = []
            let locationsDataTemp = []
            let eligibleLocationId = []
            listings.find(
                {
                    availableFromTs: { $lte: new Date(inputVal.fromTs)}, 
                    availableToTs: { $gte: new Date(inputVal.toTs)}, 
            },async (err, data) => {
                if (!err && data.length) {
                    for (const element of data) {
                        eligibleLocationId.push(element._id)   
                        eligibleLocations.push(element.addressLine1)
                        locationsDataTemp.push(element)
                    }
                    client
                    .distancematrix({
                        params: {
                        origins: [inputVal.location],
                        destinations: eligibleLocations,
                        key: process.env.GEOCODER_API_KEY
                        },
                        timeout: 1000
                    })
                    .then(async function (r) {
                        let i = 0
                        r.data.rows[0].elements.forEach( e => {
                            if(e.status == "OK") {
                                if(e.distance.value < 10000) {
                                    locations.push(eligibleLocations[i])
                                    // locationsData.push({locationsDataTemp[i]})
                                    locationsData.push({
                                        _id: locationsDataTemp[i]._id,
                                        addressLine1: locationsDataTemp[i].addressLine1,
                                        images: locationsDataTemp[i].images,
                                        hourlyRate: locationsDataTemp[i].hourlyRate,
                                        distance: e.distance.value,
                                    })
                                }
                            }
                            i++
                        })
                        await getLocations(locations).then(loc => {
                            if(loc.length > 0){
                                req.session.fromTs = inputVal.fromTs
                                req.session.toTs = inputVal.toTs
                                res.render("searchPage", {markers: loc, listings: locationsData, inputVal: inputVal, session: req.session})
                            } else {
                                alerts.data = "No listings in 10KM radius of your selection, try a diffrent location"
                                alerts.type = "danger"
                                res.render("searchPage", {alert: true, alerts: alerts, markers:[[]], inputVal: inputVal, session: req.session})
                            }
                            
                        })
                    })
                    .catch(e => {
                        alerts.data = e
                        alerts.type = "danger"
                        res.render("searchPage", {alert: true, alerts: alerts, markers:[[]], inputVal: inputVal, session: req.session})
                    });
                    } else {
                        alerts.data = "No spots for the given timewindow"
                        alerts.type = "danger"
                        res.render("searchPage", {alert: true, alerts: alerts, markers:[[]], inputVal: inputVal, session: req.session})
                    }
                })
        }  
    })
}) 


router.get('/distance', async function(req, res)  {
    let eligibleLocations = []
    let locations = []
    listings.find((err, data) => {
        if (!err && data) {
            data.forEach( row => {
                eligibleLocations.push(row.addressLine1)
            })
            client
            .distancematrix({
                params: {
                origins: ["Cambridge Centre"],
                destinations: eligibleLocations,
                key: process.env.GEOCODER_API_KEY
                },
                timeout: 1000 // milliseconds
            })
            .then(async function (r) {
                let i = 0
                r.data.rows[0].elements.forEach( e => {
                    if(e.status == "OK") {
                        if(e.distance.value < 10000) {
                            locations.push(eligibleLocations[i])
                        }
                    }
                    i++
                })
                await getLocations(locations).then(loc => {
                    res.render("mapDistance", {mapsData: mapsData, markers: loc, session: req.session})
                })
            })
            .catch(e => {
                console.log(e)
            });
        }
    })
    
})



router.post('/', (req, res) => {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          alerts.data = "Invalid address, try again"
          alerts.type = "danger"
        }
        if (data.length) {
            mapsData.lat = data[0].latitude;
            mapsData.lng = data[0].longitude;
            mapsData.location = data[0].formattedAddress;
        }
        res.render("maps", {mapsData: mapsData, alert: true, alerts: alerts, session: req.session})
    })
})


async function getLocations(locations) {
    return new Promise (async function(promise) {
        let returnArray = []
        for(const element of locations) {
            let value = await getLatLng(element)
            returnArray.push(value)
        }
        promise(returnArray)
    })
}

function getLatLng(location) {
    return new Promise ( promise => {
        geocoder.geocode(location, function (err, data) {
            if (err || !data.length) {
              console.log(err)
            }
            if (data.length) {     
                promise([data[0].latitude, data[0].longitude])
            }
        })
    })
}


module.exports = router