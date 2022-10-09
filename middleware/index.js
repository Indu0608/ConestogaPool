var users = require('../models/User')
var listing = require('../models/listing')
var alerts = require('../data/alerts')

var middlewareObj = {}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.session.authenticated) {
        return next()
    } else {
        alerts.data = "Please login to your account to access the content"
        alerts.type = "danger"
        res.render("home", {alert: true, alerts, alerts: alerts})
    }
}

module.exports = middlewareObj