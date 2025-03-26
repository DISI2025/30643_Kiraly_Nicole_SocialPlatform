import React, {useContext, useState} from 'react';
import {Box, Button, Grid, Paper, TextField, Typography} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {getUserData, loginUser} from '../assets/api.jsx';
import {UserContext} from "../UserContext.jsx"; // Import the loginUser API function

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {login} = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginDTO = { email, password };
            const response = await loginUser(loginDTO);
            const { jwt } = response;
            localStorage.setItem('token', jwt);
            const user = await getUserData(jwt);
            localStorage.setItem('user', JSON.stringify(user));
            login(user, jwt);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Grid
            container
            component="main"
            sx={{
                height: "100vh",
                width: "100vw",
                overflow: "hidden"
            }}
        >
            <Grid
                item
                xs={12} md={6}
                component={Paper}
                elevation={6}
                square
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 4,
                    height: "100%"
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <strong style={{
                            marginRight: 8,
                            background: "black",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "50%"
                        }}>L</strong>
                        Login
                    </span>
                </Typography>
                {error && (
                    <Typography color="error" align="center" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                        {error}
                    </Typography>
                )}
                <Box component="form" sx={{ mt: 1, width: "70%", display:"flex",flexDirection: "column", justifyContent:"center", alignItems: "center" }} onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: "#0c2734", width:"20%" }}

                    >
                        Submit
                    </Button>
                </Box>
                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Link to="/register" style={{ textDecoration: 'none', color: '#0c2734', fontWeight: 'bold' }}>
                            Don't have an account? Register
                        </Link>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Link to="/reset-password" style={{ textDecoration: 'none', color: '#0c2734', fontWeight: 'bold' }}>
                            Forgot Password?
                        </Link>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Button
                            onClick={() => navigate('/')}
                            sx={{ color: "#0c2734", fontWeight: 'bold' }}
                        >
                            Back to Home
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            <Grid
                item
                xs={false} md={6}
                sx={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwaGFuZHN8ZW58MHx8MHx8fDA%3D')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "100%",
                }}
            />
        </Grid>
    );
};

export default Login;
