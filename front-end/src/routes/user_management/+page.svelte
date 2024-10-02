<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';

    let showDropdown = false
    let username = '';
    let isAdmin = false;
    let users = [];
    let user_status = 0;
    let adminUserManagementFlag = false;
    let adminCreateNewUserFlag = false;
    let adminCreateNewGroupFlag = false;
    let adminToggleModalFlag = false;
    let adminStartEditingFlag = false;
    let adminCancelEditingFlag = false;
    let adminSaveUserFlag = false;

    onMount(async () => {
        checkStatus();
        checkAdmin();
        getAllUserGroups();
        getAllUserDetails();
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
            
            // if (!isAdmin) {
            //     goto('http://localhost:5173/');
            // }
            if ((!isAdmin && adminUserManagementFlag) || 
            (!isAdmin && adminCreateNewUserFlag) || 
            (!isAdmin && adminCreateNewGroupFlag) ||
            (!isAdmin && adminToggleModalFlag) ||
            (!isAdmin && adminStartEditingFlag)) {
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

    const getAllUserDetails = async () => {
        try {
            const getAllUserDetails_response = await axios.get('http://localhost:3000/auth/getAllUsersDetails',
                {
                    withCredentials: true
                }
            );

            users = [...getAllUserDetails_response.data.val]
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

    const handleUserManagementClick = async () => {
        await checkStatus();
        adminUserManagementFlag = true;
        await checkAdmin();
    }

    let showModal = false;
    let group_name = '';

    const toggleModal = () => {
        showModal = !showModal;
    }

    const handleCreateGroupFormClose = async () => {
        toggleModal();
    }

    const createGroup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/createNewGroup', 
                {
                    group_name
                },
                {
                    withCredentials: true
                }
            )
            console.log(response);
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    let groups = [];
    const getAllUserGroups = async () => {
        try {
            groups = [];
            const response = await axios.get('http://localhost:3000/auth/getAllUserGroup',
                {
                    withCredentials: true
                }
            )
        
            groups = response.data.val.map(item => item.Group_name);
            // console.log(groups);
        } catch (error) {
            console.log(error);
        }
    }

    const handleCreateGroupClick = async () => {
        await checkStatus();
        adminCreateNewGroupFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            await createGroup();
            await getAllUserGroups();
            toggleModal();
        }
    }

    const handleToggleModalClick = async () => {
        await checkStatus();
        adminToggleModalFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            toggleModal();
        }
    }
    
    let newUser = {username: '', password: '' , active: 1, group: ''};

    const createNewUser = async () => {
        try {
            // console.log(newUser.username);
            // console.log(newUser.password);
            console.log(newUser.active);
            // console.log(newUser.group);
            const response = await axios.post('http://localhost:3000/auth/createNewUser',
                {
                    username : newUser.username,
                    password : newUser.password,
                    active : newUser.active,
                    group_id : newUser.group
                },
                {
                    withCredentials: true
                }
            )

            newUser.username = '';
            newUser.password = '';
            newUser.active = 1;
            newUser.group = '';
        } catch (error) {
            console.log(error);
            alert(error.response.data.message);
        }
    }

    const handleCreateNewUser = async () => {
        await checkStatus();
        adminCreateNewUserFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            await createNewUser();
            await getAllUserDetails();
        }
    }
    
    let updatedUser = {username: '', password: '', email: '', active: 1, group_names: []};
    
    let editingUserId = writable(null);
    function startEditing(index) {
        editingUserId.set(index);
        updatedUser.username = users[index].user_name;
        updatedUser.group_names = users[index].group_names ? users[index].group_names : "-";
    }
    const saveUser = async(user) => {
        //handle saving edited data
        let successArray = [];
        try {
            console.log(user.username);
            // console.log(user.password);
            // console.log(user.email);
            // console.log(user.active);
            console.log(user.group_names);
            if (user.password) {
                const update_password_response = await axios.patch('http://localhost:3000/auth/adminUpdateUserPassword', 
                    {
                        username : user.username,
                        password : user.password
                    }, 
                    {
                        withCredentials: true
                    }
                )
            }

            if (user.email) {
                const update_email_response = await axios.patch('http://localhost:3000/auth/adminUpdateUserEmail',
                    {
                        username : user.username,
                        email : user.email
                    },
                    {
                        withCredentials: true
                    }
                )
            }

            if (user.active) {
                const update_active_response = await axios.patch('http://localhost:3000/auth/adminUpdateUserStatus', 
                    {
                        username : user.username,
                        active : user.active
                    },
                    {
                        withCredentials: true
                    }
                )
            }

            if (user.group_names) {
                const update_group_response = await axios.patch('http://localhost:3000/auth/adminUpdateUserGroup',
                    {
                        username : user.username,
                        group_name : user.group_names
                    },
                    {
                        withCredentials: true
                    }
                )
            }
            // console.log(update_password_response.data.success);
            
        } catch (error) {
            console.log(error);
        }
        editingUserId.set(null);
        // window.location.reload();
    }

    function cancelEditing() {
        editingUserId.set(null);
    }

    const handleStartEditingClick = async (index) => {
        await checkStatus();
        adminStartEditingFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            startEditing(index);
        }
    }

    const handleCancelEditingClick = async () => {
        await checkStatus();
        adminCancelEditingFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            cancelEditing();
        }
    }

    const handleSaveUserClick = async (user) => {
        await checkStatus();
        adminSaveUserFlag = true;
        await checkAdmin();
        if (user_status === 1 && isAdmin === true) {
            await saveUser(user);
            await getAllUserDetails();
        }
    }
