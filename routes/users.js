const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registered = await User.register(newUser, password);
        req.login(registered, err => {
            if (err) return next(err);
            req.flash('success', "registered a new user.");
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    (req, res) => {
        const redirectUrl = req.returnTo || '/campgrounds';
        delete req.returnTo;
        req.flash('success', "Welcome Back!");
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', "You logged out.");
        res.redirect('/campgrounds');
    });
});

module.exports = router;