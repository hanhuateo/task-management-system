const dotenv = require('dotenv').config({path : './config/config.env'});
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = async (req, res, next) => {
    try {
        // check if token exist
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message : "login first thank you"
            })
        }

        var decoded_payload = jwt.verify(token, JWT_SECRET);

        if (!decoded_payload ||
            decoded_payload.ipaddress != req.ip ||
            decoded_payload.browser != req.headers["user-agent"]
        ) {
            return res.status(401).json({
                message : "invalid token1"
            })
        }
        req.user = decoded_payload.username;
        // console.log(req.user);
        next();
    } catch (err) {
        return res.status(401).json({
            message : "invalid token"
        }); 
    }
}