const dotenv = require('dotenv').config({path : './config/config.env'});
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = async (req, res, next) => {
    try {
        // check if token exist
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else{
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
    } catch (err) {
        //console.log(err);
        return res.status(401).json({
            message : "invalid token"
        }); 
    }
    req.user = decoded_payload.username;
    next();
}

exports.checkGroup = async (req, res, next) => {
    let username = req.user;
}