import React, { useEffect, useState } from 'react';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { getUserData, creatUser } from '../assets/api_user.jsx';  // Assuming addUser API is defined
import UserCardsList from "../components/UserCardList.jsx";
import AddUserModal from "../components/AddUserModal.jsx";
import EditUserModal from "../components/EditUserModal.jsx";
import '../components/UserAdminStyle.css';  // Import the custom CSS

const UserManagement = () => {
    const [jwt, setJwt] = useState(localStorage.getItem('token'));
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    // Fetch users when component mounts or JWT changes
    useEffect(() => {
        setJwt(localStorage.getItem('token'))
        const fetchUsers = async () => {
            if (!jwt) {
                setError('No authentication token found');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                let fetchedUsers = [];
                fetchedUsers = await getUserData(jwt);
                console.log(fetchedUsers)
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

    // Handle adding a new user
    const handleAddUser = async (userData) => {
        if (!jwt) {
            setError('Authentication required');
            return;
        }

        try {
            const addedUser = await creatUser(jwt, userData);
            if (addedUser) {
                setUsers([...users, addedUser]);
                setIsAddModalOpen(false);
                // Reset form
                setNewUser({
                    image: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    role: 'user',
                });
            }
        } catch (err) {
            setError('Failed to add user');
        }
    };

    // Handle updating a user
    const handleUpdateUser = async () => {
        if (!jwt || !selectedUser) {
            setError('Authentication or user selection required');
            return;
        }

        try {
            const updatedUser = await updateUser(jwt, selectedUser.id, selectedUser);
            if (updatedUser) {
                setUsers(users.map(u =>
                    u.id === selectedUser.id ? updatedUser : u
                ));
                setSelectedUser(null);
            }
        } catch (err) {
            setError('Failed to update user');
        }
    };

    // Handle deleting a user
    const handleDeleteUser = async (userId) => {
        if (!jwt) {
            setError('Authentication required');
            return;
        }

        try {
            const isDeleted = await deleteUser(jwt, userId);
            if (isDeleted) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="error-message">
                <strong>Error: </strong>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="user-management-header">
                <h2>User Management</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="add-user-btn"
                >
                    <PlusCircle className="icon" />
                    Add User
                </button>
            </div>

            {/* User Cards */}
            <UserCardsList setSelectedUser={setSelectedUser} users={users} />

            {/* Modals */}
            {isAddModalOpen &&
                <AddUserModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddUser}
                    userData={newUser}
                    setUserData={setNewUser}
                />
            }
            {selectedUser && <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
};

export default UserManagement;
