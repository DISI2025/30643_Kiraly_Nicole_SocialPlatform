import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './features/Login.jsx';
import Register from './features/Register.jsx';
import Home from "./features/Home.jsx";
import ResetPassword from "./features/ResetPassword.jsx";
import {UserProvider} from "./UserContext.jsx";
import UserManagement from "./features/AdminUsers.jsx";

function App() {
    return (
        <UserProvider>
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/user" element={<UserManagement />} />
                </Routes>
            </div>
        </Router>
        </UserProvider>
    );
}

export default App;
