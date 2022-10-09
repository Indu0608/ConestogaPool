const express = require('express')
const router = express.Router()
const users = require('../models/User')
const booking = require('../models/booking')
const listing = require('../models/listing')
const payment = require('../models/payment')

const middlewareObj = require('../middleware/index')

router.get('/', middlewareObj.isLoggedIn, async (req, res) => {
    let userData = {}
    userData.data = await getUserData(req.session.userId)
    userData.listings = await getListings(req.session.userId)
    userData.bookings = await getBookings(req.session.userId)
    if(req.session.alerts.data) {
        res.render('profile', {userData: userData, session: req.session, alert: true, alerts: {
            data: req.session.alerts.data,
            type: req.session.alerts.type,
        } })
    } else {
        res.render('profile', {userData: userData, session: req.session})
    }
})

function getUserData(userId) {
    return new Promise ( promise => {
        users.findOne({_id: userId}, (err, data) => {
            if (err) {
                promise(err)
            } else {
                if (data) {
                    promise(data)
                }
            }
        })
    })
}

function getListings(userId) {
    return new Promise ( promise => {
        listing.find({userId: userId}, (err, data) => {
            if (err) {
                promise(err)
            } else {
                if (data) {
                    promise(data)
                }
            }
        })
    })
}

async function getBookings(userId) {
    let bookings = []
    return new Promise ( promise => {
        booking.find({userId: userId}, async (err, data) => {
            if (err) {
                promise(err)
            } else {
                if (data) {
                    for (const element of data) {
                        let list = await getListing(element.parkingSpaceId)
                        bookings.push({data: element, listing: list})
                    }
                    promise(bookings)
                }
            }
        })
    })
}

function getListing(listingId) {
    return new Promise ( promise => {
        listing.findById({_id: listingId}, (err, data) => {
            if (err) {
                promise(err)
            } else {
                if (data) {
                    promise(data)
                }
            }
        })
    })
}

module.exports = router