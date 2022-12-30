let dbURL;
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    dbURL = `mongodb://localhost:27017/my-yelp`;
} else {
    dbURL = process.env.ATLAS_CONNECTION_STRING;
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const User = require('./models/user');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require("helmet");

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const port = 3000;

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected");
});


app.engine('ejs', ejsMate);
// Setting view engine to ejs
app.set("view engine", "ejs");
// Setting the views folder path.
app.set('views', path.join(__dirname, 'views'));


// Parse req.body
app.use(express.urlencoded({ extended: true }));
// Allow alternate form methods
app.use(methodOverride('_method'));
// Logging
app.use(morgan('tiny'));
// Serve static stuff
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbURL,
    secret: 'bad secret',
    touchAfter: 24 * 3600,
});

store.on('error', function (e) {
    console.log("Store Error", e);
})

// Use sessions
const sessionConfig = {
    store,
    name: 'MYCS',
    secret: 'bad secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());


const scriptSrcUrls = [
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dweyqcjwr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport used for authentication & password hashing.
app.use(passport.initialize());
// Must be after app.use(session))
app.use(passport.session());
// Use the local strategy located on the User model.
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());

// How to store and unstore the user in the session.
// Methods automatically added to the user model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// On every route
app.use((req, res, next) => {
    if (!['/login', '/campgrounds'].includes(req.originalUrl)) {
        req.returnTo = req.originalUrl;
    }

    // All pages will have access to currentUser.
    res.locals.currentUser = req.user;

    // Anything in req.flash under success.
    // will be available in res.locals.success
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

// Error catching
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found.', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong.';
    res.status(statusCode).render('error', { err });
});


// Start App
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});
