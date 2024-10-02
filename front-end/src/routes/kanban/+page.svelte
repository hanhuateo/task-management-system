<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';
    import {appData} from '../../store.js';

    let showDropdown = false;
    let username = '';
    let isAdmin = false;
    let user_status = 0;
    let adminUserManagementFlag = false;
    let isProjectLead = false;
    let isProjectManager = false;
    let isUserProjectLead = false;
    let isUserProjectManager = false;
    let showCreateTaskModal = false;
    let projectLeadCreateTaskFlag = false;
    let usergroup = []
    // $:currentApp = $appData;
    // $:{console.log(currentApp)};
    let currentApp;

    appData.subscribe(value => {
        currentApp = value;
    });

    onMount(async () => {
        // console.log(currentApp);
        checkCurrentApp();
        await checkStatus();
        await checkAdmin();
        await checkProjectLead();
        await checkProjectManager();
        await getAllPlanMVPName();
        await getAllPartialTaskDetails();
        await getUserGroup();
        await checkAppPermitCreate();
    })

    const checkStatus = async () => {
        try {
            const user_response = await axios.get('http://localhost:3000/auth/getUserDetails',
                    {
                        withCredentials: true
                    }
                )
            // console.log(user_response);
            username = user_response.data.val[0].user_name;
            user_status = user_response.data.val[0].active;
            if (user_status === 0) {
                goto('http://localhost:5173/login');
            }
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'login first thank you') {
                goto('http://localhost:5173/login');
            }
        }
    }

    const checkAdmin = async () => {
        try {
            const group_response = await axios.get('http://localhost:3000/auth/getUserGroup', 
                {
                    withCredentials: true
                }
            );
            // console.log(group_response);
            
            isAdmin = group_response.data.isAdmin;
            if (!isAdmin && adminUserManagementFlag) {
                // console.log('about to relead');
                // window.location.reload();
                goto('http://localhost:5173/');
                alert('Do not have permission to access this resource');
            }
        } catch (error) {
            console.log(error);
            // alert(error.response.data.message);
            if (error.response.data.message === 'invalid token') {
                goto('http://localhost:5173/login');
            }

            
        }
    }

    const logout = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/logout', {
                withCredentials: true
            });
            // console.log(response);
            goto('http://localhost:5173/login');
        } catch (error) {
            console.log(error);
        }
    }

    const checkProjectLead = async () => {
        try {
            const role_response = await axios.get('http://localhost:3000/auth/getUserGroup', {
                withCredentials:true
            });

            isProjectLead = role_response.data.isProjectLead;
            isUserProjectLead = role_response.data.isUserProjectLead;
            // console.log(isProjectLead);
            // console.log(isUserProjectLead);
            // console.log(isProjectLead);
            // TASK: will have to tackle this part when doing anything related to project lead
            // if (!isProjectLead) {
            //     goto('http://localhost:5173/');
            //     alert('Do not have permission to access this resource');
            // }
        } catch (error) {
            console.log(error);
        }
    }

    const handleMouseEnter = () => {
        showDropdown = true;
    }

    const handleMouseLeave = () => {
        showDropdown = false;
    }

    const handleUserManagementClick = async () => {
        await checkStatus();
        adminUserManagementFlag = true;
        await checkAdmin();
    }

    const checkProjectManager = async () => {
        try {
            const role_response = await axios.get('http://localhost:3000/auth/getUserGroup', {
                withCredentials : true
            })

            isProjectManager = role_response.data.isProjectManager;
            isUserProjectManager = role_response.data.isUserProjectManager;
        } catch (error) {
            console.log(error);
        }
    }

    const checkCurrentApp = () => {
        if (!currentApp) {
            goto('/', {replaceState: true});
        }
    }

    const toggleCreateTaskModal = () => {
        showCreateTaskModal = !showCreateTaskModal;
    }

    const handleCreateTaskClick = async () => {
        await checkStatus();
        projectLeadCreateTaskFlag = true;
        await checkProjectLead();
        if ((isProjectLead || isUserProjectLead) === true && projectLeadCreateTaskFlag === true) {
            await getAllPlanMVPName();
            toggleCreateTaskModal();
        }
    }

    const handleCreateTaskCloseClick = async () => {
        await checkStatus();
        await checkProjectLead();
        projectLeadCreateTaskFlag = false;
        toggleCreateTaskModal();
    }

    let plans = [];
    const getAllPlanMVPName = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/getAllPlanMVPName', 
                {
                    plan_app_acronym : currentApp
                },
                {
                    withCredentials:true
                }
            );
            // console.log(response);
            // console.log(response.data);
            // console.log(response.data.result);
            plans = response.data.result.map(item => item.plan_mvp_name);
            // console.log(plans);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleCreateTaskSubmitClick = async () => {
        await checkStatus();
        await checkProjectLead();
        if ((isProjectLead || isUserProjectLead) === true && projectLeadCreateTaskFlag === true) {
            await createTask();
            toggleCreateTaskModal();
        }
        await getAllPartialTaskDetails();
    }

    let newTask = {task_id : '', task_name : '', task_description : '', task_notes : '', 
                   task_plan : '', task_app_acronym : currentApp};

    const createTask = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/createTask',{
                task_id : newTask.task_id,
                task_name : newTask.task_name,
                task_description : newTask.task_description,
                task_notes : newTask.task_notes,
                task_plan : newTask.task_plan, 
                task_app_acronym : newTask.task_app_acronym 
            }, {
                withCredentials:true
            })
            newTask.task_id = '';
            newTask.task_name = '';
            newTask.task_description = '';
            newTask.task_notes = '';
            newTask.task_plan = '';
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let showPlanDropdown = false;
    const handleMouseEnterPlan = async () => {
        await getAllPlanMVPName();
        showPlanDropdown = true;
    }
    const handleMouseLeavePlan = () => {
        showPlanDropdown = false;
    }

    let editPlan;
    const handlePlanClick = async (plan) => {
        await checkStatus();
        await checkProjectManager();
        editPlan = plan.plan;
        // console.log(editPlan);
        // console.log(currentAppAcronym);
        await getPlanDetails();
        toggleShowOnePlanModal();
        // toggleShowOnePlanModal();
    }

    let editPlanDetails;
    let currentAppAcronym = currentApp;
    const getPlanDetails = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/getPlanDetails', 
                {
                    plan_mvp_name : editPlan,
                    plan_app_acronym : currentAppAcronym
                }, 
                {
                    withCredentials : true
                }
            )
            // console.log(response);
            editPlanDetails = response.data.result[0];
            editPlanDetails.Plan_colour = "#" + editPlanDetails.Plan_colour;
            console.log(editPlanDetails);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let showOnePlanModal = false;
    const toggleShowOnePlanModal = () => {
        showOnePlanModal = !showOnePlanModal;
    }

    const updatePlanDetails = async () => {
        try {
            const response = await axios.patch('http://localhost:3000/auth/updatePlanDetails', {
                plan_mvp_name : editPlanDetails.Plan_MVP_name,
                plan_startdate : editPlanDetails.Plan_startDate,
                plan_enddate : editPlanDetails.Plan_endDate,
                plan_app_acronym : editPlanDetails.Plan_app_Acronym,
                plan_colour : editPlanDetails.Plan_colour.slice(1)
            }, {
                withCredentials:true
            })
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleUpdatePlanDetailsSubmitClick = async () => {
        await checkStatus();
        await checkProjectManager();
        if (user_status === 1 && isProjectManager === true) {
            await updatePlanDetails();
        }
        toggleShowOnePlanModal();
    }

    let newPlan = {Plan_MVP_name : '', Plan_startDate : '', Plan_endDate : '', Plan_app_Acronym : currentApp, Plan_colour : '#000000'};
    let showNewPlanModal = false;
    const toggleShowNewPlanModal = () => {
        showNewPlanModal = !showNewPlanModal;
    }

    const handleShowNewPlanModalClick = async () => {
        await checkStatus();
        await checkProjectManager();
        if (user_status === 1 && isProjectManager === true) {
            toggleShowNewPlanModal();
        }
    }

    const createNewPlan = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/createPlan',
                {
                    plan_mvp_name : newPlan.Plan_MVP_name,
                    plan_startdate : newPlan.Plan_startDate, 
                    plan_enddate : newPlan.Plan_endDate,
                    plan_app_acronym : newPlan.Plan_app_Acronym,
                    plan_colour : newPlan.Plan_colour.slice(1)
                },
                {
                    withCredentials : true
                }
            )
            newPlan.Plan_MVP_name = '';
            newPlan.Plan_startDate = '';
            newPlan.Plan_endDate = '';
            newPlan.Plan_colour = '';
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleNewPlanSubmitClick = async () => {
        await checkStatus();
        await checkProjectManager();
        if (user_status === 1 && isProjectManager === true) {
            await createNewPlan();
        }
        toggleShowNewPlanModal();
    }

    // let tasks = [
    //     { status: 'Open', task_name: 'Task 1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' },
    //     { status: 'Open', task_name: 'Task 2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' },
    //     { status: 'Todo', task_name: 'Task 3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' },
    //     { status: 'Doing', task_name: 'Task 4', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' },
    //     { status: 'Done', task_name: 'Task 5', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' },
    //     { status: 'Close', task_name: 'Task 6', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', owner: 'Task Owner' }
    // ];

    let tasks = [];

    const getAllPartialTaskDetails = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/getAllPartialTaskDetails',
                {
                    task_app_acronym : currentApp
                },
                {
                    withCredentials : true
                }
            );
            // console.log(response);
            tasks = response.data.value;
            // console.log(tasks);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let oneTask = {};
    let notes;

    const getFullTaskDetails = async (task_id) => {
        try {
            const response = await axios.post('http://localhost:3000/auth/getFullTaskDetails',
                {
                    task_id : task_id
                },
                {
                    withCredentials : true
                }
            )
            // console.log(response);
            oneTask = response.data.value[0];
            // console.log(oneTask);
            notes = oneTask.Task_notes.split('␟').filter(note => note.trim() !== '');
            // console.log(notes);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let showTaskModal = false;

    const toggleShowTaskModal = () => {
        showTaskModal = !showTaskModal;
    }

    const handleCloseTaskClick = async () => {
        await getAllPartialTaskDetails();
        toggleShowTaskModal();
    }
    
    const handleViewTaskClick = async (task_id) => {
        await checkStatus();
        await getFullTaskDetails(task_id);
        await checkAppPermitState();
        originalPlan = oneTask.Task_plan;
        toggleShowTaskModal();
    }

    
    let additionalNotes = "";

    const updateNotes = async () => {
        try {
            // console.log(oneTask.Task_id);
            // console.log(oneTask.Task_app_Acronym);
            // console.log(additionalNotes);
            const response = await axios.patch('http://localhost:3000/auth/updateTaskNotes',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : additionalNotes,
                    task_state : oneTask.Task_state
                },
                {
                    withCredentials : true
                }
            )

            additionalNotes = '';
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const updatePlan = async () => {
        try {
            const response = await axios.patch('http://localhost:3000/auth/updateTaskPlan',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_plan : oneTask.Task_plan
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleSaveChangesClick = async (task_id) => {
        await checkStatus();
        await updatePlan();
        if (additionalNotes) {
            await updateNotes();
            await getFullTaskDetails(task_id);
        }
        await getAllPartialTaskDetails();
        
    }
    let permittedGroup;
    const checkAppPermitState = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/checkAppPermitState',
                {
                    app_acronym : oneTask.Task_app_Acronym,
                    task_state : oneTask.Task_state
                },
                {
                    withCredentials : true
                }
            )

            // console.log(response);
            permittedGroup = response.data.result;
            // console.log(permittedGroup);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const getUserGroup = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/getUserGroup', 
                {
                    withCredentials: true
                }
            );

            for (let i = 0; i < response.data.result.length; i++) {
                usergroup.push(response.data.result[i].Group_name);
            }
            // console.log(usergroup);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleReleaseButtonClick = async () => {
        await checkStatus();
        await updatePlan();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/promoteTaskOpen2Todo',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
    }

    const handleTakeOnButtonClick = async () => {
        await checkStatus();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/promoteTaskTodo2Doing', 
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
    }

    const handleReviewButtonClick = async () => {
        await checkStatus();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/promoteTaskDoing2Done',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
        await sendEmail();
    }

    const handleGiveUpButtonClick = async () => {
        await checkStatus();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/demoteTaskDoing2Todo',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
    }

    const handleApproveButtonClick = async () => {
        await checkStatus();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/promoteTaskDone2Close',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
    }

    const handleRevertButtonClick = async () => {
        await checkStatus();
        await updatePlan();
        await updateNotes();
        await getFullTaskDetails(oneTask.Task_id);
        try {
            const response = await axios.patch('http://localhost:3000/auth/demoteTaskDone2Doing',
                {
                    task_id : oneTask.Task_id,
                    task_app_acronym : oneTask.Task_app_Acronym,
                    task_notes : oneTask.Task_notes
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
        await getFullTaskDetails(oneTask.Task_id);
        await checkAppPermitState();
        disableButtons = false;
    }

    const sendEmail = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/sendEmail',
                {
                    task_id : oneTask.Task_id,
                    task_name : oneTask.Task_name,
                },
                {
                    withCredentials : true
                }
            )
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let disableButtons = false;
    let originalPlan;
    const onChange = () => {
        // console.log(originalPlan);
        // console.log(oneTask.Task_plan);
        if (oneTask.Task_state === 'done' && originalPlan !== oneTask.Task_plan) {
            disableButtons = true;
        } else {
            disableButtons = false;
        }
    }

    let app_permit_create;
    const checkAppPermitCreate = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/checkAppPermitCreate',
                {
                    app_acronym : currentApp
                },
                {
                    withCredentials : true
                }
            )
            console.log(response);
            app_permit_create = response.data.result;
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }
</script>

<style>
    .container {
      margin: 0 auto;
      background-color: white;
    }
  
    /* Header styles */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* margin-bottom: 2rem; */
    }

    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #e0e0e0; /* Light gray background */
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        width: 100%;
    }

    .user-profile {
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;
    }

    .user-profile span {
        margin-right: 10px;
        font-size: 1.25rem;
        font-weight: bold;
    }

    .user-icon {
        width: 40px;
        height: 40px;
        margin-left: 10px;
        border-radius: 50%;
        background-color: #ccc;
    }

    .dropdown {
        display: none;
        position: absolute;
        top: 100%; /* Align dropdown below user profile */
        right: 0;
        background-color: white;
        min-width: 200px;
        box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
        padding: 10px 0;
        z-index: 1;
        border-radius: 6px;
        text-align: left;
    }

    .dropdown a, .dropdown button {
        display: block;
        padding: 12px 16px;
        color: #333;
        text-decoration: none;
        font-size: 1rem;
        font-family: 'Arial', sans-serif;
        text-align: left;
        /* width: 100%; */
        border: none;
        background: none;
        cursor: pointer;
    }

    .dropdown a:hover, .dropdown button:hover {
        background-color: #f1f1f1;
    }

    .dropdown .submit {
        width: 100%;
    }
    .dropdown a {
        color: #333; /* Change link color to black */
        text-decoration: none; /* Remove underline */
    }

    .dropdown button {
        border: none; /* Remove the button border */
        background: none; /* Remove default button styling */
    }

    .dropdown-visible {
        display: block;
    }

    .task-plan-container {
        display: flex;
        justify-content: flex-end;
        gap:5px;
    }

    .task-plan-container button {
        background-color: #007bff; /* Bootstrap's primary blue */
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .task-plan-container button:hover {
        background-color: #0056b3; /* Darker shade for hover */
    }

    .task-plan-container .view-plan {
        background-color: #007bff; /* Bootstrap's primary blue */
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .task-plan-container .view-plan:hover {
        background-color: #0056b3;
    }

    .modal {
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Overlay effect */
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border: 1px solid #ccc;
        border-radius: 10px;
        width: 100%;
        max-width: 1215px;
        height: 100%;
        max-height: 100vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
    }

    .close-btn {
        background-color: red;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .close-btn:hover {
        background-color:darkred;
    }

    .modal-body {
        margin-top: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    input[type="text"],
    textarea,
    select {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .modal-footer {
        display: flex;
        justify-content: right;
        align-items: center;
        margin-top: 1rem;
        gap:5px;
    }

    .submit-create-task-btn {
        background-color: #007bff;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .submit-create-task-btn:hover {
        background-color: #0056b3;
    }

    .name-description-container {
        display: flex;
        flex-direction: row;
        height: calc(100vh - 350px);
        gap: 5px;
    }

    .name-description-container #task-name{
        width : 40%;
        height: 5px;
    }

    .plan-notes-container {
        display: flex;
        flex-direction: row;
        height: calc(100vh - 350px);
        gap: 5px;
    }

    .plan-notes-container #task-plan {
        width : 40%;
        height: 40px;
        margin: 0;
    }

    .plan-dropdown {
        display: none;
        position: absolute;
        top: 25%;
        right: 0;
        background-color: white;
        min-width: 200px;
        box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
        padding: 10px 0;
        z-index: 1;
        border-radius: 6px;
        text-align: left;
    }

    .plan-dropdown-visible {
        display:block;
    }

    .plan-dropdown div{
        display: block;
        padding: 12px 16px;
        color: #333;
        text-decoration: none;
        font-size: 1rem;
        font-family: 'Arial', sans-serif;
        text-align: left;
        /* width: 100%; */
        border: none;
        background: none;
        cursor: pointer;
    }

    .plan-dropdown div:hover {
        background-color : #f1f1f1;
    }

    .submit-edit-plan-btn {
        background-color: #007bff;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .kanban-board {
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }

    .kanban-column {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        background-color: #f9f9f9;
        border-radius: 4px;
    }

    h3 {
        text-align: center;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }

    .task-card {
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
        background-color: white;
        border-left-width: 5px;
        border-radius: 4px;
    }

    .task-card h4 {
        margin: 0;
        font-size: 1.1em;
    }

    .task-card p {
        margin: 10px 0;
        font-size: 0.9em;
        color: #333;
    }

    .task-owner {
        font-style: italic;
        color: gray;
    }

    .task-card div {
        text-align: right;
        display: block;
        text-decoration: none;
        color: #007bff;
    }

    /* Task modal styles */
    .task-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .task-modal h3 {
        flex: 0 0 auto;
        margin: 0;
        padding: 20px;
        background-color: #fff;
    }

    .task-content {
        flex: 1 1 auto;
        display: flex;
        background-color: #fff;
        overflow: hidden; /* Prevent content overflow */
    }

    /* Task details container taking up 1/4 width */
    .task-details-container {
        flex: 0 0 20%;
        padding: 20px;
        overflow-y: auto;
        border-right: 1px solid #ccc;
        display: flex;
        flex-direction: column;
    }

    .task-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    /* Task details styling */
    .task-details p {
        display: flex;
        align-items: center;
        margin: 5px 0;
    }

    .task-details p strong {
        margin-right: 8px;
    }

    .task-details textarea { 
        height: 200px;
    }

    /* Task notes container taking up 3/4 width */
    .task-notes-container {
        flex: 1 1 80%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow: hidden;
    }

    /* Notes field styling */
    .notes-field {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        margin-bottom: 20px;
    }

    .notes-content p {
        margin: 0 0 10px 0;
        line-height: 1.5;
    }

    /* Update notes field */
    .update-notes-field textarea {
        width: 100%;
        height: 150px;
        resize: none;
        padding: 10px;
        margin-top: 10px;
    }

    /* Task actions styling */
    .task-actions {
        margin-top: auto;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .task-actions button {
        padding: 10px 20px;
        cursor: pointer;
    }
</style>

<div class="container">
     <!-- Header Section -->
    <div class="header">
        <nav class="navbar">
            <h1>Kanban ({currentApp})</h1>
            <div role="button" class="user-profile" tabindex=0
            on:mouseenter={handleMouseEnter}
            on:mouseleave={handleMouseLeave}>
                <span>{username}</span>
                <img src="https://via.placeholder.com/40" alt="user icon" class="user-icon" />
                <div class="dropdown" class:dropdown-visible={showDropdown}>
                    <div><a href='/' on:click={checkStatus}>App List</a></div>
                    <div><a href='/user_profile' on:click={checkStatus}>View/Edit Profile</a></div>
                    {#if isAdmin}
                        <div><a href='/user_management' on:click={handleUserManagementClick}>User Management</a></div>
                    {/if}
                        <div><button class="submit" on:click|preventDefault={logout} type="submit">Logout</button></div>
                </div>
            </div>
        </nav>
    </div>

    <div class="task-plan-container">
        {#if usergroup.includes(app_permit_create)}
            <button on:click={handleCreateTaskClick}>Create Task</button>
        {/if}
        {#if isProjectManager}
            <div role="button" class="view-plan" tabindex=0
            on:mouseenter={handleMouseEnterPlan}
            on:mouseleave={handleMouseLeavePlan}>
            <span>Plan</span>
                <div class="plan-dropdown" class:plan-dropdown-visible={showPlanDropdown}>
                    <div><button on:click={handleShowNewPlanModalClick}>Create New Plan</button></div>
                    {#each plans as plan}
                        <div><button on:click={() => handlePlanClick({plan})}>{plan}</button></div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    {#if showCreateTaskModal}
        <div id="createTaskModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Task</h3>
                </div>

                <div class="modal-body">
                    <form>
                        <div class="name-description-container">
                            <label for="task-name">Name:</label>
                            <input type="text" id="task-name" name="task-name" bind:value={newTask.task_name}/>

                            <label for="task-description">Description:</label>
                            <textarea id="task-description" name="task-description" bind:value={newTask.task_description}></textarea>
                        </div>
                        <div class="plan-notes-container">
                            <label for="task-plan">Plan:</label>
                            <select id="task-plan" name="task-plan" bind:value={newTask.task_plan}>
                                <option value=""></option>
                                {#each plans as plan}
                                    <option value={plan} >{plan}</option>
                                {/each}
                            </select>

                            <label for="task-notes">Notes:</label>
                            <textarea id="task-notes" name="task-notes" bind:value={newTask.task_notes}></textarea>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="close-btn" on:click|preventDefault={handleCreateTaskCloseClick}>Close</button>
                    <button type="submit" class="submit-create-task-btn" on:click|preventDefault={handleCreateTaskSubmitClick}>Create Task</button>
                </div>
            </div>
        </div>
    {/if}

    {#if showOnePlanModal}
        <div id="onePlanDetail" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Plan Details</h3>
                </div>

                <div class="modal-body">
                    <form>
                        <label for="plan-name">Name:</label>
                        <input type="text" id="plan-name" name="plan-name" bind:value={editPlanDetails.Plan_MVP_name} disabled />

                        <label for="plan-start-date">Plan Start Date:</label>
                        <input type="date" id="plan-start-date" name="plan-start-date" bind:value={editPlanDetails.Plan_startDate} />

                        <label for="plan-end-date">Plan End Date:</label>
                        <input type="date" id="plan-end-date" name="plan-end-date" bind:value={editPlanDetails.Plan_endDate} />

                        <label for="plan-colour">Plan Colour:</label>
                        <input type="color" id="plan-colour" bind:value={editPlanDetails.Plan_colour} />
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="close-btn" on:click={toggleShowOnePlanModal}>Close</button>
                    <button type="submit" class="submit-edit-plan-btn" on:click={handleUpdatePlanDetailsSubmitClick}>Update plan</button>
                </div>
            </div>
        </div>
    {/if}

    {#if showNewPlanModal}
        <div id="newPlanDetail" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Plan Details</h3>
                </div>

                <div class="modal-body">
                    <form>
                        <label for="new-plan-name">Name:</label>
                        <input type="text" id="new-plan-name" name="new-plan-name" bind:value={newPlan.Plan_MVP_name} />

                        <label for="new-plan-start-date">Plan Start Date:</label>
                        <input type="date" id="new-plan-start-date" name="new-plan-start-date" bind:value={newPlan.Plan_startDate} />

                        <label for="new-plan-end-date">Plan End Date:</label>
                        <input type="date" id="new-plan-end-date" name="new-plan-end-date" bind:value={newPlan.Plan_endDate} />

                        <!-- Fix why the colour of this popup modal is not changing-->
                        <label for="new-plan-colour" >Plan Colour:</label>
                        <input type="color" id="new-plan-colour" bind:value={newPlan.Plan_colour}/>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="close-btn" on:click={toggleShowNewPlanModal}>Close</button>
                    <button type="submit" class="submit-edit-plan-btn" on:click={handleNewPlanSubmitClick}>Create plan</button>
                </div>
            </div>
        </div>
    {/if}

    <div class="kanban-board">
        {#each ['open', 'todo', 'doing', 'done', 'close'] as status}
            <div class="kanban-column">
                <h3>{status}</h3>
                {#each tasks.filter(task => task.task_state === status) as task, index}
                    <div class="task-card {task.task_state.toLowerCase()}" style="border-left-color: #{task.plan_colour}">
                        <h4>{task.task_name}</h4>
                        <p>{task.task_description}</p>
                        <p class="task-owner">{task.task_owner}</p>
                        <div class="view-task"><button class="view-task-btn" on:click={() => handleViewTaskClick(task.task_id)}>View</button></div>
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    {#if showTaskModal}
        <div class="task-modal">
            <h3>Task Details</h3>
            <div class="task-content">
                <div class="task-details-container">
                    <div class="task-details">
                        <p><strong>ID: </strong> {oneTask.Task_id}</p>
                        <p><strong>Name: </strong> {oneTask.Task_name}</p>
                        <p><strong>Description: </strong> </p>
                        <textarea>{oneTask.Task_description}</textarea>
                        <p><strong>State: </strong> {oneTask.Task_state}</p>
                        <p><strong>Plan: </strong>
                            {#if oneTask.Task_state === 'open' || oneTask.Task_state === 'done'}
                                <select bind:value={oneTask.Task_plan} disabled={usergroup.includes(permittedGroup) ? false : true} on:change={onChange}>
                                    <option value=null></option>
                                    {#each plans as plan}
                                        {#if plan === oneTask.Task_plan}
                                            <option selected>{plan}</option>
                                        {:else}
                                            <option>{plan}</option>
                                        {/if}
                                    {/each}
                                </select>
                            {:else}
                                <select bind:value={oneTask.Task_plan} disabled>
                                    <option value=null></option>
                                    {#each plans as plan}
                                        {#if plan === oneTask.Task_plan}
                                            <option selected>{plan}</option>
                                        {:else}
                                            <option>{plan}</option>
                                        {/if}
                                    {/each}
                                </select>
                            {/if}
                        </p>
                        <p><strong>Creator: </strong> {oneTask.Task_creator}</p>
                        <p><strong>Owner: </strong> {oneTask.Task_owner} </p>
                        <p><strong>Created: </strong> {oneTask.Task_createDate}</p>
                    </div>
                </div>
                <div class="task-notes-container">
                    <div class="notes-field">
                        {#each notes as note}
                            <pre>{note}</pre>
                        {/each}
                    </div>
                    <div class="update-notes-field">
                        <textarea placeholder="Enter notes here.." bind:value={additionalNotes} disabled={usergroup.includes(permittedGroup) ? false : true}></textarea>
                    </div>
                    <div class="task-actions">
                        <button class="close" on:click={handleCloseTaskClick}>Close</button>
                        <button class="save-changes" on:click={() => handleSaveChangesClick(oneTask.Task_id)} disabled={usergroup.includes(permittedGroup) ? disableButtons : true}>Save Changes</button>
                        {#if oneTask.Task_state === 'open'}
                            <button class="release" disabled={usergroup.includes(permittedGroup) ? false : true} on:click={handleReleaseButtonClick}>Release</button>
                        {/if}
                        {#if oneTask.Task_state === 'todo'}
                            <button class="take-on" disabled={usergroup.includes(permittedGroup) ? false : true} on:click={handleTakeOnButtonClick}>Take On</button>
                        {/if}
                        {#if oneTask.Task_state === 'doing'}
                            <button class="review" disabled={usergroup.includes(permittedGroup) ? false : true} on:click={handleReviewButtonClick}>Review</button>
                            <button class="give-up" disabled={usergroup.includes(permittedGroup) ? false : true} on:click={handleGiveUpButtonClick}>Give Up</button>
                        {/if}
                        {#if oneTask.Task_state === 'done'}
                            <button class="approve" disabled={usergroup.includes(permittedGroup) ? disableButtons : true} on:click={handleApproveButtonClick}>Approve</button>
                            <button class="revert" disabled={usergroup.includes(permittedGroup) ? false : true} on:click={handleRevertButtonClick}>Revert</button>
                        {/if}
                        
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>