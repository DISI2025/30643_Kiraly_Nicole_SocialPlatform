import React from 'react';
import './UserAdminStyle.css';  // Importing the custom CSS for styling

const UserCard = ({ user, setSelectedUser, handleDeleteUser, setIsUpdateModalOpen }) => {
    const userLogged = localStorage.getItem("user");
    const userRole = JSON.parse(userLogged).role; // Accessing user role from localStorage

    const handleEditClick = () => {
        setSelectedUser(user); // Set selected user for editing
        setIsUpdateModalOpen(true); // Trigger modal open in parent component
    };

    const handleDelete = (userId) => {
        handleDeleteUser(userId);
    };

    return (
        <div className="user-card">
            <div className="user-card-content">
                {/* Profile Picture */}
                <img
                    src={user.image || "default-avatar.png"}
                    alt="User"
                    className="user-avatar"
                />
                <div className="user-details">
                    {/* Name & Role */}
                    <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                    <p className="user-email">{user.email}</p>
                    <span className={`status-badge ${user.role === 'ADMIN' ? 'admin' : 'client'}`}>
                        {user.status}
                    </span>
                </div>
            </div>

            {/* Action Buttons (only for ADMIN role) */}
            {userRole === "ADMIN" && (
                <div className="action-buttons">
                    <button onClick={handleEditClick} className="edit-button">
                        Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="delete-button">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserCard;
