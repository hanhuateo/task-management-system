const pool = require('../utils/db');

exports.createNewApp = async (req, res, next) => {
    let username = req.user;

    let isActive = await checkActive(username); 

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    }
    
    let is_project_lead = checkGroup(username, "%pl");

    if (!is_project_lead) {
        return res.status(500).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {app_acronym, app_description, app_rnumber, app_startdate, app_enddate,
            app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing,
            app_permit_done
        } = req.body;
        // console.log(app_acronym);
        // console.log(app_rnumber);
        // console.log(app_startdate);
        // console.log(app_enddate);

        const startdate = convertToDate(app_startdate);
        const enddate = convertToDate(app_enddate);
        // console.log(startdate);
        // console.log(enddate);
        if (startdate > enddate) {
            return res.status(400).json({
                message : "start date cannot be later than end date",
                success : false
            })
        }

        if (app_rnumber <= 0) {
            return res.status(400).json({
                message : "App RNumber has to be positive",
                success : false
            })
        };

        if (!app_acronym || !app_rnumber || !app_startdate || !app_enddate) {
            return res.status(400).json({
                message : "Please fill in the mandatory fields: Acronym, Rnumber, Start Date and End Date",
                success : false
            })
        };

        if (app_description.length > 255) {
            app_description = app_description.substring(0,255);
        }

        let check_duplicate_sql = "SELECT App_acronym FROM Application WHERE App_acronym = ?";

        const [check_result] = await pool.execute(check_duplicate_sql, [app_acronym]);

        if (check_result.length > 0) {
            return res.status(400).json({
                message : "App acronym already taken",
                success : false
            })
        };

        // by right should check to make sure that start date is earlier than end date
        // but i think i can do this in the front-end where i just show a calender
        // then whichever date the user chooses, i just disable all the dates earlier than the date chosen

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
        });
    }

};

exports.getAllPartialAppDetails = async (req, res, next) => {
    let username = req.user;
    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    }
    // do not need to check for any groups
    try { 
        let get_partial_app_details_sql = "SELECT App_Acronym, App_Description, App_rnumber " +
                                          "FROM application";

        const [result, fields] = await pool.query(get_partial_app_details_sql);

        res.status(200).json({
            message : "Get partial app details successful",
            success : true,
            result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to retrieve data from database",
            success : false,
        });
    }
};

exports.getFullAppDetails = async (req, res, next) => {
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
        let get_full_app_details_sql = "SELECT * FROM application";

        const [result, fields] = await pool.query(get_full_app_details_sql);

        res.status(200).json({
            message : "Get full app details successful",
            success : true,
            result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to retrieve data from database",
            success : false
        });
    }
};

exports.updateApp = async (req, res, next) => {
    let username = req.user;

    let isActive = await checkActive(username);
    // console.log("isActive : " + isActive);

    if (!isActive) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    }

    let is_project_lead = checkGroup(username, "%pl");

    if (!is_project_lead) {
        return res.status(400).json({
            message : "Do not have permission to access this resource",
            success : false
        })
    };

    try {
        let {app_acronym, app_description, app_permit_create, app_permit_open, 
            app_permit_todolist, app_permit_doing, app_permit_done} = req.body;

        if (app_description) {
            if (app_description.length > 255) {
                app_description = app_description.substring(0,255);
            }
            let update_app_description_sql = "UPDATE application SET app_description = ? WHERE app_acronym = ?";
            const values = [app_description, app_acronym];
            const result = await pool.query(update_app_description_sql, values);
        };

        if (app_permit_create) {
            let update_app_permit_create_sql = "UPDATE application SET app_permit_create = ? WHERE app_acronym = ?";
            const values = [app_permit_create, app_acronym];
            const result = await pool.query(update_app_permit_create_sql, values);
        };

        if (app_permit_open) {
            let update_app_permit_open_sql = "UPDATE application SET app_permit_open = ? WHERE app_acronym = ?";
            const values = [app_permit_open, app_acronym];
            const result = await pool.query(update_app_permit_open_sql, values);
        };

        if (app_permit_todolist){
            let update_app_permit_todolist_sql = "UPDATE application SET app_permit_todolist = ? WHERE app_acronym = ?";
            const values = [app_permit_todolist, app_acronym];
            const result = await pool.query(update_app_permit_todolist_sql, values);
        };

        if (app_permit_doing) {
            let update_app_permit_doing_sql = "UPDATE application SET app_permit_doing = ? WHERE app_acronym = ?";
            const values = [app_permit_doing, app_acronym];
            const result = await pool.query(update_app_permit_doing_sql, values);
        }

        if (app_permit_done) {
            let update_app_permit_done_sql = "UPDATE application SET app_permit_done = ? WHERE app_acronym = ?";
            const values = [app_permit_done, app_acronym];
            const result = await pool.query(update_app_permit_done_sql, values);
        }

        res.status(200).json({
            message : "update successful",
            success : true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "Failed to update app",
            success : false
        })
    }
};

async function checkGroup(username, groupname) {

    try {
        // let sql1 = "SELECT gl.group_name " + 
        //             "FROM user_group ug " + 
        //             "JOIN group_list gl ON ug.group_id = gl.group_id " + 
        //             "WHERE ug.user_name = ? AND gl.group_name IN (?)";

        let sql1 = "SELECT gl.group_name " + 
        "FROM user_group ug " + 
        "JOIN group_list gl on ug.group_id = gl.group_id " + 
        "WHERE ug.user_name = ? AND gl.group_name LIKE ? ";
                    
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
        // console.log("val : " + JSON.stringify(val));
        if (JSON.stringify(val).includes('"Active":1')) {
            return true;
        };
        return false;
    } catch (error) {
        console.log(error);
    }
};

function convertToDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`)
}