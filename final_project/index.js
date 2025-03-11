const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware for /customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.token) {
        try {
            // Verify the JWT token stored in the session
            const decoded = jwt.verify(req.session.token, "fingerprint_customer");
            req.user = decoded; // Attach the user info to the request
            next();
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    } else {
        return res.status(401).json({ message: "Unauthorized: No token found" });
    }
});

const PORT = 5000;

// Register routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
