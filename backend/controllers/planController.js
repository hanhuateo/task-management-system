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

    let is_project_manager = await checkGroup(username, "%pm");

    if (!is_project_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {plan_mvp_name, plan_startdate, plan_enddate, 
            plan_app_acronym, plan_colour} = req.body;
        console.log(plan_mvp_name);
        console.log(plan_startdate);
        console.log(plan_enddate);
        console.log(plan_app_acronym);
        console.log(plan_colour);
        const startdate = convertToDate(plan_startdate);
        const enddate = convertToDate(plan_enddate);

        if (plan_mvp_name.length > 64) {
            return res.status(400).json({
                message : "Plan name must be 1-64 characters"
            })
        }

        if (startdate > enddate) {
            return res.status(400).json({
                message : "start date cannot be later than end date",
                success : false
            })
        }

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

    // let is_project_lead_or_manager = await checkGroup(username, ["PL", "PM"]);

    // if (!is_project_lead_or_manager) {
    //     return res.status(400).json({
    //         message : "Do not have permission to access this resource",
    //         success : false
    //     })
    // };
    
    try {
        let {plan_app_acronym} = req.body;
        let get_all_plan_mvp_name_sql = "SELECT plan_mvp_name FROM plan WHERE plan_app_acronym = ?";
        
        const [result, field] = await pool.query(get_all_plan_mvp_name_sql, [plan_app_acronym]);

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

    let is_project_manager = await checkGroup(username, '%pm');

    if (!is_project_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {plan_mvp_name, plan_app_acronym} = req.body;
        let get_plan_details_sql = "SELECT * FROM plan WHERE plan_mvp_name = ? AND plan_app_acronym = ?";

        const [result] = await pool.query(get_plan_details_sql, [
            plan_mvp_name,
            plan_app_acronym
        ]);

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

exports.updatePlanDetails = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    let is_project_manager = await checkGroup(username, '%pm');

    if (!is_project_manager) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {plan_mvp_name, plan_startdate, plan_enddate, 
            plan_app_acronym, plan_colour} = req.body;

        // console.log(plan_mvp_name);
        // console.log(plan_startdate);
        // console.log(plan_enddate);
        // console.log(plan_app_acronym);
        // console.log(plan_colour);

        const startdate = convertToDate(plan_startdate);
        const enddate = convertToDate(plan_enddate);

        // console.log(startdate);
        // console.log(enddate);

        if (startdate > enddate) {
            return res.status(400).json({
                message : "start date cannot be later than end date",
                success : false
            })
        }
        
        if (plan_startdate) {
            let update_plan_start_date_sql = "UPDATE plan SET plan_startdate = ? " + 
                                             "WHERE plan_mvp_name = ? AND plan_app_acronym = ?";

            const result = await pool.execute(update_plan_start_date_sql, [
                plan_startdate,
                plan_mvp_name,
                plan_app_acronym
            ])
        };

        if (plan_enddate) {
            let update_plan_end_date_sql = "UPDATE plan SET plan_enddate = ? " + 
                                           "WHERE plan_mvp_name = ? AND plan_app_acronym = ?";
            
            const result = await pool.execute(update_plan_end_date_sql, [
                plan_enddate,
                plan_mvp_name,
                plan_app_acronym
            ])
        };

        if (plan_colour) {
            let update_plan_colour_sql = "UPDATE plan SET plan_colour = ? " + 
                                         "WHERE plan_mvp_name = ? AND plan_app_acronym = ?";
                        
            const result = await pool.execute(update_plan_colour_sql, [
                plan_colour,
                plan_mvp_name, 
                plan_app_acronym
            ])
        };

        return res.status(200).json({
            message : "Successfully updated plan",
            success : true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to update plan",
            success : false
        })
    }
}

async function checkGroup(username, groupname) {

    try {
        // let sql1 = "SELECT gl.group_name " + 
        //             "FROM user_group ug " + 
        //             "JOIN group_list gl ON ug.group_id = gl.group_id " + 
        //             "WHERE ug.user_name = ? AND (gl.group_name IN (?) OR gl.group_name LIKE '%pl%') ";

        let sql1 = "SELECT gl.group_name " + 
                    "FROM user_group ug " + 
                    "JOIN group_list gl on ug.group_id = gl.group_id " + 
                    "WHERE ug.user_name = ? AND gl.group_name LIKE ? ";
                    
        const [result] = await pool.query(sql1, [username, groupname]);
        // console.log(result);
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
        // console.log("val : " + JSON.stringify(val));
        if (JSON.stringify(val).includes('"Active":1')) {
            return true;
        };
        return false;
    } catch (error) {
        console.log(error);
    }
}

function convertToDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`)
}