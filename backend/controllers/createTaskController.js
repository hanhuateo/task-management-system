const pool = require("../utils/db");
const bcrypt = require("bcrypt");

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

exports.createTask = async (req, res, next) => {

    if (req.originalUrl !== "/auth/createTask3") {
        return res.status(400).json({ code: code.url01 });
    }
    
	const {
		username,
		password,
		task_name,
		task_description,
		task_plan,
		task_app_acronym,
	} = req.body;

    let {task_notes} = req.body;

    if (!username || !password || !task_name || !task_app_acronym) {
        return res.status(400).json({ code: code.payload01}); // missing mandatory keys
    }

    if (task_name && task_name.length > 64) {
        return res.status(400).json({ code: code.payload02}); // task_name too long
    }

    if (task_app_acronym && task_app_acronym.lengh > 64) {
        return res.status(400).json({ code: code.payload02}); // task_app_acronym too long
    }

    if (task_description && task_description.length > 255) {
        return res.status(400).json({ code: code.payload03}); // task_description too long
    }

    if (task_notes && task_notes.length > 65535) {
        return res.status(400).json({ code: code.payload03}); // task_notes too long
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

        const [acronym] = await pool.execute("SELECT app_acronym FROM application WHERE app_acronym = ?", [task_app_acronym]);

        // console.log(acronym);
        // [ { app_acronym: 'Zoo' } ]

        if (!acronym) {
            return res.status(400).json({code: code.payload02}) // invalid app_acronym value in payload
        }

        const [app_permit_create] = await pool.query("SELECT app_permit_create FROM application WHERE app_acronym = ?", [task_app_acronym]);

        //console.log(app_permit_create); // [ { app_permit_create: 'farm_pl' } ]

        const permitted_groups = app_permit_create[0].app_permit_create;

        const isPermitted = await checkGroup(username, permitted_groups);

        if (!isPermitted) {
            // console.log('not permitted');
            return res.status(400).json({code: code.auth03});
        }

        if (task_plan) {
            const [task_plan_exist] = await pool.execute("SELECT plan_mvp_name FROM plan WHERE plan_mvp_name = ? AND plan_app_acronym = ?", [task_plan, task_app_acronym]);

            // console.log(task_plan_exist) // [ { plan_mvp_name: 'sprint 1' } ]

            if (!task_plan_exist) {
                return res.status(400).json({code: code.payload02});
            }
        }

        const [app_rnumber] = await pool.query("SELECT app_rnumber FROM application WHERE app_acronym = ?", [task_app_acronym]);
        //console.log(app_rnumber); // [ { app_rnumber: 23 } ]
        const rnumber = app_rnumber[0].app_rnumber;
        const task_id = `${task_app_acronym}_${rnumber}`;

        const current_datetime  = getFormattedDateTimeString();

        let task_state = "open";

        let task_creator = username;

        let task_owner = username;

        let task_createdate = getFormattedDateString();

        if (task_notes) {
            task_notes = task_notes + " \nTask Created by: " + username + " | On: " + current_datetime + " | State: " + task_state + " \n##########################################################################################";
        } else {
            task_notes = "Task Created by: " + username + " | On: " + current_datetime + " | State: " + task_state + " \n##########################################################################################";
        }

        await pool.query(`START TRANSACTION;`);

        await pool.query(`UPDATE application SET app_rnumber = ? WHERE app_acronym = ?`, [rnumber + 1, task_app_acronym]);

        await pool.query(`INSERT INTO task (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                task_id,
				task_name,
				task_description || null,
				task_notes || null,
				task_plan || null,
				task_app_acronym,
				task_state,
				task_creator,
				task_owner,
				task_createdate,
            ]
        )

        await pool.query(`COMMIT;`);

        return res.status(201).json({code: code.success01});
    } catch (error) {
        console.log(error);
        await pool.query(`ROLLBACK;`);
        return res.status(500).json({
            code: code.error01,
        });
    }
};
