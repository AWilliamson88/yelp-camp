const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect(`mongodb://localhost:27017/my-yelp`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const num = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '639004bba561856155bb5963',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[num].city} ${cities[num].state}`,
            image: `https://source.unsplash.com/collection/3846912`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequuntur ipsa harum maxime esse alias ex itaque, blanditiis nisi cupiditate quisquam temporibus ipsam assumenda animi necessitatibus explicabo? Facilis aliquam iure fugit.',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});