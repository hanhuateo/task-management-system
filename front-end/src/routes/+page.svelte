<script>
  import { goto } from '$app/navigation';
    import axios from 'axios';
    // Sample list of apps
    let apps = [
      { name: "App_Acronym", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, some random description......", number: "<r number>" },
      { name: "App name 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, some random description......", number: "123" }
    ];
  
    let userName = "user_name"; // Placeholder for user name, you can replace it dynamically.

    const logout = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/logout');
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
  
    h1 {
      font-size: 1.5rem;
    }
  
    .user-info {
      display: flex;
      align-items: center;
      font-size: 1.1rem;
    }
  
    .user-info span {
      margin-right: 0.5rem;
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
  
    /* User icon styles */
    .user-icon {
      width: 30px;
      height: 30px;
      background-color: #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
</style>
  
<div class="container">
    <!-- Header Section -->
    <div class="header">
        <h1>App List</h1>
        <div class="user-info">
            <span>{userName}</span>
            <div class="user-icon">👤</div>
        </div>
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
    <button on:click|preventDefault={logout} type="submit">Logout</button>
</div>  