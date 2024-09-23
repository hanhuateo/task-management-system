const pool = require('../utils/db');

exports.getAllPartialTaskDetails = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    }

    try {
        let get_all_partial_task_details_sql = "SELECT task_id, task_name, task_description, task_owner FROM task";
    
        const [value, field] = await pool.query(get_all_partial_task_details_sql);

        res.status(200).json({
            message : "get all partial task details successful",
            success : true,
            value
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "failed to retrieve from database",
            success : false
        })
    }
};

exports.getFullTaskDetails = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    }
    
    try{ 
        let task_name = req.body;
        let get_full_task_details_sql = "SELECT * FROM task WHERE task_name = ?";
        
        const [value, field] = await pool.query(get_full_task_details_sql, [task_name]);

        res.status(200).json({
            message : "get full task details successful",
            success : true,
            value
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "failed to retrieve from database",
            success : false
        })
    }
};

exports.createNewTask = async (req, res, next) => {

}
async function checkGroup(username, groupname) {

    try {
        let sql1 = "SELECT gl.group_name " + 
                    "FROM user_group ug " + 
                    "JOIN group_list gl ON ug.group_id = gl.group_id " + 
                    "WHERE ug.user_name = ? AND gl.group_name IN (?)";
                    
        const [result] = await pool.query(sql1, [username, groupname]);
        
        if (result.length === 0) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
    }
};

async function checkActive(username) {
    try {
        let sql = "SELECT Active FROM User WHERE User_name = ?";
        const [val, fields] = await pool.execute(sql, [username]);
        console.log("val : " + JSON.stringify(val));
        if (JSON.stringify(val).includes('"Active":1')) {
            return true;
        };
        return false;
    } catch (error) {
        console.log(error);
    }
}