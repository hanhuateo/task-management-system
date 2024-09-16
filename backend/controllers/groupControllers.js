const pool = require('../utils/db');
exports.createNewGroup = async (req, res, next) => {
    let username = req.user;
    let is_admin = await checkGroup(username, "admin");
    console.log(is_admin);
    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let {group_name} = req.body;
        let sql = 'INSERT INTO group_list (Group_name) VALUES (?)';
        const [result] = await pool.execute(sql, [group_name]);

        res.status(200).json({message : "New group created.", result});
    } catch (err) {
        return res.status(500).json({
            message : "Server Error",
        })
    }    
}

exports.getAllUserGroup = async (req, res, next) => {
    let username = req.user;
    let is_admin = await checkGroup(username, 'admin');

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let sql = 'SELECT Group_name FROM group_list WHERE Group_name != ?';
        let [val, fields] = await pool.execute(sql, ['admin'])
        res.status(200).json({val});
    } catch (err) {
        return res.status(500).json({
            message : "Server Error",
        })
    }
}

exports.getUserGroup = async (req, res, next) => {
    let username = req.user;
    let is_admin = await checkGroup(username, 'admin');

    if (!is_admin) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        const {username} = req.body;
        let sql = 'SELECT Group_name FROM user_group WHERE User_name = ?';
        const [result] = await pool.execute(sql, [username]);
        res.send(result);
    } catch (err) {
        return res.status(500).json({
            message : "Server Error",
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
        console.log(result);
        if (groupname in result) {
            return true
        }
        else {
            return false
        }
    } catch (err) {
        console.log(err);
    }
}