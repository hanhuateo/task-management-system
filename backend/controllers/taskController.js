const pool = require("../utils/db");
const nodemailer = require("nodemailer");

exports.getAllPartialTaskDetails = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
        let {task_app_acronym} = req.body;
		let get_all_partial_task_details_sql =
			"SELECT t.task_id, t.task_name, t.task_description, t.task_owner, t.task_state, t.task_plan, p.plan_colour " +
            "FROM task t LEFT JOIN plan p ON t.task_app_acronym = p.plan_app_acronym AND  t.task_plan = p.plan_mvp_name WHERE task_app_acronym = ?"

		const [value, field] = await pool.query(get_all_partial_task_details_sql, [task_app_acronym]);
        // console.log(value);
		res.status(200).json({
			message: "get all partial task details successful",
			success: true,
			value,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "failed to retrieve from database",
			success: false,
		});
	}
};

exports.getFullTaskDetails = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id } = req.body;
		let get_full_task_details_sql = "SELECT * FROM task WHERE task_id = ?";

		const [value, field] = await pool.query(get_full_task_details_sql, [
			task_id,
		]);

		if (value.length === 0) {
			return res.status(400).json({
				message: "No tasks found",
				success: false,
			});
		}

		return res.status(200).json({
			message: "get full task details successful",
			success: true,
			value,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "failed to retrieve from database",
			success: false,
		});
	}
};

exports.createTask = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let {
			task_id,
			task_name,
			task_description,
			task_notes,
			task_plan,
			task_app_acronym,
		} = req.body;

        if (task_name > 64) {
            return res.status(400).json({
                message : "task name has must be 1-64 characters"
            })
        }
        
        if (task_description.length > 255) {
            task_description = task_description.substring(0,255);
        }

		let check_group_sql =
			"SELECT app_permit_create FROM application WHERE app_acronym = ?";

		const [checkGroup_result, checkGroup_fields] = await pool.execute(
			check_group_sql,
			[task_app_acronym]
		);
        // console.log(checkGroup_result);
		let isAuthorizedGroups = await checkGroup(
			username,
			checkGroup_result[0].app_permit_create
		);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
			});
		}

		let current_date = getFormattedDateString();

		// will implement this later when front-end is up and running so that can pass the app_rnumber from front-end
		let appRNumber_sql =
			"SELECT app_rnumber FROM application WHERE app_acronym = ?";

		const [appRNumber_result, appRNumber_fields] = await pool.execute(
			appRNumber_sql,
			[task_app_acronym]
		);
        // console.log(appRNumber_result);
		let increment_appRNumber_sql =
			"UPDATE application SET App_Rnumber = ? WHERE app_acronym = ?";

		const [increment_appRNumber_result, increment_appRNumber_fields] =
			await pool.query(increment_appRNumber_sql, [
				appRNumber_result[0].app_rnumber + 1,
				task_app_acronym,
			]);

		task_id = task_app_acronym + "_" + appRNumber_result[0].app_rnumber.toString();

		let task_state = "open";

		let task_creator = username;

		let task_owner = username;

		let task_createdate = current_date;

        let current_datetime = getFormattedDateTimeString();

        if (task_notes) {
            task_notes = task_notes + " \nTask Created by: " + username + " | On: " + current_datetime + " | State: " + task_state + " \n##########################################################################################";
        } else {
            task_notes = "Task Created by: " + username + " | On: " + current_datetime + " | State: " + task_state + " \n##########################################################################################";
        }

		let createTask_sql =
			"INSERT INTO task VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		const [createTask_result, createTask_fields] = await pool.execute(
			createTask_sql,
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
		);

		return res.status(200).json({
			message: "Created new task successfully",
			success: true,
			createTask_result,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to create new task",
			success: false,
		});
	}
};

exports.getTaskByState = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	// not sure if this one need checkgroup or what so fk it first

	try {
		let { task_state } = req.body;

		let getTaskbyState_sql = "SELECT * from task WHERE task_state = ?";

		const [result, fields] = await pool.execute(getTaskbyState_sql, [
			task_state,
		]);

		return res.status(200).json({
			message: `Successfully retrieved all tasks of state ${task_state}`,
			success: true,
			result,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to retrieve from database",
			success: false,
		});
	}
};

