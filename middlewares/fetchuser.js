const jwt = require('jsonwebtoken');
const JWT_SECRET = 'user@uthentication$ecret'; //JWT signature

// Gets user from authToken and adds id to req object
const fetchUser = (req, res, next) => {
    // Passing the authToken as a header and authenticating it.
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"});
    }

    // Verifying generated authToken with present authToken and fetching user data.
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
}

module.exports = fetchUser;