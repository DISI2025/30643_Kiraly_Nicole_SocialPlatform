import React, {useEffect, useMemo, useState} from 'react';
import {findUserById, getPendingFriendRequests, sendFriendRequest, rejectFriendRequest, acceptFriendRequest} from "../assets/api-profile.jsx";
import { getVisiblePostsByUserId } from '../assets/api-feed';
import '../styles/UserProfile.css';
import Navbar from "./NavBar.jsx";
import SeePost from "../components/SeePost.jsx";
import { useLocation } from 'react-router-dom';
import { getUserFriends, addFriend, removeFriend } from "../assets/api-profile.jsx";

const AnotherProfile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [albumOpen, setAlbumOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const [isFriend, setIsFriend] = useState(false);

    const openPopup = (post) => {
        setSelectedPost(post);
    };

    const closePopup = () => {
        setSelectedPost(null);
    };

    const [friendRequestSent, setFriendRequestSent] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState(false);


    const selectedId = useMemo(() => {
        return new URLSearchParams(location.search).get("user");
    }, [location.search]);
    useEffect(() => {
        document.body.classList.add('user-profile-page');

        const loadSelectedUserData = async () => {
            try {
                if (!selectedId) return;

                const [userData, postsData, friendsList, pendingRequests] = await Promise.all([
                    findUserById(selectedId),
                    getVisiblePostsByUserId(selectedId),
                    getUserFriends(),
                    getPendingFriendRequests()
                ]);

                const isFriendNow = friendsList.some(friend => friend.id === selectedId);
                const theyRequested = pendingRequests.some(req => req.id === selectedId);

                // ✅ Verificăm dacă în localStorage există cerere trimisă către acest user
                const sentRequests = JSON.parse(localStorage.getItem("sentFriendRequests") || "{}");
                const youRequested = sentRequests[selectedId] || (
                    Array.isArray(userData.friendRequests) &&
                    userData.friendRequests.some(req => req.id === loggedUser.id)
                );

                setUser(userData);
                setPosts(postsData);
                setIsFriend(isFriendNow);
                setIncomingRequest(theyRequested);
                setFriendRequestSent(youRequested);
                setLoading(false);
            } catch (error) {
                console.error("Error loading selected user data:", error);
                setLoading(false);
            }
        };

        loadSelectedUserData();

        return () => {
            document.body.classList.remove('user-profile-page');
        };
    }, [selectedId]);




    const handleLoadAlbum = () => {
        setAlbumOpen(!albumOpen);
    };

    const handleToggleFriend = async () => {
        try {
            if (isFriend) {
                await removeFriend(selectedId);
                setIsFriend(false);
                const sentRequests = JSON.parse(localStorage.getItem("sentFriendRequests") || "{}");
                delete sentRequests[selectedId];
                localStorage.setItem("sentFriendRequests", JSON.stringify(sentRequests));
            } else if (incomingRequest) {
                await acceptFriendRequest(selectedId);
                setIsFriend(true);
                setIncomingRequest(false);
                const sentRequests = JSON.parse(localStorage.getItem("sentFriendRequests") || "{}");
                delete sentRequests[selectedId];
                localStorage.setItem("sentFriendRequests", JSON.stringify(sentRequests));
            } else if (!friendRequestSent) {
                await sendFriendRequest(selectedId);
                setFriendRequestSent(true);

                // Salvează în localStorage că ai trimis cerere acestui utilizator
                const sentRequests = JSON.parse(localStorage.getItem("sentFriendRequests") || "{}");
                sentRequests[selectedId] = true;
                localStorage.setItem("sentFriendRequests", JSON.stringify(sentRequests));
            }
        } catch (err) {
            console.error("Failed to manage friend request:", err);
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
    const handleRejectFriend = async () => {
        try {
            await rejectFriendRequest(selectedId);
            setIncomingRequest(false);
            const sentRequests = JSON.parse(localStorage.getItem("sentFriendRequests") || "{}");
            delete sentRequests[selectedId];
            localStorage.setItem("sentFriendRequests", JSON.stringify(sentRequests));
        } catch (err) {
            console.error("Failed to reject friend request", err);
        }
    };



    return (
        <>
            <Navbar />
            <div className="profile-wrapper">
                {/* Top Section - Fixed */}
                <div className="profile-top-section">
                    <div className="profile-header-container">
                        <div className="profile-identity">
                            <img
                                src={user?.image || './default_image.jpg'}
                                alt="Profile"
                                className="profile-picture"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = './default_image.jpg';
                                }}
                            />
                            <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
                            {user?.id !== loggedUser?.id && (
                                isFriend ? (
                                    <button onClick={handleToggleFriend} className="friendButton">Remove Friend</button>
                                ) : incomingRequest ? (
                                    <>
                                        <button onClick={handleToggleFriend} className="friendButton">Accept Request</button>
                                        <button onClick={handleRejectFriend} className="friendButton" style={{ marginLeft: 10 }}>
                                            Reject
                                        </button>
                                    </>
                                ) : friendRequestSent ? (
                                    <button className="friendButton" disabled>Request Sent</button>
                                ) : (
                                    <button onClick={handleToggleFriend} className="friendButton">Add Friend</button>
                                )
                            )}
                        </div>
                        {/* Fără butoane de edit/admin */}
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
                            <SeePost
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

export default AnotherProfile;
