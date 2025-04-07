import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import Navbar from './NavBar.jsx';
import {Grid} from "@mui/material";

const NewsFeed = () => {
    const { user } = useContext(UserContext);

    return (
        <>
            {user && <Navbar />} {/* Render Navbar only if user is logged in */}
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
                <h1>News Feed</h1>
            </Grid>
        </>
    );
};

export default NewsFeed;