exports.promoteTaskOpen2Todo = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
        let { task_id, task_app_acronym, task_notes} = req.body;

        let check_group_sql =
            "SELECT app_permit_open FROM application WHERE app_acronym = ?";

        let [checkGroup_result, checkGroup_fields] = await pool.query(
            check_group_sql,
            [task_app_acronym]
        );
        let groupname = checkGroup_result[0].app_permit_open;

        let isAuthorizedGroups = await checkGroup(username, groupname);

        if (!isAuthorizedGroups) {
            return res.status(400).json({
                message: "Do not have permission to access this resource",
                success: false,
                checkGroup_result,
            });
        }

        task_notes = "\nPromoted by: " + username + " From Open to Todo | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);



		let promoteTaskOpen2Todo_sql =
			"UPDATE task SET task_state = 'todo' WHERE task_id = ? AND task_app_acronym = ?";

		let [promoteTaskOpen2Todo_result, promoteTaskOpen2Todo_fields] =
			await pool.query(promoteTaskOpen2Todo_sql, [task_id, task_app_acronym]);

		// change last touch

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully promoted from open to todo",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to promote task",
			success: false,
		});
	}
};

exports.promoteTaskTodo2Doing = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id, task_app_acronym, task_notes } = req.body;

		let check_group_sql =
			"SELECT app_permit_todolist FROM application WHERE app_acronym = ?";

		let [checkGroup_result, checkGroup_fields] = await pool.query(
			check_group_sql,
			[task_app_acronym]
		);

		let groupname = checkGroup_result[0].app_permit_todolist;

		let isAuthorizedGroups = await checkGroup(username, groupname);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
				groupname,
			});
		}
        task_notes = "\nPromoted by: " + username + " From Todo to Doing | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);
		let promoteTaskTodo2Doing_sql =
			"UPDATE task SET task_state = 'doing' WHERE task_id = ? AND task_app_acronym = ?";

		const [promoteTaskTodo2Doing_result, promoteTaskTodo2Doing_fields] =
			await pool.query(promoteTaskTodo2Doing_sql, [task_id, task_app_acronym]);

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully promoted from todo to doing",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to promote task",
			success: false,
		});
	}
};

exports.promoteTaskDoing2Done = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id, task_app_acronym, task_notes } = req.body;

		let check_group_sql =
			"SELECT app_permit_doing FROM application WHERE app_acronym = ?";

		let [checkGroup_result, checkGroup_fields] = await pool.query(
			check_group_sql,
			[task_app_acronym]
		);

		let groupname = checkGroup_result[0].app_permit_doing;

		let isAuthorizedGroups = await checkGroup(username, groupname);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
			});
		}

        task_notes = "\nPromoted by: " + username + " From Doing to Done | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);

		let promoteTaskDoing2Done_sql =
			"UPDATE task SET task_state = 'done' WHERE task_id = ? AND task_app_acronym = ?";

		const [promoteTaskDoing2Done_result, promoteTaskDoing2Done_fields] =
			await pool.query(promoteTaskDoing2Done_sql, [task_id, task_app_acronym]);

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully promoted from doing to done",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to promote task",
			success: false,
		});
	}
};

exports.promoteTaskDone2Close = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id, task_app_acronym, task_notes } = req.body;

		let check_group_sql =
			"SELECT app_permit_done FROM application WHERE app_acronym = ?";

		let [checkGroup_result, checkGroup_fields] = await pool.query(
			check_group_sql,
			[task_app_acronym]
		);

		let groupname = checkGroup_result[0].app_permit_done;

		let isAuthorizedGroups = await checkGroup(username, groupname);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
			});
		}

        task_notes = "\nPromoted by: " + username + " From Done to Close | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);

		let promoteTaskDone2Close_sql =
			"UPDATE task SET task_state = 'close' WHERE task_id = ? AND task_app_acronym = ?";

		const [promoteTaskDoing2Done_result, promoteTaskDoing2Done_fields] =
			await pool.query(promoteTaskDone2Close_sql, [task_id, task_app_acronym]);

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully promoted from done to close",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to promote task",
			success: false,
		});
	}
};

