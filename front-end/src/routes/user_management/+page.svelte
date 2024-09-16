<script>
    import {goto} from '$app/navigation';
    import {onMount} from 'svelte';
    import axios from 'axios';
    
    let username = '';
    let showDropdown = false;

    onMount(async () => {

        try {
            const user_response = await axios.get('http://localhost:3000/users/getUserDetails',
            {
                withCredentials: true
            });
            const all_user_response = await axios.get('http://localhost:3000/users/getAllUsersDetails');
            console.log(all_user_response);
            username = user_response.data.val[0].user_name;
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
            console.log(response);
            goto('http://localhost:5173/login');
        } catch (error) {
            console.log(error);
        }
    }
</script>
  
<style>
    /* Add styles similar to the design you showed */
    .container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 5px;
    }

    .btn:hover {
      background-color: #0056b3;
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
    <div class="header">
        <a href = '/'><h1>App List</h1></a>
        <nav class="navbar">
            <div role="button" class="user-profile" tabindex=0
                on:mouseenter={handleMouseEnter}
                on:mouseleave={handleMouseLeave}>
                    {username}
                <div class="dropdown" class:dropdown-visible={showDropdown}>
                    <div><a href='/user_profile'>View/Edit Profile</a></div>
                    <div><a href='/user_management'>User Management</a></div>
                    <div><button on:click|preventDefault={logout} type="submit">Logout</button></div>
                </div>
            </div>
        </nav>
    </div>

    <div>
        <button class="create btn">Create New Group</button>
    </div>

</div>