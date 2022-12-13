const User = require('../models/user');

module.exports.index = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res) => {
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
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.loginUser = (req, res) => {
    const redirectUrl = req.returnTo || '/campgrounds';
    delete req.returnTo;
    req.flash('success', "Welcome Back!");
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', "You logged out.");
        res.redirect('/campgrounds');
    });
}