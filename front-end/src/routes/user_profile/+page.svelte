<script>
    import axios from 'axios';
    import {onMount} from 'svelte';

    let email = '';
    let password = '';
    let current_email = '';
    let is_successful = false;
    let username = '';
    let email_message = '';
    let password_message = '';

    onMount(async () => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            username = storedUsername;
        } 

        try {
            const response = await axios.post('http://localhost:3000/users/getUserDetails', {
                username
            }, 
            {
                withCredentials: true
            });
            // console.log(response);
            current_email = response.data.val[0].email;
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
            if (!is_successful) {
                email_message = response.data.message;
                console.error(email_message);
            }
        } catch (error) {
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
            if (!is_successful) {
                password_message = response.data.message;
                console.log(password_message);
            }
        } catch (error) {
            console.log(error);
        }

        if (is_successful) {
            window.location.reload();
        }
    }
</script>
  
<style>
    /* Basic styles similar to the design */
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    h2 {
        margin-bottom: 1.5rem;
    }
  
    .user-details, .form-section {
        margin-bottom: 2rem;
    }
  
    label {
        font-weight: bold;
    }
  
    input {
        width: 100%;
        padding: 0.75rem;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
  
    button {
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
  
    button:hover {
        background-color: #0056b3;
    }
  
    .navbar {
        display: flex;
        justify-content: space-between;
    }
</style>
  
<div class="container">
    <nav class="navbar">
        <h2>User profile</h2>
        <div class="user-profile">{username}</div>
    </nav>
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