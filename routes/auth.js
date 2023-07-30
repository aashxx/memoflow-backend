const express = require('express');
const router  = express.Router();
const User = require('../models/User'); // Mongoose model for user
const { validationResult, body } = require('express-validator'); // Form validation of names and email etc.
const bcrypt = require('bcryptjs'); // Password hashing and salt
const jwt = require('jsonwebtoken');// JWT for returning a response
const fetchUser = require('../middlewares/fetchuser')// Middleware to fetch user data from authToken

const JWT_SECRET = 'user@uthentication$ecret'; //JWT signature

// ROUTE:1 - Signup authentication. method POST. No login required. endpoint: api/auth/createuser

// Data validation
const signup_validation = [
    body('name', 'Enter a valid name').isLength({min: 3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({min: 5})
];

router.post('/createuser', signup_validation, async (req,res)=>{
    let success = false;
    // Prevent empty values
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.status(400).json({success, errors: errors.array()}); 
    }
    // Prevent duplicate values
    let user = await  User.findOne({email: req.body.email});
    if(user) {
        success = false;
        return res.status(400).json({success, error: "Sorry this email ID already exists"}) 
    }

    // Hashing and adding salt to the password for security
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Send data to database
    try {
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        const data = {
            user: {
                id: user.id
            }
        };
        //JWT token for authentication
        const authToken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({success, authToken});
    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE:2 - Login authentication. method POST. No login required. endpoint: api/auth/login
const login_validation = [
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists()
];

router.post('/login', login_validation, async (req,res) => {
    // Prevent empty values
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()}); 
    }

    // Fetch email ID and password from user
    const {email, password} = req.body;

    // Authentication of login.
    try {
        // Check if email ID exists.
        let user = await User.findOne({email});
        if(!user) {
            success = false;
            return res.status(400).json({success, error: "Please login  with correct credentials"}); 
        }

        // Check if password exists.
        const passAuth = await bcrypt.compare(password, user.password);
        if(!passAuth) {
            success = false;
            return res.status(400).json({success, error: "Please login  with correct credentials"}); 
        }

        // Return response after authentication.
        const data = {
            user: {
                id: user.id
            }
        };

        //JWT token for authentication.
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authToken});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE:3 - Get login details of user. method POST. Login required. endpoint: api/auth/getuser
router.post('/getuser', fetchUser, async (req,res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;