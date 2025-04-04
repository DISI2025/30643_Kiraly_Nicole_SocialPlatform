import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const Navbar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                backgroundColor: '#E8E8E8',
                color: '#0c2734',
                px: 3,
                width: '100%',
                top: 0,
                zIndex: 1200
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="Looply Logo"
                        style={{ width: 70, height: 50, marginRight: 10 }}
                    />
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/feed"
                        sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                    >
                        Looply
                    </Typography>
                </Box>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Link to="/userProfile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <Avatar
                                src={user.image || '/default-avatar.png'}
                                alt={user.firstName}
                                sx={{ width: 36, height: 36 }}
                            />
                            <Typography variant="body1" sx={{ marginLeft: 1, color: 'inherit' }}>
                                {user.firstName} {user.lastName}
                            </Typography>
                        </Link>

                        <Button
                            onClick={handleLogout}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: '#0c2734', color: '#0c2734' }}
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
