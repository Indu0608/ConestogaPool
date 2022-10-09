const express = require('express')
const router = express.Router()
const users = require('../models/User')
const bcrypt = require('bcrypt')

var alerts = require('../data/alerts')

router.get('/', (req, res) => {
    res.render("login", {session: req.session})
})

router.post('/', (req, res) => {
    users.findOne({userName: req.body.userName}, (err, data) => {
        if (err) { console.log(err)}
        else {
            if(data){
                bcrypt.compare(req.body.password, data.password, (err, result) => {
                    if(result){
                        req.session.authenticated = true
                        req.session.username = req.body.userName
                        req.session.userId = data._id
                        req.session.email = data.email
                        req.session.phone = data.phone
                        req.session.name = data.name
                        res.redirect('/')
                    } else {
                        alerts.data = "Password is incorrect"
                        alerts.type = "danger"
                        res.render('login', {alert: true, alerts: alerts, session: req.session})
                    }
                    
                })
            }
            else {
                alerts.data = "User is not registered"
                alerts.type = "danger"
                res.render('login', {alert: true, alerts: alerts, session: req.session})
            }
        }
    })
})



router.get('/logout')


module.exports = router