<script>
    // Sample user data
    let users = [
      { username: 'Username1', password: 'xxxxxxxx', email: 'email1@test.com', active: 'Yes', group: 'Project Lead' },
      { username: 'Username2', password: 'xxxxxxxx', email: 'email2@test.com', active: 'Yes', group: 'Developer' },
      { username: 'Username3', password: 'xxxxxxxx', email: 'email3@test.com', active: 'Yes', group: 'Project Manager' },
      { username: 'Username4', password: 'xxxxxxxx', email: 'email4@test.com', active: 'Yes', group: 'Project Manager' },
      { username: 'Username5', password: 'xxxxxxxx', email: 'email5@test.com', active: 'Yes', group: 'Project Lead' }
    ];
  
    // State to manage new user creation
    let newUser = { username: '', password: '', email: '', active: 'Yes', group: '' };
  
    // State to manage editing
    let editingIndex = null;  // Keeps track of which user is being edited
  
    // Function to add a new user
    function addUser() {
      if (newUser.username && newUser.password && newUser.email && newUser.group) {
        users = [...users, { ...newUser }];
        newUser = { username: '', password: '', email: '', active: 'Yes', group: '' }; // reset form
      }
    }
  
    // Function to edit a user
    function editUser(index) {
      editingIndex = index;  // Set the index of the user being edited
    }
  
    // Function to save the edited user
    function saveUser(index) {
      editingIndex = null;  // Reset the editing state
    }
  
    // Function to cancel editing
    function cancelEdit() {
      editingIndex = null;  // Reset the editing state
    }

    import popup from './createGroupPopup.svelte'; // Import the popup component

    let showModal = false;

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
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
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    table th, table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .actions {
      color: red;
      cursor: pointer;
    }
    .form-row input, .form-row select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
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
    .btn.cancel {
      background-color: red;
    }
    .btn:hover {
      background-color: #0056b3;
    }
  </style>
  
  <div class="container">
    <h2>User Management</h2>
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
          {#if editingIndex === index}
            <!-- Render editable form in place of the current row -->
            <tr>
              <td>{user.username}</td>
              <td><input type="password" bind:value={user.password} placeholder="Password" /></td>
              <td><input type="email" bind:value={user.email} placeholder="Email" /></td>
              <td>
                <select bind:value={user.active}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select bind:value={user.group}>
                  <option value="Project Lead">Project Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </td>
              <td>
                <button class="btn" on:click={() => saveUser(index)}>Save</button>
                <button class="btn cancel" on:click={cancelEdit}>Cancel</button>
              </td>
            </tr>
          {:else}
            <!-- Regular row when not editing -->
            <tr>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>{user.email}</td>
              <td>{user.active}</td>
              <td>{user.group}</td>
              <td>
                <span class="actions" on:click={() => editUser(index)}>Edit</span>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  
    <!-- Create New User Form -->
    <h3>Create New User</h3>
    <div class="form-row">
      <input type="text" bind:value={newUser.username} placeholder="Username" />
      <input type="password" bind:value={newUser.password} placeholder="Password" />
      <input type="email" bind:value={newUser.email} placeholder="Email" />
      <select bind:value={newUser.active}>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      <input type="text" bind:value={newUser.group} placeholder="Group" />
      <button class="btn" on:click={addUser}>Create User</button>
    </div>
  </div>
  