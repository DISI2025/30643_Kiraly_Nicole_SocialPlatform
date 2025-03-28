import React, { useState, useEffect } from 'react';
import styles from "./UserAdminStyle.css";  // Import your styles

const EditUserModal = ({ user, onClose, onSubmit }) => {
    const [editedUser, setEditedUser] = useState(user); // Local state to hold changes

    useEffect(() => {
        setEditedUser(user); // Reset to initial user when `user` prop changes
    }, [user]);

    const [errors, setErrors] = useState({});

    // Handle input change for each field
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate form inputs
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!editedUser.firstName || editedUser.firstName.trim() === '') {
            newErrors.firstName = 'First Name is required';
        }

        // Last Name validation
        if (!editedUser.lastName || editedUser.lastName.trim() === '') {
            newErrors.lastName = 'Last Name is required';
        }

        // Password validation
        if (!editedUser.password || editedUser.password.length < 5) {
            newErrors.password = 'Invalid Password [minimum length : 5]';
        }

        // Image validation
        if (!editedUser.image || editedUser.image.length > 254) {
            newErrors.image = 'Image URL is too large';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!editedUser.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(editedUser.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Role validation
        if (!editedUser.role) {
            newErrors.role = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(editedUser); // Submit updated user
            onClose(); // Close the modal
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-header">Edit User</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={editedUser.firstName || ''}
                            onChange={handleInputChange}
                            className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                        />
                        {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={editedUser.lastName || ''}
                            onChange={handleInputChange}
                            className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                        />
                        {errors.lastName && <p className="error-message">{errors.lastName}</p>}
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editedUser.email || ''}
                            onChange={handleInputChange}
                            className={`input-field ${errors.email ? 'input-error' : ''}`}
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={editedUser.password || ''}
                            onChange={handleInputChange}
                            className={`input-field ${errors.password ? 'input-error' : ''}`}
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <select
                            name="role"
                            value={editedUser.role}
                            onChange={handleInputChange}
                            className="input-field"
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="image"
                            placeholder="Image URL"
                            value={editedUser.image || ''}
                            onChange={handleInputChange}
                            className={`input-field ${errors.image ? 'input-error' : ''}`}
                        />
                        {errors.image && <p className="error-message">{errors.image}</p>}
                    </div>

                    <div className="button-container">
                        <button type="submit" className="submit-button">
                            Update User
                        </button>
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
