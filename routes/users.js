const express = require('express');
const router = express.Router();

const user = require('../controllers/users');
const catchAsync = require('../utils/CatchAsync');
const passport = require('passport');


router.route('/register')
    .get(user.index)
    .post(catchAsync(user.registerUser));

router.route('/login')
    .get(user.renderLoginForm)
    .post(
        passport.authenticate('local',
            {
                failureFlash: true,
                failureRedirect: '/login'
            }
        ),
        user.loginUser
    );

router.get('/logout', user.logout);

module.exports = router;