<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import {onMount} from 'svelte';

    let showDropdown= false;
    let username = '';
    let isAdmin = false;
    // Sample list of apps

    let apps = [
      { name: "App_Acronym", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, some random description......", number: "<r number>" },
      { name: "App name 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, some random description......", number: "123" }
    ];

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

    onMount(async () => {

        try {
            const group_response = await axios.get('http://localhost:3000/group/getUserGroup', 
                {
                    withCredentials: true
                }
            );
            console.log(group_response);
            username = group_response.data.result[1].username;
            isAdmin = group_response.data.isAdmin;
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
</script>
  
<style>
    /* Container styles */
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
</style>
  
<div class="container">
    <!-- Header Section -->
    <div class="header">
        <a href='/'><h1>App List</h1></a>
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
                    <div><button on:click|preventDefault={logout} type="submit">Logout</button></div>
                </div>
            </div>
        </nav>
    </div>
  
    <!-- App List Section -->
    <div class="app-list">
        {#each apps as app}
            <div class="app-card">
                <h2>{app.name}</h2>
                <p>{app.description}</p>
                <div class="number">{app.number}</div>
            </div>
        {/each}
    </div>
    <br/>
    
</div>  