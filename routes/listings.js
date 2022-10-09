const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')
const listings = require('../models/listing')
let alerts = require('../data/alerts')
let middlewareObj = require('../middleware/index')

const NodeGeocoder = require('node-geocoder');
const booking = require('../models/booking')
// Setup Geocoder options
let options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

let geocoder = NodeGeocoder(options)

router.use(fileUpload())
let imageArray = []

let listing = {
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    zipcode: "",
    phone: "",
    images: null,
    availableFromTs: "",
    availableToTs: "",
    hourlyRate: "",
    monthlyRate: "",
    instructions: "",
}

router.get('/', middlewareObj.isLoggedIn, (req, res) =>{
    res.render('addListing', {listing: listing, session: req.session})
})

router.get('/:listing', middlewareObj.isLoggedIn, (req, res) => {
    listings.find({_id: req.params.listing}, (err, data) => {
        if(!err && data.length > 0) {
            let listingData = data
            booking.find({parkingSpaceId: req.params.listing}, (err, bookings) => {
                if (!err && bookings.length > 0){
                    listingData.bookings = bookings
                } else {
                    listingData.bookings = []
                }
                res.render("listing", {listing: listingData, session: req.session})
            })
        } else {
            req.session.alerts.data = "Listing not available"
            req.session.alerts.type = "warning"
            res.redirect('/')
        }
    })
})

router.get('/remove/:listingId', middlewareObj.isLoggedIn, (req, res) => {
    listings.findOne({_id: req.params.listingId}, (err, data) => {
        if (!err && data) {
            booking.find({parkingSpaceId: req.params.listingId}, (err, data) => {
                if (data.length > 0) {
                    req.session.alerts.data = "Listing has active bookings, cannot be removed."
                    req.session.alerts.type = "danger"
                    res.redirect('/profile')
                } else {
                    listings.findOneAndRemove({_id: req.params.listingId}).exec((err, data) =>{
                        req.session.alerts.data = "Listing removed successfully"
                        req.session.alerts.type = "success"
                        res.redirect('/profile')
                    })
                }
            })
        } else {
            alerts.data = "Listing not available"
            alerts.type = "danger"
            res.render("home", {alerts: alerts, alert: true})
        }
    })
})

router.post('/', middlewareObj.isLoggedIn,  (req, res) => {
    listings.findOne({addressLine1: req.body.addressLine1}, (err, data) => {
        if(err) {
            console.log(err)
            res.render("addListing", {listing: req.body, session: req.session})
        } else {
            if(!data) {
                geocoder.geocode(req.body.addressLine1, (geoerr, geodata) =>{
                    if(geoerr || !geodata.length) {
                        alerts.data = "Invalid address, please enter a valid one"
                        alerts.type = "danger"
                        res.render("addListing", {listing: req.body, alert: true, alerts: alerts , session: req.session})
                    } else {
                        const newListing = new listings(req.body)
                        newListing.images = []

                        if (req.files.images.length > 0) {
                            req.files.images.forEach( (image) => {
                                newListing.images.push(image)
                            } )
                        } else {
                            newListing.images.push(req.files.images)
                        }
                        newListing.userId = req.session.userId
                        newListing.availableFromTs = new Date(req.body.availableFromTs)
                        newListing.availableToTs = new Date(req.body.availableToTs)
                        newListing.save().then( () => {
                            alerts.data = "Listing added successfully"
                            alerts.type = "success"
                            res.render('home', {alert: true, alerts: alerts, session: req.session})
                        })
                    }
                })
            } else {
                alerts.data = "Address already present in the database"
                alerts.type = "danger"
                res.render("addListing", {listing: req.body, alert: true, alerts: alerts, session: req.session })
            }
        }
    })
    
})

module.exports = router