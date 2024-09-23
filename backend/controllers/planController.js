const pool = require('../utils/db');

exports.createPlan = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    let is_project_manager = await checkGroup(username, ["PM"]);

    if (!is_project_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {plan_mvp_name, plan_startdate, plan_enddate, 
            plan_app_acronym, plan_colour} = req.body;

        let create_plan_sql = "INSERT INTO plan (plan_mvp_name, plan_startdate, " +
                              "plan_enddate, plan_app_acronym, plan_colour) " +
                              "VALUES (?, ?, ?, ?, ?)";
        
        const [result] = await pool.execute(create_plan_sql, [
            plan_mvp_name,
            plan_startdate,
            plan_enddate,
            plan_app_acronym,
            plan_colour
        ]);

        return res.status(200).json({
            message : "Plan created successfully",
            success : true,
            result
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to create plan",
            success : false
        })
    }
};

exports.getAllPlanMVPName = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    let is_project_lead_or_manager = await checkGroup(username, ["PL, PM"]);

    if (!is_project_lead_or_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };
    
    try {
        let get_all_plan_mvp_name_sql = "SELECT plan_mvp_name FROM plan";
        
        const result = await pool.query(get_all_plan_mvp_name_sql);

        return res.status(200).json({
            message : "Successfully retrieved all plan mvp name",
            success : true,
            result
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Unable to retrieve data from database",
            success : false
        })
    }
};

exports.getPlanDetails = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    let is_project_manager = await checkGroup(username, ["PM"]);

    if (!is_project_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {plan_mvp_name} = req.body;
        let get_plan_details_sql = "SELECT * FROM plan WHERE plan_mvp_name = ?";

        const [result] = await pool.query(get_plan_details_sql, [plan_mvp_name]);

        return res.status(200).json({
            message : "Get plan details successfully",
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
}