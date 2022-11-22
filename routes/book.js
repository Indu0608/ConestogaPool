const express = require('express')
const router = express.Router()
const NodeGeocoder = require('node-geocoder')
const alerts = require('../data/alerts')
let mapsData = require('../data/mapsData')
let middlewareObj = require('../middleware/index')
let listings = require('../models/listing')
let bookings = require('../models/booking')
let payments = require('../models/payment')
let functions = require('../data/functions')
const listing = require('../models/listing')

const paypal = require('paypal-rest-sdk')

let custDetails = {
    email: "",
    phone: "",
    makeModel: "",
    licensePlate: "",
    province: "",
    rideID: ""
}

let rates = {
    total: 0,
    tax: 0,
    netAmount: 0
}

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

router.get('/pay/cancel', (req, res) => {
    res.redirect('/search')
})

router.get('/remove/:bookingId', middlewareObj.isLoggedIn, (req, res) => {
    payments.findOneAndRemove({ bookingId: req.params.bookingId }).exec((err, data) => {
        bookings.findOneAndRemove({ _id: req.params.bookingId }).exec((err, data) => {
            req.session.alerts.data = "Successfully removed the booking"
            req.session.alerts.type = "success"
            res.redirect('/profile')
        })
    })
})

router.get('/pay/success', (req, res) => {
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "CAD",
                "total": `${req.session.netAmount.toFixed(2)}`,
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
            throw error;
        } else {
            let newPayment = new payments({
                bookingId: req.session.bookingId,
                bookingReferenceId: payment.id,
                amount: req.session.netAmount,
                paymentMethod: "PayPal"
            })
            newPayment.save().then(() => {
                alerts.data = "Booking confirmed, payment successfull"
                alerts.type = "success"
                res.render('home', { alert: true, alerts: alerts, session: req.session })
            })
        }
    })
})


router.get('/:listing', middlewareObj.isLoggedIn, (req, res) => {
    listings.findOne({ _id: req.params.listing }, (err, data) => {
        if (!err && data) {

            console.log(req.session)

            rates.total = parseFloat(data.pricePerSeat) * req.session.userBookingDetails.numSeats
            rates.tax = rates.total * .13
            rates.netAmount = rates.total + rates.tax
            req.session.rates = rates
            custDetails.rideID = req.params.listing
            custDetails.email = req.session.email
            custDetails.phone = req.session.phone

            console.log(req.session.userBookingDetails)
            let listingDetails = {
                fromaddressLine: data.fromaddressLine,
                toaddressLine: data.toaddressLine,
                availableFromTs: data.availableFromTs,
                driverName: data.driverName,
                carModel: data.carModel,
                carLicense: data.carLicense,
                carMake: data.carMake,
                numSeats: req.session.userBookingDetails.numSeats,
                images: data.images,
                pricePerSeat: data.pricePerSeat
            }
            res.render('booking', { info: custDetails, rates: rates, session: req.session, listingDetails: listingDetails })
        }
    })
})

router.post('/:listing', middlewareObj.isLoggedIn, (req, res) => {
    let currentTS = new Date()
    let booking = new bookings({
        rideID: req.params.listing,
        userId: req.session.userId,
        pickupLoc: req.session.userBookingDetails.location,
        dropLoc: req.session.userBookingDetails.toLocation,
        pickupTs: new Date(req.session.userBookingDetails.fromTs),
        numSeats: req.session.userBookingDetails.numSeats,
        email: req.body.email,
        phone: req.body.phone,
        dateBooked: currentTS,
        total: req.session.rates.total,
        tax: req.session.rates.tax,
        netAmount: req.session.rates.netAmount
    })
    booking.save().then(() => {
        bookings.find((err, data) => {
            req.session.bookingId = data[0]._id
            req.session.netAmount = booking.netAmount
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3500/book/pay/success",
                    "cancel_url": "http://localhost:3500/book/pay/cancel"
                    // "return_url": "https://park-space.herokuapp.com/book/pay/success",
                    // "cancel_url": "https://park-space.herokuapp.com/book/pay/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": data[0]._id,
                            "sku": booking.rideID,
                            "price": `${req.session.netAmount.toFixed(2)}`,
                            "currency": "CAD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "CAD",
                        "total": `${req.session.netAmount.toFixed(2)}`
                    },
                    "description": "This is the payment for booking ride."
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let item of payment.links) {
                        if (item.rel == 'approval_url') {
                            res.redirect(item.href)
                        }
                    }
                }
            });
        }).sort({ _id: -1 }).limit(1)
    })
})


module.exports = router