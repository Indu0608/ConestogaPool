const express = require('express')
const router = express.Router()
let alerts = require('../data/alerts')
const users = require('../models/User')
const bcrypt = require('bcrypt')
const saltRounts = 10;
const fileUpload = require('express-fileupload')
router.use(fileUpload())

router.get('/', (req, res) => {
    res.render('register', {session: req.session})
})

router.post('/', (req, res) => {
    console.log(req.body)
    users.findOne({userName: req.body.userName}, (err, data) => {
        if(err) { console.log(err)}
        else {
            if(data){
                alerts.data = `User ${req.body.userName} already present, please try with a different name.`
                alerts.type = 'warning'
                res.render("register", {alert: true, alerts, session: req.session})
            } else {
                bcrypt.hash(req.body.password, saltRounts, (err, hash) => {
                    var image = {}
                    if (req.files) {
                        image = req.files.images
                    }
                    const user = new users({
                        name: req.body.name,
                        addressLine1: req.body.addressLine1,
                        addressLine2: req.body.addressLine2,
                        phone: req.body.phone,
                        email: req.body.email,
                        userName: req.body.userName,
                        password: hash,
                        image: image
                    })
                    user.save().then(() => {
                        alerts.data = `You are registered successfully`
                        alerts.type = 'success'
                        res.render('home', {alert: true, alerts, session: req.session})
                    })
                })
            }         
        }
    })  
})

module.exports = router