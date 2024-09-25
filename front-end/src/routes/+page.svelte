<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import {appData} from '../store.js';
    
    let showDropdown= false;
    let username = '';
    let isAdmin = false;
    let isProjectLead = false;
    let user_status = 0;
    let adminUserManagementFlag = false;
    let showCreateAppModal = false;
    let apps = [];
    let projectLeadCreateAppFlag = false;
    let showEditAppModal = false;
    let projectLeadEditAppFlag = false;
    let projectLeadSaveEditingFlag = false;
    let projectLeadCancelEditingFlag = false;
    // Sample list of apps
    
    onMount(async () => {
        await checkStatus();
        await checkAdmin();
        await checkProjectLead();
        await getFullAppDetails();
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

    const checkProjectLead = async () => {
        try {
            const role_response = await axios.get('http://localhost:3000/auth/getUserGroup', {
                withCredentials:true
            });

            isProjectLead = role_response.data.isProjectLead;
            if (!isProjectLead && projectLeadCreateAppFlag ||
                !isProjectLead && projectLeadEditAppFlag ||
                !isProjectLead && projectLeadSaveEditingFlag || 
                !isProjectLead && projectLeadCancelEditingFlag
            ) {
                goto('http://localhost:5173/');
                alert('Do not have permission to access this resource');
            }
        } catch (error) {
            console.log(error);
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


    const getFullAppDetails = async () => {
        try {
            const appDetails_response = await axios.get('http://localhost:3000/auth/getFullAppDetails',
                {
                    withCredentials : true
                }
            )
            // console.log(partialAppDetails_response);
            apps = [...appDetails_response.data.result]
            // console.log(apps);
        } catch (error) {
            console.log(error);
        }
    }

    const toggleCreateAppModal = () => {
        showCreateAppModal = !showCreateAppModal;
    }

    const handleCreateAppModalClick = async () => {
        await checkStatus();
        projectLeadCreateAppFlag = true;
        await checkProjectLead();
        if (isProjectLead === true && projectLeadCreateAppFlag === true) {
            toggleCreateAppModal();
            await getAllUserGroups();
        }
        projectLeadCreateAppFlag = false;
    }

    let newApp = {app_acronym : '', app_description : '', app_rnumber : '', app_startDate: '', 
                  app_endDate: '', app_permit_create : '', app_permit_open:'', 
                  app_permit_todolist:'', app_permit_doing:'', app_permit_done:''};

    const createNewApp = async () => {
        try {

            // console.log('app acronym : ' + newApp.app_acronym + typeof(newApp.app_acronym));
            // console.log('app description : ' + newApp.app_description + typeof(newApp.app_description));
            // console.log('app rnumber : ' + newApp.app_rnumber + typeof(newApp.app_rnumber));
            // console.log('app start date : ' + newApp.app_startDate + typeof(newApp.app_startDate));
            // console.log('app end date : ' + newApp.app_endDate + typeof(newApp.app_endDate));
            // console.log('app permit create : ' + newApp.app_permit_create + typeof(newApp.app_permit_create));
            // console.log('app permit open : ' + newApp.app_permit_open + typeof(newApp.app_permit_open));
            // console.log('app permit todo : ' + newApp.app_permit_todo + typeof(newApp.app_permit_todo));
            // console.log('app permit doing : ' + newApp.app_permit_doing + typeof(newApp.app_permit_doing));
            // console.log('app permit done : ' + newApp.app_permit_done + typeof(newApp.app_permit_done));
            // console.log(newApp.app_startDate.split('-').reverse().join('-'));

            const response = await axios.post('http://localhost:3000/auth/createNewApp', {
                app_acronym : newApp.app_acronym,
                app_description : newApp.app_description,
                app_rnumber : parseInt(newApp.app_rnumber),
                app_startdate : newApp.app_startDate.split('-').reverse().join('-'),
                app_enddate : newApp.app_endDate.split('-').reverse().join('-'),
                app_permit_create : newApp.app_permit_create, 
                app_permit_open : newApp.app_permit_open,
                app_permit_todolist : newApp.app_permit_todolist,
                app_permit_doing : newApp.app_permit_doing,
                app_permit_done : newApp.app_permit_done
            }, {
                withCredentials: true
            });

            newApp.app_acronym = '';
            newApp.app_description ='';
            newApp.app_rnumber = '';
            newApp.app_startDate = '';
            newApp.app_endDate = '';
            newApp.app_permit_create = '';
            newApp.app_permit_open = '';
            newApp.app_permit_todolist = '';
            newApp.app_permit_doing = '';
            newApp.app_permit_done = '';
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    const handleCreateAppSubmitClick = async () => {
        await checkStatus();
        projectLeadCreateAppFlag = true;
        await checkProjectLead();
        if (isProjectLead === true && projectLeadCreateAppFlag === true) {
            await createNewApp();
        }
        projectLeadCreateAppFlag = false;
        await getFullAppDetails();
        toggleCreateAppModal();
    }

    let groups = [];
    const getAllUserGroups = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/getAllUserGroup', {
                withCredentials:true
            });

            // console.log(response);
            groups = response.data.val.map(item => item.Group_name);
        } catch (error) {
            console.log(error);
        }
    }

    const toggleEditAppModal = () => {
        showEditAppModal = !showEditAppModal;
    }

    const handleToggleEditAppModalClick = async (index) => {
        await checkStatus();
        projectLeadEditAppFlag = true;
        await checkProjectLead();
        if (isProjectLead === true && projectLeadEditAppFlag === true) {
            startEditing(index);
            toggleEditAppModal();
        }

    }

    let updatedApp = {app_acronym : '', app_rnumber : '', app_startdate : '', app_enddate : '', app_description : '',
                      app_permit_create : '', app_permit_open : '', app_permit_todolist : '', app_permit_doing : '', 
                      app_permit_done : ''};

    let editingAppId = writable(null);

    function startEditing(index) {
        editingAppId.set(index);
        // console.log(apps);
        updatedApp.app_acronym = apps[index].App_Acronym;
        updatedApp.app_rnumber = apps[index].App_Rnumber;
        updatedApp.app_startdate = apps[index].App_startDate;
        updatedApp.app_enddate = apps[index].App_endDate;
    }

    const saveApp = async () => {
        try {
            // console.log(updatedApp.app_acronym);
            // console.log(updatedApp.app_rnumber);
            // console.log(updatedApp.app_startdate);
            // console.log(updatedApp.app_enddate);
            // console.log(updatedApp.app_description);
            // console.log(updatedApp.app_permit_create);
            // console.log(updatedApp.app_permit_open);
            // console.log(updatedApp.app_permit_todolist);
            // console.log(updatedApp.app_permit_doing);
            // console.log(updatedApp.app_permit_done);

            const update_app_description_response = await axios.patch('http://localhost:3000/auth/updateApp',
                {
                    app_acronym : updatedApp.app_acronym,
                    app_description : updatedApp.app_description,
                    app_permit_create : updatedApp.app_permit_create,
                    app_permit_open : updatedApp.app_permit_open,
                    app_permit_todolist : updatedApp.app_permit_todolist,
                    app_permit_doing : updatedApp.app_permit_doing,
                    app_permit_done : updatedApp.app_permit_done
                },
                {
                    withCredentials:true
                }
            )

        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    function cancelEditApp() {
        editingAppId.set(null);
    }

    const handleSubmitEditAppClick = async () =>{
        await checkStatus();
        projectLeadSaveEditingFlag = true;
        await checkProjectLead();
        if (user_status === 1 && isProjectLead === true) {
            await saveApp();
            toggleEditAppModal();
            await getFullAppDetails();
        }
    }

    const handleCancelEditingAppClick = async () => {
        await checkStatus();
        await checkProjectLead();
        projectLeadCancelEditingFlag = true;
        cancelEditApp();
        toggleEditAppModal();
    }

    const handleViewAppClick = async (index) => {
        await checkStatus();
        appData.set(apps[index]);
    }
</script>
  
<style>
    /* Container styles */
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
  
    h1 {
      font-size: 1.5rem;
    }
  
    .app-list {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  
    /* Individual app card styles */
    .app-card {
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 1rem;
      width: 270px;
      background-color: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow 3s ease;
    }

    .app-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
  
    .app-card h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
  
    .app-card p {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .app-card .details {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .app-actions {
        display: flex;
        gap: 1rem;
    }

    .app-view {
        color: #000;
        text-decoration: none;
    }
    
    .app-edit {
        color: red;
        text-decoration: none;
    }
    
    .app-view:hover {
        color: #333;
        text-decoration: underline;
    }

    .app-edit:hover {
        color: darkred;
        text-decoration: underline;
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

    .create-app-container {
        display: flex;
        justify-content: flex-end;
    }

    .create-app-btn {
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

    .create-app-btn:hover {
        background-color: #0056b3; /* Darker shade for hover */
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
        /* margin: ; */
        padding: 2rem;
        border: 1px solid #ccc;
        border-radius: 10px;
        width: 100%;
        max-width: 1215px;
        height: 100%;
        max-height: 80vh;
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
    input[type="date"],
    select {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .date-fields {
        display: flex;
        gap: 1rem;
    }

    .date-fields label {
        flex: 1;
    }

    .date-fields input {
        width: calc(50% - 0.5rem);
    }
    
    .modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
    }

    .submit-create-app-btn {
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

    .submit-create-app-btn:hover {
        background-color: #0056b3;
    }

    .app-permit-header {
        margin : 0;
    }

    .app-permit {
        display : flex;
        grid-template-columns: auto 1fr;
        gap: 1rem;
        align-items: center;
    }

    .app-permit label { 
        font-size: 1rem;
        font-weight: 600;
        text-align: right;
        margin-right: 0.5rem;
    }

    .app-permit select {
        width: 25%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .acronym-description-container {
        display: flex;
        flex-direction: row;
        height: calc(100vh - 400px);
    }

    .acronym-description-container #app-acronym {
        width : 20%;
        height: 5px;
    }




</style>
  
<div class="container">
    <!-- Header Section -->
    <div class="header">
        <nav class="navbar">
            <h1>App List</h1>
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

    {#if isProjectLead}
        <div class="create-app-container">
            <button class="create-app-btn" on:click={handleCreateAppModalClick}>Create app</button>
        </div>
    {/if}

    {#if showCreateAppModal}
        <div id="createAppModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create App</h3>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="acronym-description-container">
                            <label for="app-acronym">Acronym: </label>
                            <input type="text" id="app-acronym" name="app-acronym" bind:value={newApp.app_acronym}/>

                            <label for="app-description">Description: </label>
                            <textarea id="app-description" name="app-description" bind:value={newApp.app_description}></textarea>
                        </div>
                        <label for="app-rnumber">R Number: </label>
                        <input type="text" id="app-rnumber" name="app-rnumber" bind:value={newApp.app_rnumber}/>

                        <div class="date-fields">
                            <label for="app-start-date">Start date: </label>
                            <input type="date" id="app-start-date" name="app-start-date" bind:value={newApp.app_startDate}/>

                            <label for="app-end-date">End date: </label>
                            <input type="date" id="app-end-date" name="app-end-date" bind:value={newApp.app_endDate}/>
                        </div>

                        <!-- <div class="app-permit-header"><h3>Permit Groups:</h3></div> -->
                        <h3 class="app-permit-header">Permit Groups:</h3>
                        <div class="app-permit">
                            <label for="create">Create:</label>
                            <select id="create" name="create" bind:value={newApp.app_permit_create}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="open">Open:</label>
                            <select id="open" name="open" bind:value={newApp.app_permit_open}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="todo">Todo:</label>
                            <select id="todo" name="todo" bind:value={newApp.app_permit_todolist}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="doing">Doing:</label>
                            <select id="doing" name="doing" bind:value={newApp.app_permit_doing}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="done">Done:</label>
                            <select id="done" name="done" bind:value={newApp.app_permit_done}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="close-btn" on:click|preventDefault={handleCreateAppModalClick}>Close</button>
                            <button type="submit" class="submit-create-app-btn" on:click|preventDefault={handleCreateAppSubmitClick}>Create App</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    {/if}
    <!-- App List Section -->
    <div class="app-list">
        {#each apps as app, index}
            <div class="app-card">
                <h2>{app.App_Acronym}</h2>
                <p>{app.App_Description}</p>
                <div class="details">
                    <div class="number">{app.App_Rnumber}</div>
                    <div class="app-actions">
                        <a href="/kanban" class="app-view" on:click={() => handleViewAppClick(index)}>View</a>
                         <!-- <button class="app-view">View</button> -->
                        {#if isProjectLead}
                            <button class="app-edit" on:click={() => handleToggleEditAppModalClick(index)}>Edit</button>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if showEditAppModal}
        <div id="editAppModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit App</h3>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="acronym-description-container">
                            <label for="app-acronym">Acronym: </label>
                            <input type="text" id="app-acronym" name="app-acronym" bind:value={updatedApp.app_acronym} disabled/>

                            <label for="app-description">Description: </label>
                            <textarea id="app-description" name="app-description" bind:value={updatedApp.app_description}></textarea>
                        </div>
                        <label for="app-rnumber">R Number: </label>
                        <input type="text" id="app-rnumber" name="app-rnumber" bind:value={updatedApp.app_rnumber} disabled/>

                        <div class="date-fields">
                            <label for="app-start-date">Start date: </label>
                            <input type="text" id="app-start-date" name="app-start-date" bind:value={updatedApp.app_startdate} disabled/>

                            <label for="app-end-date">End date: </label>
                            <input type="text" id="app-end-date" name="app-end-date" bind:value={updatedApp.app_enddate} disabled/>
                        </div>

                        <!-- <div class="app-permit-header"><h2>Permit Groups:</h2></div> -->
                         <h3 class="app-permit-header">Permit Groups:</h3>
                        <div class="app-permit">
                            <label for="create">Create:</label>
                            <select id="create" name="create" bind:value={updatedApp.app_permit_create}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="open">Open:</label>
                            <select id="open" name="open" bind:value={updatedApp.app_permit_open}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="todo">Todo:</label>
                            <select id="todo" name="todo" bind:value={updatedApp.app_permit_todolist}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="doing">Doing:</label>
                            <select id="doing" name="doing" bind:value={updatedApp.app_permit_doing}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>

                            <label for="done">Done:</label>
                            <select id="done" name="done" bind:value={updatedApp.app_permit_done}>
                                <option value=""></option>
                                {#each groups as group, index }
                                    <option value={group}>{group}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="close-btn" on:click|preventDefault={handleCancelEditingAppClick}>Close</button>
                            <button type="submit" class="submit-create-app-btn" on:click|preventDefault={handleSubmitEditAppClick}>Edit App</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    {/if}
    <br/>
</div>  