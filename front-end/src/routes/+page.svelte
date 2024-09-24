<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';

    let showDropdown= false;
    let username = '';
    let isAdmin = false;
    let user_status = 0;
    let adminUserManagementFlag = false;
    // Sample list of apps
    
    onMount(async () => {
        await checkStatus();
        await checkAdmin();
        await getAllPartialAppDetails();
    })

    let apps = [];

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

    const handleMouseEnter = () => {
        showDropdown = true;
    }

    const handleMouseLeave = () => {
        showDropdown = false;
    }

    const handleUserManagementClick = async () => {
        checkStatus();
        adminUserManagementFlag = true;
        checkAdmin();
    }

    const getAllPartialAppDetails = async () => {
        try {
            const partialAppDetails_response = await axios.get('http://localhost:3000/auth/getAllPartialAppDetails',
                {
                    withCredentials : true
                }
            )
            // console.log(partialAppDetails_response);
            apps = [...partialAppDetails_response.data.result]
        } catch (error) {
            console.log(error);
        }
    }
</script>
  
<style>
    /* Container styles */
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
  
    .app-list {
      display: flex;
      gap: 1rem;
    }
  
    /* Individual app card styles */
    .app-card {
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 1rem;
      width: 300px;
      background-color: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .app-card h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
  
    .app-card p {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
  
    .app-card .number {
      font-size: 0.9rem;
      margin-bottom: 1rem;
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
  
    <!-- App List Section -->
    <div class="app-list">
        {#each apps as app}
            <div class="app-card">
                <h2>{app.App_Acronym}</h2>
                <p>{app.App_Description}</p>
                <div class="number">{app.App_rnumber}</div>
            </div>
        {/each}
    </div>
    <br/>
    
</div>  