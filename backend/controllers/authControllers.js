const pool = require('../utils/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config({path : './config/config.env'});

exports.login = async (req, res, next) => {
    const {username, password} = req.body;
    // console.log(req.body);
    // console.log(username);
    // console.log(password);
    if (!username && !password) {
        return res.status(401).json({error : 'Invalid credentials'});
    }

    try {
        // check 1. if user exists 2. if password matches 3. if user is active
        let check_user_exist_sql = "SELECT * FROM user WHERE user_name = ?";
        const [val, field] = await pool.execute(check_user_exist_sql, [username]);
        if (val.length === 0) {
            return res.status(401).json({error : 'Invalid Credentials'});
        }
        
        const passwordMatch = await bcrypt.compare(password, val[0].password);
        if (!passwordMatch) {
            return res.status(401).json({error : 'Invalid Credentials'});
        }
        
        if (val[0].active === 0) {
            return res.status(404).json({error : 'User not found'});
        }

        let jwtToken = jwt.sign(
            {
                username: val[0].user_name,
                ipaddress: req.ip,
                browser: req.headers["user-agent"]
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
            
        )

        const cookie_options = {
            expiresIn : new Date(
                Date.now() + process.env.EXPIRE_time * 60 * 60 * 1000
            ),
            httpOnly: true
        }

        res.status(200).cookie("token", jwtToken, cookie_options).json({
            message : "cookie created successfully",
            success : true
            // jwtToken is placed here for postman usage ONLY
            // jwtToken
        })
    } catch (err) {
        console.log(err);
    }
}

exports.logout = async (req, res, next) => {
    res.clearCookie("token");
    res.status(200).send('Cookie has been cleared');
}