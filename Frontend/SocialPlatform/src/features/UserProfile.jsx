import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import Navbar from './NavBar.jsx';
import {Grid} from "@mui/material";

const UserProfile = () => {
    const { user } = useContext(UserContext);

    return (
        <>
            {user && <Navbar />}
            <Grid
                container
                component="main"
                sx={{
                    height: "90vh",
                    width: "100vw",
                    overflow: "hidden",
                }}
            >
                {/* Your News Feed content goes here */}
                <h1>Profile</h1>
            </Grid>
        </>
    );
};

export default UserProfile;