const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');  
const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGO_URI; 
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

const registerRoute = require('./Routes/register');
const loginRoute = require('./Routes/login');  
const profileRoute = require('./Routes/profile');

app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute); 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/features', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/profile.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/registration.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
});

app.get('/login.html', (req, res) => res.redirect('/login'));
app.get('/registration.html', (req, res) => res.redirect('/register'));
app.get('/dashboard.html', (req, res) => res.redirect('/dashboard'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});