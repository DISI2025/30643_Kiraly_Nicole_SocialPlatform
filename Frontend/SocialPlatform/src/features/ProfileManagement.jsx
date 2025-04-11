import React, {useContext, useEffect, useState} from 'react';
import { updateUser, deleteUser, findUserById } from '../assets/api-profile';
import { UserContext } from '../UserContext';
import  '../styles/ProfileManagement.css'
import Navbar from './NavBar.jsx';
const ProfileManagement = () => {
    const {logout} = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        image: '',
        role: '',
    });
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        image:'',
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.id;

        findUserById(userId)
            .then((data) => {
                setUser(data);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: '',
                    image: data.image,
                    role: data.role,
                });
            })
            .catch((error) => console.error('Error loading data:', error));
        if (!formData.password.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: 'Password cannot be empty.',
            }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        validateField(name, value);
    };
    const validateField = (name, value) => {
        let errorMessage = "";

        switch (name) {
            case "firstName":
                if (!value.trim()) {
                    errorMessage = "First Name cannot be empty.";
                } else if (!/^[A-Za-z\s]+$/.test(value)) {
                    errorMessage = "First Name cannot contain numbers or special characters.";
                }
                break;

            case "lastName":
                if (!value.trim()) {
                    errorMessage = "Last Name cannot be empty.";
                } else if (!/^[A-Za-z\s]+$/.test(value)) {
                    errorMessage = "Last Name cannot contain numbers or special characters.";
                }
                break;

            case "email":
                if (!value.trim()) {
                    errorMessage = "Email cannot be empty.";
                } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    errorMessage = "Please enter a valid email address.";
                }
                break;

            case "password":
                if (!value.trim()) {
                    errorMessage = "Password cannot be empty.";
                } else if (value.length < 8) {
                    errorMessage = "Password must be at least 8 characters long.";
                }
                break;

            case "image":
                if (!value.trim()) {
                    errorMessage = "Image URL cannot be empty.";
                } else if (value.length > 254) {
                    errorMessage = "Image URL is too long. Maximum length is 255 characters.";
                }
                break;
            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
        }));
    };

const handleUpdate =  async (e) => {
        e.preventDefault();
        try {
            const hasErrors = Object.values(errors).some((error) => error !== "");

            if (hasErrors) {
                alert("Please fix the errors before submitting.");
                return;
            }


            //then we update
            await updateUser(user.id, formData);
            alert('Profile updated successfully!');
            if (formData.email !== user.email) {
                alert("Email changed. Please log in again.");
                logout();
                window.location.href = "/login"; // sau folosind navigate
            } else {
                window.location.reload(); // sau navigate("/profile")
            }
        } catch (error) {
            alert('Error updating profile');
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your account?');
        if (confirmDelete) {
            try {
                await deleteUser(user.id);
                alert('Profile deleted successfully!');
                logout();
                window.location.href = '/';

            } catch (error) {
                alert('Error deleting profile');
            }
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
        {user && <Navbar />}

        <div className="profile-management">
            <div className="edit-container">
                <div className="edit-header">
                    <h2>Edit Profile</h2>
                </div>
                <form className="edit-form">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        {errors.firstName && <p className="error">{errors.firstName}</p>}
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                        {errors.lastName && <p className="error">{errors.lastName}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errors.password && <p className="error">{errors.password}</p>}
                    </div>
                    <div className="form-group">
                        <label>Image URL</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                        />
                        {errors.image && <p className="error">{errors.image}</p>}
                    </div>
                    {/* hidden field role */}
                    <input
                        type="hidden"
                        name="role"
                        value={formData.role}
                    />
                    <div className="button-group">
                        <button className="btn-update" onClick={handleUpdate}>
                            Update Profile
                        </button>
                        <button className="btn-delete" type="button" onClick={handleDelete}>
                            Delete Profile
                        </button>
                    </div>
                </form>
            </div>
            <div className="profile-sidebar">
                <div className="profile-card">
                    <div className="profile-image">
                        <img src={user.image} alt={`${user.firstName} ${user.lastName}`}/>
                    </div>
                    <h3>{user.firstName}<br/><span>{user.lastName}</span></h3>


                    <div className="contact-info">
                        <h4>Contact</h4>
                        <p>{user.email}</p>
                    </div>
                </div>
            </div>




        </div>
            </>
    );
};

export default ProfileManagement;