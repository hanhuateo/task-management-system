<script>
    // Simulating current user data
    let user = {
      username: 'admin',
      email: 'admin@gmail.com'
    };
  
    // State to manage new email and password inputs
    let newEmail = user.email;
    let newPassword = '';
  
    // Function to handle email update
    function updateEmail() {
        if (newEmail !== user.email) {
            user.email = newEmail;
            alert('Email updated successfully!');
        } else {
            alert('Please provide a new email.');
        }
    }
  
    // Function to handle password update
    function updatePassword() {
        if (newPassword) {
            alert('Password updated successfully!');
            newPassword = ''; // Reset password field
        } else {
            alert('Please enter a new password.');
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
  
</style>
  
<div class="container">
    <h2>User profile</h2>
  
    <!-- User Details Section -->
    <div class="user-details">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
    </div>
  
    <!-- Update Email Section -->
    <div class="form-section">
        <label for="email">Update Email</label>
        <input type="email" id="email" bind:value={newEmail} placeholder="New email" />
        <button on:click={updateEmail}>Update email</button>
    </div>
  
    <!-- Change Password Section -->
    <div class="form-section">
        <label for="password">Change password</label>
        <input type="password" id="password" bind:value={newPassword} placeholder="New Password" />
        <button on:click={updatePassword}>Change password</button>
    </div>
</div>  