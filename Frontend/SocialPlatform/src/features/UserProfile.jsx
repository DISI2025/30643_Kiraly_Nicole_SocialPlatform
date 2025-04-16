import React, { useEffect, useState } from 'react';
import { findUserById } from "../assets/api-profile.jsx";
import { getPostsByUserId } from '../assets/api-feed';
import '../styles/UserProfile.css';
import Navbar from "./NavBar.jsx";
import PostPopup from "../components/PostPopup.jsx";
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [albumOpen, setAlbumOpen] = useState(false);

    const navigate = useNavigate();
    const handleEditProfile = () => {
        navigate('/management-profile');
    };
    const handleManageUsers = () => {
        navigate('/user');
    };
    //add modals
    const [selectedPost, setSelectedPost] = useState(null);
    const openPopup = (post) => {
        setSelectedPost(post);
    };

    const closePopup = async () => {
        setSelectedPost(null);
        try {
            setPostsLoading(true);
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?.id;
            if (!userId) return;
            const response = await getPostsByUserId(userId);
            setPosts(response);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setPostsLoading(false);
        }

    };

    useEffect(() => {
        document.body.classList.add('user-profile-page');

        const loadUserData = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                const userId = userData?.id;
                if (!userId) return;
                const user = await findUserById(userId);
                setUser(user);
                setLoading(false);
            } catch (error) {
                console.error('Error loading user data:', error);
                setLoading(false);
            }
        };

        loadUserData();

        return () => {
            document.body.classList.remove('user-profile-page');
        };
    }, []);

    const handleLoadAlbum = async () => {
        if (posts.length > 0) {
            setAlbumOpen(!albumOpen);
            return;
        }

        try {
            setPostsLoading(true);
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?.id;
            if (!userId) return;
            const response = await getPostsByUserId(userId);
            setPosts(response);
            setAlbumOpen(true);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <Navbar />
                <div className="loading-content">Loading profile...</div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="profile-wrapper">
                {/* Top Section - Fixed */}
                <div className="profile-top-section">
                    <div className="profile-header-container">
                        <div className="profile-identity">
                            <img
                                src={user?.image || '/default-profile.png'}
                                alt="Profile"
                                className="profile-picture"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/default-profile.png';
                                }}
                            />
                            <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
                        </div>
                        <div className="profile-buttons-container">
                            <button onClick={handleEditProfile} className="btn-edit">Edit Profile</button>
                            {user?.role === 'ADMIN' && (
                                <button onClick={handleManageUsers} className="btn-admin">Manage Users</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Album Section */}
                <div className="album-content">
                    <div className={`album-section ${albumOpen ? 'expanded' : ''}`}>
                        <div className="album-folder" onClick={handleLoadAlbum}>
                            <div className="album-icon">
                                <svg
                                    width="190"
                                    height="160"
                                    viewBox="0 0 64 64"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect x="10" y="6" width="44" height="52" rx="2" fill="#0c2734" opacity="0.2"/>
                                    <rect x="16" y="12" width="36" height="44" rx="2" fill="#0c2734"/>
                                    <path
                                        d="M34.2 26.2c-0.9-0.8-2.3-0.8-3.2 0L30 27.1l-1-0.9c-0.9-0.8-2.3-0.8-3.2 0-1 0.9-1 2.5 0 3.4l4.2 3.9 4.2-3.9c1-0.9 1-2.5 0-3.4z"
                                        fill="white"
                                    />
                                    {[...Array(9)].map((_, i) => (
                                        <circle key={i} cx={20 + i * 4} cy={50} r={1} fill="white"/>
                                    ))}
                                    <text x="34" y="46" fill="white" fontSize="5" textAnchor="middle" fontFamily="'Dancing Script', cursive">𝑀𝒶𝒾𝓃 𝒜𝓁𝒷𝓊𝓂</text>
                                </svg>
                            </div>
                            {postsLoading && <span className="loading-text">Loading...</span>}
                        </div>

                        {albumOpen && (
                            <div className="photo-gallery">
                                <div className="gallery-container">
                                    <div className="photo-grid">
                                        {posts.length > 0 ? (
                                            posts.map((post) => (
                                                <div key={post.id} className="photo-item" onClick={() => openPopup(post)}>
                                                    <img
                                                        src={post.image}
                                                        alt="Post"
                                                        className="photo-img"

                                                    />
                                                    <div className="photo-overlay">
                                                        <span className="likes-count">{post.noLikes}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-photos">No posts yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedPost && (
                            <PostPopup
                                post={selectedPost}
                                user={user}
                                onClose={closePopup}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;