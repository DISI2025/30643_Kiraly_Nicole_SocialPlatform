import React, { useContext, useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Avatar,
    Box,
    TextField,
    MenuItem,
    Menu,
    InputAdornment,
    Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getUserData } from '../assets/api-profile.jsx';
import { SearchIcon } from "lucide-react";
import { Bell } from 'lucide-react';
import { getPendingFriendRequests } from '../assets/api-profile';
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [requestsAnchorEl, setRequestsAnchorEl] = useState(null);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const users = await getUserData(token);
                console.log("All users from API:", users);
                setAllUsers(users || []);
            } catch (error) {
                console.error('Failed to fetch users:', error.message);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const requests = await getPendingFriendRequests();
                setFriendRequests(requests);
            } catch (err) {
                console.error("Error fetching friend requests:", err);
            }
        };

        fetchFriendRequests();
    }, []);


    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const handleChatClick = () => {
        navigate('/chat');
    };
    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const filtered = allUsers.filter(u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().startsWith(query.toLowerCase())
            );
            setSearchResults(filtered);
            setAnchorEl(event.currentTarget);
        } else {
            setSearchResults([]);
            setAnchorEl(null);


        }
    };

    const handleResultClick = (userId) => {
        if (user.id === userId) {
            // Dacă user.id este egal cu userId, navighează pe profilul utilizatorului logat
            navigate('/profile');
        } else {
            // Dacă nu, navighează la profilul altui utilizator
            navigate(`/another-profile?user=${userId}`);
        }
        setSearchQuery('');
        setSearchResults([]);
        setAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                        to="/news-feed"
                        sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                    >
                        Looply
                    </Typography>

                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, paddingLeft: 10 }}>
                            <TextField
                                value={searchQuery}
                                onChange={handleSearchChange}
                                variant="outlined"
                                size="small"
                                placeholder="Search users..."
                                fullWidth
                                sx={{
                                    width: 500,
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#0c2734' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && searchResults.length > 0}
                                onClose={handleMenuClose}
                                sx={{ mt: 1, maxHeight: 300, overflowY: 'auto' }}
                            >
                                {searchResults.map((u) => (
                                    <Box key={u.id}>
                                        <MenuItem
                                            onClick={() => handleResultClick(u.id)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                padding: '10px 15px',
                                                '&:hover': {
                                                    backgroundColor: '#f0f0f0',
                                                    cursor: 'pointer',
                                                }
                                            }}
                                        >
                                            <Avatar src={u.image || '/default-avatar.png'} sx={{ width: 40, height: 40 }} />
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body1">{u.firstName} {u.lastName}</Typography>
                                                <Typography variant="body2" color="textSecondary">{u.email}</Typography>
                                            </Box>
                                        </MenuItem>
                                        <Divider sx={{ my: 1 }} />
                                    </Box>
                                ))}
                            </Menu>
                        </Box>
                    )}
                </Box>



                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <Avatar
                                src={user.image || '/default-avatar.png'}
                                alt={user.firstName}
                                sx={{ width: 36, height: 36 }}
                            />
                            <Typography variant="body1" sx={{ marginLeft: 1, color: 'inherit' }}>
                                {user.firstName} {user.lastName}
                            </Typography>
                        </Link>
                        {/* Butonul nou pentru chat */}
                        <Button
                            onClick={handleChatClick}
                            variant="text"
                            size="small"
                            startIcon={<MessageCircle size={18} />}
                            sx={{
                                color: '#0c2734',
                                '&:hover': {
                                    backgroundColor: 'rgba(12, 39, 52, 0.1)'
                                }
                            }}
                        >
                            Chat
                        </Button>
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

                {user && (
                    <>
                        <Button
                            onClick={(e) => setRequestsAnchorEl(e.currentTarget)}
                            sx={{ minWidth: 'auto', color: '#0c2734', position: 'relative' }}
                        >
                            <Bell size={22} />
                            {friendRequests.length > 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor: 'red',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 16,
                                        height: 16,
                                        fontSize: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {friendRequests.length}
                                </Box>
                            )}
                        </Button>

                        <Menu
                            anchorEl={requestsAnchorEl}
                            open={Boolean(requestsAnchorEl)}
                            onClose={() => setRequestsAnchorEl(null)}
                            PaperProps={{ style: { width: 300, maxHeight: 400 } }}
                        >
                            {friendRequests.length === 0 ? (
                                <MenuItem disabled>No pending requests</MenuItem>
                            ) : (
                                friendRequests.map((req) => (
                                    <MenuItem
                                        key={req.id}
                                        onClick={() => {
                                            navigate(`/another-profile?user=${req.id}`);
                                            setRequestsAnchorEl(null);
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            padding: '10px 15px',
                                            '&:hover': { backgroundColor: '#f0f0f0' }
                                        }}
                                    >
                                        <Avatar src={req.image || '/default-avatar.png'} />
                                        <Box>
                                            <Typography variant="body1">{req.firstName} {req.lastName}</Typography>
                                            <Typography variant="body2" color="text.secondary">{req.email}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
