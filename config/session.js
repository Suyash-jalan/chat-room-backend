const session = require('express-session');
const MongoStore = require('connect-mongo');
const sessionMiddleware = session({
 secret: process.env.SESSION_SECRET,
 resave: false,
 saveUninitialized: false,
 store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
 cookie: {
 maxAge: 1000 * 60 * 60 * 24 * 7,       
 httpOnly: true,
 sameSite: 'lax', 
 },
});
module.exports = sessionMiddleware;