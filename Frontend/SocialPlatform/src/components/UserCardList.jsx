import React from "react";
import UserCard from "./UserCard.jsx";
import './UserAdminStyle.css';  // Importing the custom CSS for styling

const UserCardList = ({ setSelectedUser, users }) => {
    return (
        <div className="user-card-list">
            {users.length > 0 ? (
                users.map(user => (
                    <UserCard key={user.id} user={user} setSelectedUser={setSelectedUser} />
                ))
            ) : (
                <p className="no-users-message">No users found</p>
            )}
        </div>
    );
};

export default UserCardList;
