const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');  
const app = express();
const PORT = process.env.PORT || 3000;

const uri = "mongodb://localhost:27017/Accounts"; 
mongoose.connect(uri)
    .then(() => console.log("✅ Connected to Local MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());
app.use(session({
    secret: 'strongpassword123',  
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  
}));

const registerRoute = require('./register');
const loginRoute = require('./login');
const profileRoute = require('./profile'); 

app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute); 

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/html/profile.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/registration.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});

app.get('/login.html', (req, res) => res.redirect('/login'));
app.get('/registration.html', (req, res) => res.redirect('/register'));
app.get('/dashboard.html', (req, res) => res.redirect('/dashboard'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});