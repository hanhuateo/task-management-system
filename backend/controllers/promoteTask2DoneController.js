const pool = require("../utils/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

async function checkGroup(username, groupname) {
	try {
		let sql1 =
			"SELECT gl.group_name " +
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
}

function getFormattedDateString() {
	const date = new Date();

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
	const year = date.getFullYear();

	// Format as DD-MM-YYYY
	const formattedDate = `${day}/${month}/${year}`;

	// Convert to string explicitly (though it's already a string)
	return String(formattedDate);
}

function getFormattedDateTimeString() {
	const currentdate = new Date();
	const datetime =
		currentdate.getDate() +
		"/" +
		(currentdate.getMonth() + 1) +
		"/" +
		currentdate.getFullYear() +
		" @ " +
		currentdate.getHours() +
		":" +
		currentdate.getMinutes() +
		":" +
		currentdate.getSeconds();
	return String(datetime);
}

const code = {
	auth01: "A001", // invalid credentials
	auth02: "A002", // user is not active
	auth03: "A003", // user does not have permission
	payload01: "P001", // mandatory keys missing
	payload02: "P002", // invalid values
	payload03: "P003", // value out of range
	payload04: "P004", // task state error
    url01: "U001", // url is incorrect
    success01: "S001", // no errors, successful
    error01: "E001" // general error
};

exports.promoteTask2Done = async (req, res, next) => {
    const {
        username,
        password,
        app_acronym,
        task_id
    } = req.body;

    if (!username || !password || !task_id) {
        return res.status(400).json({code: code.payload01}); // missing mandatory keys
    }

    if (app_acronym && app_acronym.lengh > 64) {
        return res.status(400).json({ code: code.payload02}); // task_app_acronym too long
    }

    if (task_id && task_id.length > 128) {
        return res.status(400).json({code: code.payload02}); // task_id too long
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
                code: code.auth01, // invalud credentials
            });
        }

        if (user[0].active === 0) {
            return res.status(400).json({
                code: code.auth02 // user active status is false
            })
        }

        const [app_permit_doing] = await pool.query("SELECT app_permit_doing FROM application WHERE app_acronym = ?", [app_acronym]);

        // console.log(app_permit_doing); // [ { app_permit_doing: 'farm_dev } ]

        const permitted_groups = app_permit_doing[0].app_permit_doing;

        const isPermitted = await checkGroup(username, permitted_groups);

        if (!isPermitted) {
            return res.status(400).json({ code: code.auth03});
        }

        const [task_state] = await pool.query(`SELECT task_state FROM task WHERE task_id = ?`, [task_id]);

        console.log(task_state); // [ { task_state: 'doing' } ]

        if (task_state[0].task_state !== 'doing') {
            return res.status(400).json({
                code : code.payload04
            })
        }

        let [task_notes] = await pool.query(`SELECT task_notes FROM task WHERE task_id = ?`, [task_id]);

        // console.log(task_notes);
        /* [
            {
                task_notes: 'Task Created by: farm_pl | On: 6/10/2024 @ 17:45:33 | State: open \n' +
                '##########################################################################################'
            }
        ]*/

        let current_datetime = getFormattedDateTimeString();

        task_notes = "\nPromoted by: " + username + " From Doing to Done | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes[0].task_notes;

        await pool.query(`START TRANSACTION;`);

        await pool.execute(`UPDATE task SET task_notes = ? WHERE task_id = ?`, [task_notes, task_id]);

        await pool.execute(`UPDATE task SET task_state = 'done';`);

        await pool.query(`COMMIT;`);

        return res.status(201).json({code: code.success01});
    } catch (error) {
        console.log(error);
        await pool.query(`ROLLBACK;`);
        return res.status(500).json({
            code: code.error01,
        });
    }
}