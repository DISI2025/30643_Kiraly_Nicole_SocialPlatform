import React, {useEffect, useState} from 'react';
import {PlusCircle} from 'lucide-react';
import {createUser, deleteUser, getUserData, updateUser} from '../assets/api-profile.jsx';
import UserCardsList from "../components/UserCardList.jsx";
import AddUserModal from "../components/AddUserModal.jsx";
import EditUserModal from "../components/EditUserModal.jsx";
import '../components/UserAdminStyle.css';
import Navbar from "./NavBar.jsx"; // Import the custom CSS

const UserManagement = () => {
    const [jwt, setJwt] = useState(localStorage.getItem('token'));
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Add User modal state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Update User modal state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        image: '',
        role: 'user',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            if (!jwt) {
                setError('No authentication token found');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const fetchedUsers = await getUserData(jwt);
                setUsers(fetchedUsers);
                setError(null);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [jwt]);

    const handleAddUser = async (userData) => {
        if (!jwt) {
            setError('Authentication required');
            return;
        }

        try {
            const addedUser = await createUser(jwt, userData);
            if (addedUser) {
                setUsers([...users, addedUser]);
                setIsAddModalOpen(false);
                setNewUser({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    image: '',
                    role: 'user',
                });
            }
        } catch (err) {
            setError('Failed to add user');
        }
    };

    const handleUpdateUser = async (userData) => {
        if (!jwt || !selectedUser) {
            setError('Authentication or user selection required');
            return;
        }

        try {
            userData.id = selectedUser.id;
            console.log(userData);
            const updatedUser = await updateUser(selectedUser.id, userData);
            if (updatedUser) {
                setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
                setIsUpdateModalOpen(false); // Close modal after updating
                setSelectedUser(null);
            }
        } catch (err) {
            setError('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!jwt) {
            setError('Authentication required');
            return;
        }

        try {
            const isDeleted = await deleteUser(userId);
            if (isDeleted) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    // Ensure modals show when needed
    const handleModalClose = () => {
        setIsUpdateModalOpen(false);
        setSelectedUser(null); // Close the modal and reset the selected user
    };

    if (isLoading) {
        return <div className="loading-spinner">
            <div className="spinner"></div>
        </div>;
    }

    if (error) {
        return <div className="error-message"><strong>Error: </strong><span>{error}</span></div>;
    }

    return (
        <>
            <Navbar/>
            <div className="user-management">
                <div className="user-management-header">
                    <h2>User Management</h2>
                    <button onClick={() => setIsAddModalOpen(true)} className="add-user-btn">
                        <PlusCircle className="icon"/>
                        Add User
                    </button>
                </div>

                {/* User Cards List */}
                <UserCardsList
                    setSelectedUser={setSelectedUser}
                    users={users}
                    handleUpdateUser={handleUpdateUser}
                    handleDeleteUser={handleDeleteUser}
                    setIsUpdateModalOpen={setIsUpdateModalOpen} // Pass modal state to card component
                />

                {/* Modals */}
                {isAddModalOpen && (
                    <AddUserModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSubmit={handleAddUser}
                        userData={newUser}
                        setUserData={setNewUser}
                    />
                )}

                {/* Update User Modal */}
                {isUpdateModalOpen && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        onClose={handleModalClose}
                        onSubmit={handleUpdateUser}
                    />
                )}
            </div>
        </>
    );
};

export default UserManagement;
