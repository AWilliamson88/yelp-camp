const express = require('express');
const router = express.Router();

const user = require('../controllers/users');
const catchAsync = require('../utils/CatchAsync');
const passport = require('passport');

router.get('/register', user.index)

router.post('/register', catchAsync(user.registerUser));

router.get('/login', user.renderLoginForm);

router.post('/login',
    passport.authenticate('local',
        {
            failureFlash: true,
            failureRedirect: '/login'
        }),
    user.loginUser
);

router.get('/logout', user.logout);

module.exports = router;