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
        let task_id = req.body;
        let get_full_task_details_sql = "SELECT * FROM task WHERE task_id = ?";
        
        const [value, field] = await pool.query(get_full_task_details_sql, [task_id]);

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

exports.createTask = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {task_id, task_name, task_description, task_notes,
            task_plan, task_app_acronym, task_state, task_creator, 
            task_owner, task_createDate} = req.body;

        let check_group_sql = "SELECT app_permit_create FROM application WHERE app_acronym = ?";

        const [checkGroup_result, checkGroup_fields] = await pool.execute(check_group_sql, [
            task_app_acronym
        ]);

        let isAuthorizedGroups = await checkGroup(username, checkGroup_result);

        if (!isAuthorizedGroups) {
            return res.status(400).json({
                message : "Do not have permission to access this resource",
                success : false,
                checkGroup_result
            })
        }
        
        let createTask_sql = "INSERT INTO task VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        const [createTask_result, createTask_fields] = await pool.execute(createTask_sql, [
            task_id,
            task_name,
            task_description,
            task_notes,
            task_plan,
            task_app_acronym,
            task_state,
            task_creator,
            task_owner,
            task_createDate
        ]);

        return res.status(200).json({
            message : "Created new task successfully",
            success : true,
            createTask_result
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to create new task",
            success : false
        })
    };
};

exports.getTaskByState = async (req, res, next) => {
    let username = req.user; 
    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    // not sure if this one need checkgroup or what so fk it first

    try {
        let {task_state} = req.body;

        let getTaskbyState_sql = "SELECT * from task WHERE task_state = ?";

        const result = await pool.execute(getTaskbyState_sql, [task_state]);

        return res.status(200).json({
            message : `Successfully retrieved all tasks of state ${task_state}`,
            success : true,
            result
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to retrieve from database",
            success : false
        })
    }
};

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
};