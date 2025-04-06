import React, {useContext, useEffect, useState} from 'react';
import { updateUser, deleteUser, findUserById } from '../assets/api-profile';
import { UserContext } from '../UserContext';

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

            <style jsx>{`
                .error {
                    color: red;
                    font-size: 0.9rem;
                    margin-top: 5px;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%; /* Asigură-te că întregul document ocupă întreaga înălțime */
                    overflow: hidden; /* Împiedică scroll-ul pe pagină */
                }
                .profile-management {
                    display: flex;
                    gap: 150px;
                    padding: 80px;
                    width: 100vw;
                    background: #f8f9fa;
                    min-height: 100vh;
                    box-sizing: border-box; /* Adaugă padding-ul în calculele pentru dimensiuni */
                    overflow: hidden;
                }

                .edit-container {
                    width: 55%;
                    height: auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    position: relative;
                    margin-top: 100px; /* Space for header elevation */
                }

                .edit-header {
                    background: #0c2734;
                    padding: 25px 40px;
                    border-radius: 8px 8px 8px 8px;
                    position: absolute;
                    top: -20px; /* Lift header up */
                    left: 20px;
                    right: 20px;
                    box-shadow: 0 4px 15px rgba(12, 39, 52, 0.2);
                    z-index: 2;
                }


                .edit-header h2 {
                    color: white;
                    margin: 0;
                    font-size: 1.6rem;
                    position: relative;
                }

                .edit-form {
                    padding: 80px 40px 40px;
                    padding-bottom: 100px;
                    position: relative;
                    height: auto;
                }

                .form-group {
                    margin-bottom: 10px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #333;
                }

                .form-group input {
                    width: 80%; /* Lățimea mai mică */
                    padding: 8px;
                    border: 1px solid #0c2734; /* Culoare bordură câmpuri */
                    border-radius: 6px;
                    font-size: 1rem;
                    border-color: #0c2734; /* Culoare bordură câmpuri */
                    background-color: #0c2734; /* Fundal câmpuri */
                    color: white; /* Text alb */
                }

                .button-group {
                    position: absolute;
                    bottom: 15px;
                    left: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                button {
                    background: #0c2734;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: opacity 0.3s ease;
                }

                button:hover {
                    opacity: 0.9;
                }

                

                .profile-sidebar {
                    width: 30%;
                    height: 50%;
                    background: white;
                    border-radius: 8px;

                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: visible;
                    margin-top: 100px;
                }

                .profile-card {
                    height: auto;
                    background: white;
                    padding: 25px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    position: relative;
                }


                .profile-image {
                    position: absolute;
                    top: -85px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    background: #0c2734; /* Blue outer frame */
                    padding: 6px; /* Controls blue frame thickness */
                    box-shadow: 0 4px 15px rgba(12, 39, 52, 0.3);
                    z-index: 2;
                }

                .profile-image::before {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    right: 3px;
                    bottom: 3px;
                    background: white; /* White inner frame */
                    border-radius: 50%;
                    z-index: 1;
                }

                .profile-image img {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    z-index: 2;
                }

                .profile-card h3 {
                    margin-top: 110px; /* Increased space for the image */
                    margin-bottom: 20px;
                    font-size: 1.3rem;
                    color: #333;
                }

                .contact-info p,
                .contact-info h4 {
                    background-color: #f8f9fa;
                    color: #666;
                    margin: 0; /* Elimină orice margini pentru a face elementele să se lipească */
                    padding: 10px; /* Adaugă padding pentru un aspect uniform */
                    font-size: 1rem; /* Dimensiune uniformă pentru ambele */
                }

                .contact-info p {
                    border-radius: 0 0 8px 8px; /* Colțuri rotunjite doar sus */
                }

                .contact-info h4 {
                    border-radius: 8px 8px 0 0; /* Colțuri rotunjite doar jos */
                }



            `}</style>


        </div>
    );
};

export default ProfileManagement;