exports.demoteTaskDoing2Todo = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id, task_app_acronym, task_notes } = req.body;

		let check_group_sql =
			"SELECT app_permit_doing FROM application WHERE app_acronym = ?";

		let [checkGroup_result, checkGroup_fields] = await pool.query(
			check_group_sql,
			[task_app_acronym]
		);

		let groupname = checkGroup_result[0].app_permit_doing;

		let isAuthorizedGroups = await checkGroup(username, groupname);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
			});
		}


        task_notes = "\nDemoted by: " + username + " From Doing to Todo | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);

		let demoteTaskDoing2Todo_sql =
			"UPDATE task SET task_state = 'todo' WHERE task_id = ? AND task_app_acronym = ?";

		const [demoteTaskDoing2Todo_result, demoteTaskDoing2Todo_fields] =
			await pool.query(demoteTaskDoing2Todo_sql, [task_id, task_app_acronym]);

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully demoted from doing to todo",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to demote task",
			success: false,
		});
	}
};

exports.demoteTaskDone2Doing = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

	try {
		let { task_id, task_app_acronym, task_notes } = req.body;

		let check_group_sql =
			"SELECT app_permit_done FROM application WHERE app_acronym = ?";

		let [checkGroup_result, checkGroup_fields] = await pool.query(
			check_group_sql,
			[task_app_acronym]
		);

		let groupname = checkGroup_result[0].app_permit_done;

		let isAuthorizedGroups = await checkGroup(username, groupname);

		if (!isAuthorizedGroups) {
			return res.status(400).json({
				message: "Do not have permission to access this resource",
				success: false,
				checkGroup_result,
			});
		}

        task_notes = "\nDemoted by: " + username + " From Done to Doing | On: " + current_datetime + " \n########################################################################################## ␟" + task_notes;
        let updateTaskNotes_sql =
        "UPDATE task SET task_notes = ? WHERE task_id = ? AND task_app_acronym = ?";

        let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
            task_notes,
            task_id,
            task_app_acronym,
        ]);

		let demoteTaskDone2Doing_sql =
			"UPDATE task SET task_state = 'doing' WHERE task_id = ? AND task_app_acronym = ?";

		const [demoteTaskDone2Doing_result, demoteTaskDone2Doing_fields] =
			await pool.query(demoteTaskDone2Doing_sql, [task_id, task_app_acronym]);

		let lastTouch_sql =
			"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

		let [lastTouch_result, lastTouch_fields] = await pool.query(lastTouch_sql, [
			(task_owner = username),
			task_id,
			task_app_acronym,
		]);

		return res.status(200).json({
			message: "Task successfully demoted from done to doing",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Failed to demote task",
			success: false,
		});
	}
};

exports.updateTaskNotes = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
    let current_datetime = getFormattedDateTimeString();

	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}
	try {
		let { task_id, task_app_acronym, task_notes, task_state } = req.body;
        // console.log(task_notes);
        // console.log(task_app_acronym);
        // console.log(task_id);
        // console.log('updating task notes');

		if (task_notes) {
            task_notes = task_notes + " \nUpdated by: " + username + " | On: " + current_datetime + " | State: " + task_state + " \n##########################################################################################" + "␟";
			let updateTaskNotes_sql =
				"UPDATE task SET task_notes = CONCAT(?, task_notes) WHERE task_id = ? AND task_app_acronym = ?";

			let updateTaskNotes_response = await pool.execute(updateTaskNotes_sql, [
				task_notes,
				task_id,
				task_app_acronym,
			]);

			let lastTouch_sql =
				"UPDATE task SET task_owner = ? WHERE task_id = ? and task_app_acronym = ?";

			let [lastTouch_result, lastTouch_fields] = await pool.query(
				lastTouch_sql,
				[(task_owner = username), task_id, task_app_acronym]
			);

			return res.status(200).json({
				message: "successfully updated task notes",
				success: true,
			});
		} else {
			return res.status(200).json({
				message: "task notes is empty, lepak",
				success: true,
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "failed to update task notes",
			success: false,
		});
	}
};

