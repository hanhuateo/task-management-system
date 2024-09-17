const pool = require('../utils/db');
const bcrypt = require('bcrypt');

exports.getAllUsersDetails = async (req, res, next) => {
    let username = req.user;
    let is_admin = await checkGroup(username, "admin");

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }
    try {
        // let [val, fields] = await pool.query("SELECT * FROM user WHERE user_name != 'superadmin' ");
        let [val, fields] = await pool.query("SELECT u.user_name, u.password, u.email, u.active, GROUP_CONCAT(g.group_name) AS group_names FROM user u JOIN user_group ug ON u.user_name  = ug.user_name JOIN group_list g ON ug.group_id = g.group_id GROUP BY u.user_name, u.password, u.email, u.active");
        // console.log(val)
        res.status(200).json({message : "Get all users details successful", val});

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message : "Error retrieving data from database"
        })
    }
}

exports.getUserDetails = async (req, res, next) => {
    try {
        // const {username} = req.body;
        const username = req.user;
        if (!username) {
            res.status(401).send("Do not have permission to access this resource")
        }
        let [val, fields] = await pool.execute("SELECT * FROM user WHERE user_name = ?", [username]);
        // no need to check whether user exist because already logged in;
        res.status(200).json({
            message : 'Get user details successful', 
            val
        });
    } catch (err) {
        return res.status(500).json({
            message : "Error retrieving data from database"
        })    
    }
}

exports.createNewUser = async (req, res, next) => {
    let username = req.user;
    let is_admin = await checkGroup(username, "admin");
    // console.log("is_admin : " + is_admin);

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let {username, password, active, group_id} = req.body;
        // console.log(username);
        // console.log(password);
        // console.log(active);
        // console.log(group_id);

        // check if any required field missing
        let missingFields = [];
        if (!username) {
            missingFields.push('Username');
        }
        if (!password) {
            missingFields.push('Password');
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                message : `The following fields are required: ${missingFields.join(', ')}`
            });
        }

        // check whether password follows requirements
        const regex = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\[\\]{};\':"\\\\|,.<>?/-]).{8,10}$');
        if (!regex.test(password)){
            return res.status(400).json({
                message : 'Password minimum 8 characters, max 10 characters, comprise of alphabets, numbers and special characters'})
        }

        // hash password
        let hashed = bcrypt.hashSync(password, 10);

        const user_values = [username, hashed, active];
        
        let sql1 = "INSERT INTO user (User_name, Password, Email, Active) VALUES (?, ?, NULL, ?)";
        const [user_result] = await pool.execute(sql1, user_values);
        
        // const user_group_values = [username, group_id];
        for (i = 0; i < group_id.length; i++) {
            let user_group_values = [username, group_id[i]]
            let sql2 = "INSERT INTO user_group (User_name, Group_id) VALUES (?, ?)";
            const [user_group_result] = await pool.execute(sql2, user_group_values);
        }
        // const [user_group_result] = await pool.execute(sql2, user_group_values);

        res.status(200).json({message : 'New user has been created', 
            success : true
        });
    } catch (err) {
        console.log(err);
    }
}

exports.updateUserEmail = async (req, res, next) => {
    try {
        let username = req.user
        let {email} = req.body;
        const values = [email, username]
        if (!email) {
            return res.status(400).json({
                message : 'Email is required',
                success: false
            })
        }

        // check email regex
        const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message : 'Please follow email pattern - blablabla@blablabla.com',
                success: false
            })
        }
        
        let sql = 'UPDATE user SET email = ? WHERE User_name = ?';
        const [result] = await pool.execute(sql, values);
        console.log(result);
        res.status(200).json({
            message:'User email has been updated', 
            success: true,
            result
        });
    } catch (err) {
        return res.status(500).json({
            message : "Server Error",
            success: false
        })
    }
}

exports.updateUserPassword = async (req, res, next) => {
    try {
        let {username, password} = req.body;
        if (!password) {
            return res.status(400).json({
                message : "Password is required",
                success: false
            })
        }
        
        const regex = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\[\\]{};\':"\\\\|,.<>?/-]).{8,10}$');
        if (!regex.test(password)){
            return res.status(400).json({
                message : 'Password minimum 8 characters, max 10 characters, comprise of alphabets, numbers and special characters',
                success : false
            })
        }
            
        let sql = 'UPDATE user SET password = ? WHERE User_name = ?';

        // hash password
        let hashed = bcrypt.hashSync(password, 10);

        const values = [hashed, username];
        const [result] = await pool.execute(sql, values);
        console.log(result);
        res.status(200).json({
            message:'User password has been updated',
            success : true,
            result
        });
    } catch (err) {
        return res.status(500).json({
            message : "Server Error",
            success : false
        })    
    }
}

exports.updateUserStatus = async (req, res, next) => {
    let username = req.user;
    let is_admin = checkGroup(username, "admin");

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let {username,  active} = req.body;
        const values = [active, username];
        
        let sql = 'UPDATE user SET active = ? WHERE User_name = ?';
        const [result] = await pool.execute(sql, values);
        console.log(result);
        res.status(400).json({
            message:'User status has been changed', 
            result
        });
    } catch (err) {
        return res.status(500).json({
            message : "Server Error"
        })
    }
}

exports.updateUserGroup = async (req, res, next) => {
    let username = req.user;
    let is_admin = checkGroup(username, "admin");

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let {username, group_id} = req.body;
        const values = [group_id, username];

        let sql = "UPDATE user_group SET Group_id = ? WHERE User_name = ?";
        const [result] = await pool.execute(sql, values);
        console.log(result);
        res.status(200).json({
            message : "User group has been changed", 
            result
        })
    } catch (err) {
        return res.status(500).json({
            message : "Server Error"
        })    
    }
}

async function checkGroup(username, groupname) {

    try {
        let sql1 = "SELECT gl.group_name " + 
                    "FROM user_group ug " + 
                    "JOIN group_list gl ON ug.group_id = gl.group_id " + 
                    "WHERE ug.user_name = ?";
        const [result] = await pool.execute(sql1, [username])
        // console.log("checkGroup result is : ");
        // console.log(result);
        // console.log(result[0].group_name);
        if (groupname === result[0].group_name) {
            return true
        }
        else {
            return false
        }
    } catch (err) {
        console.log(err);
    }
}