const pool = require('../utils/db');

exports.createNewApp = async (req, res, next) => {
    let username = req.user;
    let is_project_lead = checkGroup(username, ["project_lead"]);

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
                message : "Please fill in the mandatory fields"
            })
        }

        
    } catch (error) {
        console.log(error);
    }

}

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

