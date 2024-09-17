<script>
    import axios from 'axios';
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation';

    let email = '';
    let password = '';
    let current_email = '';
    let is_successful = false;
    let username = '';
    let email_message = '';
    let password_message = '';
    let showDropdown= false;
    let isAdmin = false;
    // let active = 0;

    onMount(async () => {

        try {
            const response = await axios.get('http://localhost:3000/users/getUserDetails',
            {
                withCredentials: true
            });

            current_email = response.data.val[0].email;
            username = response.data.val[0].user_name;

            const group_response = await axios.get('http://localhost:3000/group/getUserGroup', 
                {
                    withCredentials: true
                }
            );
            
            isAdmin = group_response.data.isAdmin;
            // console.log(current_email);
        } catch (error) {
            console.log(error);
        }
    })

    const updateEmail = async () => {
        try {
            const response = await axios.patch('http://localhost:3000/users/updateUserEmail', 
            {
                username, 
                email
            }, 
            {
                withCredentials: true
            });
            // console.log(response);
            is_successful = response.data.success;
        } catch (error) {
            alert(error.response.data.message);
            console.log(error);
        }

        if (is_successful) {
            window.location.reload();
        }
    }

    const updatePassword = async () => {
        try {
            const response = await axios.patch('http://localhost:3000/users/updateUserPassword', 
                {
                    username,
                    password
                }, 
                {
                    withCredentials: true
                }
            );
            is_successful = response.data.success;
        } catch (error) {
            alert(error.response.data.message)
            console.log(error);
        }

        if (is_successful) {
            window.location.reload();
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
            console.log(response);
            goto('http://localhost:5173/login');
        } catch (error) {
            console.log(error);
        }
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

    /* User details section */
    .user-details {
        margin-bottom: 2rem;
    }

    .user-details p {
        font-size: 1rem;
        color: #333;
        margin: 0.5rem 0;
    }

    .user-details strong {
        font-weight: 600;
    }

    /* Section titles */
    .form-section {
        margin-bottom: 2rem;
    }

    .form-section label {
        display: block;
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #333;
    }

    /* Input fields */
    input[type="email"], input[type="password"] {
        width: 100%;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    /* Buttons */
    button {
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }

    /* For larger screens */
    @media (min-width: 768px) {

        input[type="email"], input[type="password"] {
            max-width: 400px;
        }

        button {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
        }
    }
</style>
  
<div class="container">
    <div class="header">
        <nav class="navbar">
            <h1>User Profile</h1>
            <div role="button" class="user-profile" tabindex=0
            on:mouseenter={handleMouseEnter}
            on:mouseleave={handleMouseLeave}>
                <span>{username}</span>
                <img src="https://via.placeholder.com/40" alt="user icon" class="user-icon" />
                <div class="dropdown" class:dropdown-visible={showDropdown}>
                    <div><a href='/user_profile'>View/Edit Profile</a></div>
                    {#if isAdmin}
                        <div><a href='/user_management'>User Management</a></div>
                    {/if}
                    <div><button class="submit" on:click|preventDefault={logout} type="submit">Logout</button></div>
                </div>
            </div>
        </nav>
    </div>


    <!-- User Details Section -->
    <div class="user-details">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Email:</strong> {current_email}</p>
    </div>
  
    <!-- Update Email Section -->
    <div class="form-section">
        <label for="email">Update Email</label>
        <input type="email" id="email" bind:value={email } placeholder="New email" />
        <button on:click={updateEmail}>Update email</button>
    </div>

    <!-- Change Password Section -->
    <div class="form-section">
        <label for="password">Change password</label>
        <input type="password" id="password" bind:value={password} placeholder="New Password" />
        <button on:click={updatePassword}>Change password</button>
    </div>
</div>  