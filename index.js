require('dotenv').config();
let express = require('express');
let path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('cookie-session');

const users = require('./models/User')

// Adding Routes
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: false
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'mysecret',
    resave: false,
    httpOnly: true,
    maxAge: 30 * 60 * 1000,
    saveUninitialized: true,
}));

// Using the routes
app.use('/login', loginRouter);
app.use('/register', registerRouter);

const databaseConn = 'mongodb+srv://indulekha:keshu@cluster0.dcgbs71.mongodb.net/testDB';
mongoose.connect(databaseConn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


app.get('/', (req, res) => {
    req.session.alerts = {
        data: "",
        type: ""
    }
    users.find((err, data) => {
        if (data) {
            console.log(data.length)
        }
    })
    res.render("login")
})



app.listen(process.env.PORT || 3500, function () {
    console.log("Server started on port 3500");
});