<script>
    import { goto, replaceState } from '$app/navigation';
    import axios from 'axios';
    import {onDestroy, onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import {appData} from '../../store.js';

    let showDropdown = false;
    let username = '';
    let isAdmin = false;
    let user_status = 0;
    let adminUserManagementFlag = false;
    let isProjectLead = false;
    let isProjectManager = false;
    let showCreateTaskModal = false;
    let projectLeadCreateTaskFlag = false;

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
        if (isProjectLead === true && projectLeadCreateTaskFlag === true) {
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
            const response = await axios.get('http://localhost:3000/auth/getAllPlanMVPName', 
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
        if (isProjectLead === true && projectLeadCreateTaskFlag === true) {
            await createTask();
            toggleCreateTaskModal();
        }
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
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let showPlanDropdown = false;
    const handleMouseEnterPlan = () => {
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
            console.log(response);
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
      margin-bottom: 2rem;
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
        top: 31%;
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
        {#if isProjectLead}
            <button on:click={handleCreateTaskClick}>Create Task</button>
        {/if}
        <div role="button" class="view-plan" tabindex=0
        on:mouseenter={handleMouseEnterPlan}
        on:mouseleave={handleMouseLeavePlan}>
        <span>Plan</span>
            <div class="plan-dropdown" class:plan-dropdown-visible={showPlanDropdown}>
                <!-- This should be where i put the create new plan button-->
                <!-- <div><a href='/'>App list</a></div> -->
                {#each plans as plan}
                    <div><button on:click={() => handlePlanClick({plan})}>{plan}</button></div>
                {/each}
            </div>
        </div>
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
                        <input type="text" id="plan-start-date" name="plan-start-date" bind:value={editPlanDetails.Plan_startDate} />

                        <label for="plan-end-date">Plan End Date:</label>
                        <input type="text" id="plan-end-date" name="plan-end-date" bind:value={editPlanDetails.Plan_endDate} />

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
</div>