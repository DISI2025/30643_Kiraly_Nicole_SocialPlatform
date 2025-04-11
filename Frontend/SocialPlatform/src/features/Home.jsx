import React, { useContext } from 'react';
import { Button, Typography, Grid, Box, Paper, Avatar } from '@mui/material';
import {Link} from 'react-router-dom';
import { UserContext } from '../UserContext';
import Navbar from './NavBar.jsx';

const Home = () => {
    const { user } = useContext(UserContext);
    return (
        <>
        {user && <Navbar />}
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
                    xs={12}
                    md={6}
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
                    {!user &&  (
                        <Box
                            sx={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <img
                                src="/logo.png"
                                alt="Looply Logo"
                                style={{ width: 120, height: 100, marginBottom: 20 }}
                            />
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                Welcome to Looply
                            </Typography>
                            <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mb: 4, width: "80%" }}>
                                Join us today and explore amazing features. Sign up or log in to continue!
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    component={Link}
                                    to="/login"
                                    variant="contained"
                                    sx={{ backgroundColor: "#0c2734", width: "120px" }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="outlined"
                                    sx={{ borderColor: "#0c2734", color: "#0c2734", width: "120px" }}
                                >
                                    Register
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Grid>

                <Grid
                    item
                    xs={false}
                    md={6}
                    sx={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3')",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "100%",
                    }}
                />
            </Grid>
        </>
    );
};

export default Home;
