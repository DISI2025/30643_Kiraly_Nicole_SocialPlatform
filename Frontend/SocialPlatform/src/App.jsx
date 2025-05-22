import React, {useEffect} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Login from './features/Login.jsx';
import Register from './features/Register.jsx';
import Home from "./features/Home.jsx";
import ResetPassword from "./features/ResetPassword.jsx";
import NewsFeed from "./features/NewsFeed.jsx";
import ProfileManagement from "./features/ProfileManagement.jsx";
import {UserProvider} from "./UserContext.jsx";
import UserManagement from "./features/AdminUsers.jsx";
import UserProfile from "./features/UserProfile.jsx";
import AnotherProfile from "./features/AnotherProfile.jsx";
import Chat from "./features/Chat.jsx";
const AdminRoute = () => {
    const storedUser = localStorage.getItem("user"); // Get user role from session storage
    const user = JSON.parse(storedUser);
    if (user.role !== 'ADMIN') {
        return <Navigate to="/" replace />; // Redirect to Home or any other page if not admin
    }
    return <UserManagement/>;
};

function App() {
    useEffect(() => {
        // Doar pentru testare - setează manual un user ID
        localStorage.setItem("selectedUserId","22857f8e-44bc-4f20-a806-25587d219f7a"); // Exemplu: "661c1a6ee4b59c26ee7a8b47"
    }, []);
    return (
        <UserProvider>
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/user" element={<AdminRoute />} />
                    <Route path="/news-feed" element={<NewsFeed />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/management-profile" element={<ProfileManagement />} />
                    <Route path="/another-profile" element={<AnotherProfile key={location.key}/>} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </div>
        </Router>
        </UserProvider>
    );
}

export default App;
