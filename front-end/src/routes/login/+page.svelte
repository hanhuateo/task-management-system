<script>
    import axios from 'axios';
    import { goto } from '$app/navigation';

    let username = '';
    let password = '';
    let is_successful;
    let showPopup = false;

    const login = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                username,
                password
            }, {withCredentials: true});
            // console.log(response);
            is_successful = response.data.success;
            // console.log(is_successful);
            if (is_successful) {
                showPopup = false;
                goto('http://localhost:5173/');
            }   
        } catch (error) {
            console.log(error);
            alert('Invalid credentials');
        }
    }
</script>

<style>
    form {
        max-width: 300px;
        margin: auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 10px;
        background: #f9f9f9;
    }
    input {
        width: 92%;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
    }
    button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
    }

    h2 {
        text-align: center;
    }
</style>

<h2>Login</h2>

<form on:submit|preventDefault={login}>
    <input type="text" placeholder="Username" bind:value={username}  />

    <input type="password" placeholder="Password" bind:value={password}  />

    <button type="submit">Login</button>

</form>