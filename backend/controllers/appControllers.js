const pool = require('../utils/db');

exports.createNewApp = async (req, res, next) => {
    let username = req.user;
    let is_project_lead = checkGroup(username, ["PL"]);

    if (!is_project_lead) {
        return res.status(500).json({
            message : "Do not have permission to access this resource"
        })
    }

    try {
        let {app_acronym, app_description, app_rnumber, app_startdate, app_enddate,
            app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing,
            app_permit_done
        } = req.body;

        if (!app_acronym || !app_rnumber || !app_startdate || !app_enddate) {
            return res.status(400).json({
                message : "Please fill in the mandatory fields",
                success : false
            })
        };

        let check_duplicate_sql = "SELECT App_acronym FROM Application WHERE App_acronym = ?";

        const [check_result] = await pool.execute(check_duplicate_sql, [app_acronym]);

        if (check_result.length > 0) {
            return res.status(400).json({
                message : "App acronym already taken",
                success : false
            })
        }

        let create_sql = "INSERT INTO Application (App_acronym, App_Description, " + 
                         "App_Rnumber, App_startDate, App_endDate, App_permit_Create, " + 
                         "App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        const [result] = await pool.execute(create_sql, [
            app_acronym,
            app_description || null,
            app_rnumber,
            app_startdate,
            app_enddate,
            app_permit_create || null, 
            app_permit_open || null,
            app_permit_todolist || null, 
            app_permit_doing || null, 
            app_permit_done || null            
        ]);

        return res.status(200).json({
            message : "App created successfully",
            success : true,
            result
        });

    } catch (error) {
        console.log("error : " + error);
        return res.status(500).json({
            message : "Failed to create app",
            success : false
        })
    }

};

exports.getAllApps = async (req, res, next) => {
    let username = req.user;

}

exports.updateApp = async (req, res, next) => {
    let username = req.user;
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

