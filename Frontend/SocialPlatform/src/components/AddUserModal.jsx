import React, { useState, useEffect } from 'react';
import "./Modal.css"

const AddUserModal = ({ onClose, onSubmit, userData, setUserData }) => {
    const [errors, setErrors] = useState({});

    // Validate form inputs
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!userData.firstName || userData.firstName.trim() === '') {
            newErrors.firstName = 'First Name is required';
        }

        // Last Name validation
        if (!userData.lastName || userData.lastName.trim() === '') {
            newErrors.lastName = 'Last Name is required';
        }

        if (!userData.password || userData.password.length < 5) {
            newErrors.password = 'Invalid Password [minimum length : 5]';
        }

        if (!userData.image || userData.image.length > 254) {
            newErrors.image = 'image url is too large';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(userData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Role validation
        if (!userData.role) {
            newErrors.role = 'Role is required';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = {...prevErrors};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSubmit(userData);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-header">Add New User</h3>

                <div className="form-group">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={userData.firstName || ''}
                        onChange={handleInputChange}
                        className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && (
                        <p className="error-message">{errors.firstName}</p>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={userData.lastName || ''}
                        onChange={handleInputChange}
                        className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && (
                        <p className="error-message">{errors.lastName}</p>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userData.email || ''}
                        onChange={handleInputChange}
                        className={`input-field ${errors.email ? 'input-error' : ''}`}
                    />
                    {errors.email && (
                        <p className="error-message">{errors.email}</p>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={userData.password || ''}
                        onChange={handleInputChange}
                        className={`input-field ${errors.password ? 'input-error' : ''}`}
                    />
                    {errors.password && (
                        <p className="error-message">{errors.password}</p>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="image"
                        placeholder="Profile Picture Url"
                        value={userData.image || ''}
                        onChange={handleInputChange}
                        className={`input-field ${errors.image ? 'input-error' : ''}`}
                    />
                    {errors.image && (
                        <p className="error-message">{errors.image}</p>
                    )}
                </div>

                <div className="form-group">
                    <select
                        name="role"
                        value={userData.role || 'user'}
                        onChange={handleInputChange}
                        className={`input-field ${errors.role ? 'input-error' : ''}`}
                    >
                        <option value="">Select Role</option>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {errors.role && (
                        <p className="error-message">{errors.role}</p>
                    )}
                </div>

                <div className="button-container">
                    <button
                        onClick={handleFormSubmit}
                        className="action-button add-button"
                    >
                        Add User
                    </button>
                    <button
                        onClick={onClose}
                        className="action-button cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;