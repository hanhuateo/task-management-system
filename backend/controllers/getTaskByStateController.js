const pool = require("../utils/db");
const bcrypt = require("bcrypt");

const code = {
	auth01: "A001", // invalid credentials
	auth02: "A002", // user is not active
	auth03: "A003", // user does not have permission
	payload01: "P001", // mandatory keys missing
    url01: "U001", // url is incorrect
    success01: "S001", // no errors, successful
    error01: "E001", // general error
	trans01: "T001", // invalid values
	trans02: "T002", // value out of range
	trans03: "T003", // task state error
    trans04: "T004", // transaction failed
};

exports.getTaskByState = async (req, res, next) => {

    if (req.originalUrl !== "/api/task/getTaskByState") {
        return res.status(400).json({ code: code.url01 });
    }

    const {
        username,
        password,
        task_appAcronym,
        task_state
    } = req.body;

    if (!username || !password || !task_appAcronym || !task_state) {
        return res.status(400).json({ code: code.payload01}); // invalid credentials
    }

    if (password.length > 10) {
        return res.status(400).json({code: code.auth01});
    }

    if (task_appAcronym && task_appAcronym.length > 64) {
        return res.status(400).json({ code: code.trans02}); // task_appAcronym value too long
    }

    if (task_state && !(['open', 'todo', 'doing', 'done', 'close'].includes(task_state))) {
        return res.status(400).json({ code: code.trans01}); // task_state value not in the ENUM stated in the DB
    }

    try {
        const [user] = await pool.execute("SELECT * FROM user WHERE user_name = ?", [username]);

        // console.log(user); 
        /* [
            {
              user_name: 'PL1',
              password: '$2b$10$RVT8DyHKxVU3ec9Ds4ZFJuAgOCVrA/FAN6f5kUFvxdpV8tj7Ps0JW',
              email: 'pl1@gmail.com',
              active: 1
            }
        ] */

        
        if (!user || !(await bcrypt.compare(password, user[0].password))) {
            return res.status (400).json({
                code: code.auth01, // invalid credentials
            });
        }

        if (user[0].active === 0) {
            return res.status(400).json({
                code: code.auth02 // user active status is false
            })
        }

        const [acronym] = await pool.execute("SELECT app_acronym FROM application WHERE app_acronym = ?", [task_appAcronym]);

        // console.log(acronym);
        // [ { app_acronym: 'Zoo' } ]

        if (acronym.length === 0) {
            return res.status(400).json({code: code.trans02}) // invalid app_acronym value 
        }

        const [result] = await pool.query(
            `SELECT t.task_id, t.task_name, t.task_description, t.task_owner, t.task_state, t.task_plan, p.plan_colour
            FROM task t 
            LEFT JOIN plan p ON t.task_app_acronym = p.plan_app_acronym AND  t.task_plan = p.plan_mvp_name 
            WHERE t.task_state = ? AND t.task_app_acronym = ?`, [task_state, task_appAcronym]);

        return res.status(201).json({
            data: result,
            code: code.success01
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: code.error01
        })
    }
}