import React, { useState } from "react";

const EditUserModal = ({ user, onClose }) => {
    const [updatedUser, setUpdatedUser] = useState(user);

    const handleUpdateUser = () => {
        console.log("Updated user:", updatedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-xl font-semibold mb-4">Edit User</h3>
                <input type="text" placeholder="Username" value={updatedUser.username}
                       onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })} className="w-full p-2 border rounded" />
                <input type="email" placeholder="Email" value={updatedUser.email}
                       onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })} className="w-full p-2 border rounded" />
                <button onClick={handleUpdateUser} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Update User
                </button>
                <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditUserModal;
