const pool = require("../utils/db");
const bcrypt = require("bcryptjs");

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
	url01: "U001", // url is incorrect
	success01: "S001", // no errors, successful
	error01: "E001", // general error
	trans01: "T001", // invalid values
	trans02: "T002", // value out of range
	trans03: "T003", // task state error
	trans04: "T004", // transaction failed
};

exports.createTask = async (req, res, next) => {
	if (req.originalUrl !== "/api/task/createTask") {
		return res.status(400).json({ code: code.url01 });
	}

	const {
		username,
		password,
		task_name,
		task_description,
		task_plan,
		task_appAcronym,
	} = req.body;

	let { task_notes } = req.body;

	if (!username || !password || !task_name || !task_appAcronym) {
		return res.status(400).json({ code: code.payload01 }); // missing mandatory keys
	}

	if (password.length > 10) {
		return res.status(400).json({ code: code.auth01 });
	}

	if (task_name && task_name.length > 64) {
		return res.status(400).json({ code: code.trans02 }); // task_name too long
	}

	// if (task_appAcronym && task_appAcronym.length > 64) {
	//     return res.status(400).json({ code: code.trans02}); // task_appAcronym too long
	// }

	if (task_description && task_description.length > 255) {
		return res.status(400).json({ code: code.trans02 }); // task_description too long
	}

	if (task_notes && task_notes.length > 65535) {
		return res.status(400).json({ code: code.trans02 }); // task_notes too long
	}

	try {
		const [user] = await pool.execute(
			"SELECT * FROM user WHERE user_name = ?",
			[username]
		);

		// console.log(user);
		/* [
            {
              user_name: 'PL1',
              password: '$2b$10$RVT8DyHKxVU3ec9Ds4ZFJuAgOCVrA/FAN6f5kUFvxdpV8tj7Ps0JW',
              email: 'pl1@gmail.com',
              active: 1
            }
        ] */

		if (
			!user ||
			user.length === 0 ||
			!(await bcrypt.compare(password, user[0].password))
		) {
			return res.status(400).json({
				code: code.auth01, // invalid credentials
			});
		}

		if (user[0].active === 0) {
			return res.status(400).json({
				code: code.auth02, // user active status is false
			});
		}

		const [acronym] = await pool.execute(
			"SELECT app_acronym FROM application WHERE app_acronym = ?",
			[task_appAcronym]
		);

		// console.log(acronym);
		// [ { app_acronym: 'Zoo' } ]

		if (acronym.length === 0) {
			console.log("acronym");
			return res.status(400).json({ code: code.trans01 }); // invalid app_acronym value
		}

		const [app_permit_create] = await pool.query(
			"SELECT app_permit_create FROM application WHERE app_acronym = ?",
			[task_appAcronym]
		);

		//console.log(app_permit_create); // [ { app_permit_create: 'farm_pl' } ]

		const permitted_groups = app_permit_create[0].app_permit_create;

		const isPermitted = await checkGroup(username, permitted_groups);

		if (!isPermitted) {
			// console.log('not permitted');
			return res.status(400).json({ code: code.auth03 });
		}

		if (task_plan) {
			const [task_plan_exist] = await pool.execute(
				"SELECT plan_mvp_name FROM plan WHERE plan_mvp_name = ? AND plan_app_acronym = ?",
				[task_plan, task_appAcronym]
			);

			// console.log(task_plan_exist) // [ { plan_mvp_name: 'sprint 1' } ]

			if (!task_plan_exist || task_plan_exist.length === 0) {
				console.log("plan");
				return res.status(400).json({ code: code.trans01 }); // invalid plan value
			}
		}

		const [app_rnumber] = await pool.query(
			"SELECT app_rnumber FROM application WHERE app_acronym = ?",
			[task_appAcronym]
		);
		//console.log(app_rnumber); // [ { app_rnumber: 23 } ]
		const rnumber = app_rnumber[0].app_rnumber + 1;
		const task_id = `${task_appAcronym}_${rnumber}`;

		const current_datetime = getFormattedDateTimeString();

		let task_state = "open";

		let task_creator = username;

		let task_owner = username;

		let task_createdate = getFormattedDateString();

		if (task_notes) {
			task_notes =
				task_notes +
				" \nTask Created by: " +
				username +
				" | On: " +
				current_datetime +
				" | State: " +
				task_state +
				" \n##########################################################################################";
		} else {
			task_notes =
				"Task Created by: " +
				username +
				" | On: " +
				current_datetime +
				" | State: " +
				task_state +
				" \n##########################################################################################";
		}

		await pool.query(`START TRANSACTION;`);

		await pool.query(
			`UPDATE application SET app_rnumber = ? WHERE app_acronym = ?`,
			[rnumber, task_appAcronym]
		);

		await pool.query(
			`INSERT INTO task (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				task_id,
				task_name,
				task_description || null,
				task_notes || null,
				task_plan || null,
				task_appAcronym,
				task_state,
				task_creator,
				task_owner,
				task_createdate,
			]
		);

		await pool.query(`COMMIT;`);

		return res.status(201).json({
			task_id: task_id,
			code: code.success01,
		});
	} catch (error) {
		console.log(error);
		await pool.query(`ROLLBACK;`);
		if (error.code === "ER_DUP_ENTRY") {
			return res.status(400).json({ code: code.trans04 }); // database transaction error
		}
		return res.status(500).json({
			code: code.error01,
		});
	}
};