</script>

<style>
    .container {
      /* padding: 2rem;
      max-width: 800px; */
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

    /* Buttons */
    button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }

    .create-new-group-btn {
        background-color: #007bff;
        color: white;
        margin-bottom: 1rem;
    }

    .create-new-group-btn:hover {
        background-color: #0056b3;
    }

    .button-close {
        background-color: #dc3545;
        color: white;
        margin-right: 10px;
    }

    .button-close:hover {
        background-color: #c82333;
    }

    /* Overlay for modal */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .overlay h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .create-new-group-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .create-new-group-form input {
        padding: 0.75rem;
        font-size: 1rem;
        border-radius: 5px;
        border: 1px solid #ccc;
        width: 300px;
    }

    /*Form grid layout*/
    .create-new-user-form {
        display: flex;
        height: 50%;
        gap: 5px;
        align-items: center;
        
    }

    .create-new-user-form label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
    }

    .create-new-user-form input,
    .create-new-user-form select {
        padding: 0.75rem;
        font-size: 1rem;
        border-radius: 5px;
        border: 1px solid #ccc;
        width: 100%;
        box-sizing: border-box;
    }

    .create-new-user-btn {
        grid-column: span 2;
        justify-self: start;
        padding: 0.75rem 2rem;
    } 

    
    /* Table styling */
    .edit-user-credentials-table {
        margin-top: 2rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }

    table th,
    table td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    table th {
        background-color: #f8f8f8;
        font-weight: bold;
    }

    table td {
        font-size: 0.95rem;
    }

    table tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    table tr:hover {
        background-color: #f1f1f1;
    }

    .edit-btn,
    .save-btn,
    .cancel-btn {
        background-color: transparent;
        color: #007bff;
        border: none;
        cursor: pointer;
        text-decoration: underline;
    }

    .edit-btn:hover,
    .save-btn:hover,
    .cancel-btn:hover {
        color: #0056b3;
    }

    .save-btn {
        color: #28a745;
    }

    .save-btn:hover {
        color: #218838;
    }

    .cancel-btn {
        color: #dc3545;
    }

    .cancel-btn:hover {
        color: #c82333;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .create-new-user-form {
            grid-template-columns: 1fr;
        }
        
        .create-new-user-btn {
            width: 100%;
        }
    }

</style>

<div class="container">
    <!-- Header Section -->
    <div class="header">
        <nav class="navbar">
            <h1>User Management</h1>
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
                    <div><button class="submit" on:click={logout} type="submit">Logout</button></div>
                </div>
            </div>
        </nav>
    </div>

    <div>
        <button class="create-new-group-btn" on:click={handleToggleModalClick}>Create New Group</button>
    </div>

    <div class="create-new-group">
        {#if showModal}
            <div class="overlay">
                <h2>Create Group</h2>
                <br/>
                <div class="create-new-group-form">
                    <input type="text" placeholder="Group name" bind:value={group_name}>
                </div>
                <br/>
                <div>
                    <button class="button button-close" on:click={handleCreateGroupFormClose}>Close</button>
                    <br/>
                    <button class="button" on:click={handleCreateGroupClick}>Create Group</button>
                </div>
            </div>
        {/if}
    </div>

    <div class="create-new-user">
        <h2>Create New User</h2>

        <form class="create-new-user-form">
            <label for="username">Username:</label>
            <input id="username" bind:value={newUser.username}>
            <label for="password">Password:</label>
            <input id="password" type="password" bind:value={newUser.password}>
            <label for="active">Active:</label>
            <select id="active" bind:value={newUser.active} >
                <option value=1 selected>Yes</option>
                <option value=0>No</option>
            </select>
            <label for="group_title">Group:</label>
            <select id="group_title" bind:value={newUser.group} multiple>
                <!-- <option value="" selected></option> -->
                {#each groups as group, index}
                    <option value={index + 1} >{group}</option>>
                {/each}
            </select>
            
        </form>
        <button class="create-new-user-btn" on:click={handleCreateNewUser}>Create New User</button>
    </div>

    <div class="edit-user-credentials-table">
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Email</th>
                    <th>Active</th>
                    <th>Group</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {#each users as user, index}
                    <tr>
                        <td>{user.user_name}</td>
                        <td>
                            {#if $editingUserId === index}
                                <input type="password" bind:value={updatedUser.password} />
                            {:else}
                                **********
                            {/if}
                        </td>
                        <td>
                            {#if $editingUserId === index}
                                <input type="text" bind:value={updatedUser.email} />
                            {:else}
                                {user.email ? user.email : "-"}
                            {/if}
                        </td>
                        <td>
                            {#if $editingUserId === index}
                                <select bind:value={updatedUser.active} >
                                    <option value=1 selected>Yes</option>
                                    <option value=0>No</option>
                                </select>
                            {:else}
                                {user.active}
                            {/if}
                        </td>
                        <td>
                            {#if $editingUserId === index}
                                <select bind:value={updatedUser.group_names} multiple>
                                    {#each groups as group}
                                        <option value={group}>{group}</option>
                                    {/each}
                                </select>
                            {:else}
                                {user.group_names ? user.group_names : "-"}
                            {/if}
                        </td>
                        <td>
                            {#if $editingUserId === index}
                                <button class="save-btn" on:click={() => handleSaveUserClick(updatedUser)}>Save</button>
                                <button class="cancel-btn" on:click={() => handleCancelEditingClick()}>Cancel</button>
                            {:else}
                                <button class="edit-btn" on:click={() => handleStartEditingClick(index)}>Edit</button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>


</div>