exports.updateTaskPlan = async (req, res, next) => {
	let username = req.user;
	let isActive = await checkActive(username);
	// console.log("isActive : " + isActive);

	if (!isActive) {
		return res.status(400).json({
			message: "Do not have permission to access this resource",
			success: false,
		});
	}

    try {
        let { task_id, task_app_acronym, task_plan } = req.body;
        console.log(task_plan);
        let updateTaskPlan_sql = "UPDATE task SET task_plan = ? WHERE task_id = ? AND task_app_acronym = ?"

        let [updateTaskPlan_result, updateTaskPlan_field] = await pool.query(updateTaskPlan_sql, [task_plan || null, task_id, task_app_acronym]);

        return res.status(200).json({
            message : "successfully updated task plan",
            success : true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : "failed to update task plan",
            success : false
        })
    }
};

exports.checkAppPermitState = async (req, res, next) => {
    let {app_acronym, task_state} = req.body;

    try {
        if (task_state === 'create') {
            let sql = "SELECT app_permit_create FROM application WHERE app_acronym = ?";
            const [response, field] = await pool.query(sql, [app_acronym]);
            // console.log(response[0].app_permit_create);
            let result = response[0].app_permit_create;
            return res.status(200).json({
                message : "Successfully check app permit state",
                success : true,
                result
            })
        }

        if (task_state === 'open') {
            let sql = "SELECT app_permit_open FROM application WHERE app_acronym = ?";
            const [response, field] = await pool.query(sql, [app_acronym]);
            // console.log(response[0].app_permit_open);
            let result = response[0].app_permit_open;
            return res.status(200).json({
                message : "Successfully check app permit state",
                success : true,
                result
            })
        }

        if (task_state === 'todo') {
            let sql = "SELECT app_permit_todolist FROM application WHERE app_acronym = ?";
            const [response, field] = await pool.query(sql, [app_acronym]);
            // console.log(response[0].app_permit_todolist);
            let result = response[0].app_permit_todolist;
            return res.status(200).json({
                message : "Successfully check app permit state",
                success : true,
                result
            })
        }

        if (task_state === 'doing') {
            let sql = "SELECT app_permit_doing FROM application WHERE app_acronym = ?";
            const [response, field] = await pool.query(sql, [app_acronym]);
            // console.log(response[0].app_permit_doing);
            let result = response[0].app_permit_doing;
            return res.status(200).json({
                message : "Successfully check app permit state",
                success : true,
                result
            })
        }

        if (task_state === 'done') {
            let sql = "SELECT app_permit_done FROM application WHERE app_acronym = ?";
            const [response, field] = await pool.query(sql, [app_acronym]);
            // console.log(response[0].app_permit_done);
            let result = response[0].app_permit_done;
            return res.status(200).json({
                message : "Successfully check app permit state",
                success : true,
                result
            })
        }

        return res.status(200).json({
            message : "not sure why this has to be here but a response is required so here it is",
        })
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            message : "Failed to check app permit state",
            success : false
        })
    }
}

async function checkGroup(username, groupname) {
	try {
		let sql1 =
			"SELECT gl.group_name " +
			"FROM user_group ug " +
			"JOIN group_list gl ON ug.group_id = gl.group_id " +
			"WHERE ug.user_name = ? AND gl.group_name IN (?)";

		const [result] = await pool.query(sql1, [username, groupname]);
		// console.log(result);
		if (result.length === 0) {
			return false;
		}
		return true;
	} catch (err) {
		console.log(err);
	}
}

async function checkActive(username) {
	try {
		let sql = "SELECT Active FROM User WHERE User_name = ?";
		const [val, fields] = await pool.execute(sql, [username]);
		// console.log("val : " + JSON.stringify(val));
		if (JSON.stringify(val).includes('"Active":1')) {
			return true;
		}
		return false;
	} catch (error) {
		console.log(error);
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
    const datetime = currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    return String(datetime);
}

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "lera.heller2@ethereal.email",
        pass: "JEC7Tt1C8sJwQhCaCZ"
    },
});

exports.sendEmail = async (req, res, next) => {
    try {
        let { task_id, task_name } = req.body;
        const info = await transporter.sendMail({
            from: ' "Lera Heller " <lera.heller2@ethereal.email>',
            to: "lera.heller2@ethereal.email",
            subject: `${task_id}, ${task_name} to be reviewed`,
            text: `${task_id}, ${task_name} has been completed, please review it`,
            html: `<div>${task_id}, ${task_name} has been completed, please review it</div>`
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message : "Failed to send email",
            success : false
        })
    }
}