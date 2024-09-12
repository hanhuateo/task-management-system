<script>
    import axios from 'axios';
    let username = '';
    let password = '';
    let message = '';

    const login = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/login');
            message = response.data.message;
        } catch (err) {
            console.log(err);
        }
    }
</script>

<form on:submit|preventDefault={login}>
    <label for="username">Username</label><br />
    <input bind:value={username} id="username" name="username" placeholder="Username"/>
    <br /><br />

    <label for="password">Password</label><br />
    <input bind:value={password} id="password" name="password" placeholder="password"/>
</form>