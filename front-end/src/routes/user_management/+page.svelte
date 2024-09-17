<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';

    let showDropdown = false
    let username = '';
    let isAdmin = false;
    let users = [];
    let editUser = false;

    onMount(async () => {
        
        try {
            getAllUserGroups();
            const group_response = await axios.get('http://localhost:3000/group/getUserGroup', 
                {
                    withCredentials: true
                }
            );
            // console.log(group_response);
            username = group_response.data.result[1].username;
            isAdmin = group_response.data.isAdmin;
            
            const getAllUserDetails_response = await axios.get('http://localhost:3000/users/getAllUsersDetails',
                {
                    withCredentials: true
                }
            );

            // console.log(...getAllUserDetails_response.data.val);
            users = [...getAllUserDetails_response.data.val];
            

            
        } catch (error) {
            console.log(error);
        }
    })

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

    let showModal = false;
    let group_name = '';

    const toggleModal = () => {
        showModal = !showModal;
    }

    const handleCreateGroupFormClose = () => {
        toggleModal();
        getAllUserGroups();
    }

    const createGroup = async () => {
        if (!group_name) {
            alert('Please input new group name');
        }
        console.log(group_name);
        try {
            const response = await axios.post('http://localhost:3000/group/createNewGroup', 
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
        }
    }

    
    
    let groups = [];
    const getAllUserGroups = async () => {
        try {
            groups = [];
            const response = await axios.get('http://localhost:3000/group/getAllUserGroup',
            {
                withCredentials: true
            }
        )
        // for (let i = 0; i < response.data.val.length; i++) {
            //     groups.push(response.data.val[i].Group_name);
            // }
            groups = response.data.val.map(item => item.Group_name);
            // console.log(groups);
        } catch (error) {
            console.log(error);
        }
    }
    
    let newUser = {username: '', password: '' , active: 'Yes', group: ''};

    const createNewUser = async () => {
        try {
            const response = await axios.post('http://localhost:3000/users/createNewUser',
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
            newUser.active = '';
            newUser.group = '';
        } catch (error) {
            console.log(error);
        }
    }

    const handleCreateNewUser = () => {
        createNewUser();
        window.location.reload();
    }
    const handleEditUserClick = () => {
        editUser = !editUser;
    }


</script>

<style>
    .container {
      padding: 2rem;
      max-width: 800px;
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
    }

    .dropdown {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
        padding: 12px 16px;
        z-index: 1;
    }

    .dropdown-visible {
        display: block;
    }

    .user-profile {
        display: inline-block;
        position: relative;
        cursor: pointer;
    }

    .create-new-group {
        display: flex;
        justify-content: space-between;
    }

    .create-new-group-btn {
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .create-new-group-btn:hover {
        background-color: #0056b3;
    }

    .overlay {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        z-index: 5;
    }

    .create-new-user-form {
        display: flex;
        flex-direction: column;
    }

    .create-new-group-form input {
        padding: 0.5rem;
        border-radius: 5px;
        border: 1px solid #ddd;
    }

    .create-new-user-btn {
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .create-new-user-btn:hover {
        background-color: #0056b3;
    }
</style>

<div class="container">
    <a href='/'><h1>App List</h1></a>
    <!-- Header Section -->
    <div class="header">
        <h1>User Management</h1>
        <nav class="navbar">
            <div role="button" class="user-profile" tabindex=0
            on:mouseenter={handleMouseEnter}
            on:mouseleave={handleMouseLeave}>
            {username}
            <div class="dropdown" class:dropdown-visible={showDropdown}>
                <div><a href='/user_profile'>View/Edit Profile</a></div>
                {#if isAdmin}
                <div><a href='/user_management'>User Management</a></div>
                {/if}
                <div><button on:click={logout} type="submit">Logout</button></div>
            </div>
        </div>
    </nav>
</div>

<div class="create-new-group">
    
        <button class="create-new-group-btn" on:click={toggleModal}>Create New Group</button>

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
                    <button class="button" on:click={createGroup}>Create Group</button>
                </div>
            </div>
        {/if}
    </div>

    <div class="create-new-user">
        <h2>Create New User</h2>

        <form class="create-new-user-form">
            <label for="username">Username</label>
            <input id="username" bind:value={newUser.username}>
            <label for="password">Password</label>
            <input id="password" type="password" bind:value={newUser.password}>
            <label for="active">Active</label>
            <select id="active" bind:value={newUser.active} >
                <option value=1 selected>Yes</option>
                <option value=0>No</option>
            </select>
            <label for="group_title">Group</label>
            <select id="group_title" bind:value={newUser.group} multiple>
                <option value=""></option>
                {#each groups as group, index}
                    <option value={index + 1}>{group}</option>>
                {/each}
            </select>
            
            <button class="create-new-user-btn" on:click={handleCreateNewUser}>Create New User</button>
        </form>
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
                        <td>**********</td>
                        <td>{user.email}</td>
                        <td>{user.active}</td>
                        <td>{user.group_names}</td>
                        <td>
                            
                            {#if editUser === true}
                                <button>Save</button>
                                <button on:click={handleEditUserClick}>Cancel</button>
                            {:else}
                                <button on:click={handleEditUserClick}>Edit</button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>