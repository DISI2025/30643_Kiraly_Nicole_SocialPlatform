import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Box, Paper, Alert } from '@mui/material';
import { resetPassword } from '../assets/api.jsx'; // Import the resetPassword API function
import { useNavigate } from 'react-router-dom';  // Import the navigate hook
import { Link } from 'react-router-dom';


const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setError("");

        try {
            const response = await resetPassword(email, newPassword);
            setMessage(response.message);
            navigate("/login");  // Redirect to login page after resetting password
        } catch (error) {
            setError("Error resetting password");
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
                        }}>R</strong>
                        Reset Password
                    </span>
                </Typography>
                {error && (
                    <Typography color="error" align="center" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                        {error}
                    </Typography>
                )}
                {message && (
                    <Typography color="success" align="center" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                        {message}
                    </Typography>
                )}
                <Box component="form" sx={{ mt: 1, width: "70%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }} onSubmit={handleSubmit}>
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
                        label="New Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: "#0c2734", width: "20%" }}
                    >
                        Reset Password
                    </Button>
                </Box>
                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#0c2734', fontWeight: 'bold' }}>
                            Back to Login
                        </Link>
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

export default ResetPassword;
