<script>
    import { goto, replaceState } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import {appData} from '../../store.js';

    let showDropdown = false;
    let username = '';
    let isAdmin = false;
    let user_status = 0;
    let adminUserManagementFlag = false;
    let isProjectLead = false;
    let isProjectManager = false;

    let currentApp;

    
    onMount(async () => {
        await checkStatus();
        await checkAdmin();
        await checkProjectLead();
        await checkProjectManager();
        appData.subscribe(value => {
            currentApp = value;
        });
        console.log(currentApp);
        checkCurrentApp();
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
        <button>Create Task</button>
        <!-- <div role="button" class="view-plan" tabindex=0
        on:mouseenter={}
        on:mouseleave={}>

        </div> -->
    </div>


</div>