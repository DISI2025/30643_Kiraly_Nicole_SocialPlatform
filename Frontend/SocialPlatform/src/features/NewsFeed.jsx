import React, {useEffect, useState} from 'react';
import {getAllPosts, updatePost, createPost} from '../assets/api-feed';
import '../styles/NewsFeed.css'; // Imported the stylesheet
import {getUserFriends, addFriend, removeFriend} from '../assets/api-profile';
import Navbar from './NavBar.jsx';
import {UserContext} from '../UserContext';
import {Toolbar} from '@mui/material';
import { useNavigate } from 'react-router-dom';


const NewsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPost, setNewPost] = useState({
        description: '',
        image: '',
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [friends, setFriends] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const handleFriendClick = (friendId) => {
        navigate(`/another-profile?user=${friendId}`);
    };



    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getAllPosts();
                const visiblePosts = fetchedPosts.filter(post => post.visible);
                setPosts(visiblePosts);
            } catch (err) {
                setError('Failed to load posts');
                console.error('Error loading posts:', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchFriends = async () => {
            try {
                const friendsList = await getUserFriends();
                setFriends(friendsList);
            } catch (err) {
                console.error("Error fetching friends", err);
            }
        };

        fetchPosts();
        fetchFriends();
    }, []);

    const handleFormChange = (e) => {
        setNewPost({
            ...newPost,
            [e.target.name]: e.target.value,
        });
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!newPost.description && !newPost.image) {
            setError('Please provide either a description or an image URL.');
            return;
        }

        try {
            const postDTO = {
                description: newPost.description,
                image: newPost.image,
                date: new Date().toISOString(),
                userId: user.id,
                noLikes: 0,
                visible: true,
            };

            await createPost(postDTO);

            const updatedPosts = await getAllPosts();
            const visiblePosts = updatedPosts.filter(post => post.visible);
            setPosts(visiblePosts);

            setNewPost({description: '', image: ''});
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Failed to create post');
        }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handleLike = async (postId) => {
        try {
            setPosts(posts.map(post =>
                post.id === postId
                    ? {...post, noLikes: post.noLikes + 1}
                    : post
            ));
            const updatedPost = posts.find(p => p.id === postId);
            const postDTO = {
                image: updatedPost.image,
                description: updatedPost.description,
                date: updatedPost.date,
                user: updatedPost.user,
                noLikes: updatedPost.noLikes + 1,
                visible: updatedPost.visible,
            };
            await updatePost(postId, postDTO);
        } catch (err) {
            console.error('Error updating like:', err);
            setPosts(posts.map(post =>
                post.id === postId
                    ? {...post, noLikes: post.noLikes - 1}
                    : post
            ));
        }
    };

    return (
        <>
            {user && <Navbar/>}
            <div className="feedLayout">
                <div className="newsFeedContainer">
                    <h1 className="header">Feed</h1>

                    <button onClick={toggleFormVisibility} className="createPostButton">
                        <b style={{fontSize: '1rem'}}>+</b> Create New Post
                    </button>

                    {isFormVisible && (
                        <form onSubmit={handlePostSubmit} className="formContainer">
                            {error && <p className="errorMessage">{error}</p>}
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={newPost.description}
                                onChange={handleFormChange}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                                }}
                                className="textarea"
                            />
                            <input
                                type="text"
                                name="image"
                                placeholder="Enter Image URL"
                                value={newPost.image}
                                onChange={handleFormChange}
                                className="inputField"
                            />
                            <button type="submit" className="submitButton">Submit</button>
                        </form>
                    )}

                    {posts.length === 0 ? (
                        <p className="noPosts">No posts available</p>
                    ) : (
                        posts.map(post => (
                            <div key={post.id || `${post.description}-${Math.random()}`} className="post">
                                <div className="postHeader">
                                    <div className="userInfo">
                                        <h1 className="userNameWrapper">
                                            <img
                                                src={post.user?.image}
                                                alt={post.user?.firstName}
                                                className="userImage"
                                            />
                                            <span className="userName">
                                            {post.user?.firstName} {post.user?.lastName}
                                        </span>
                                        </h1>
                                        <p className="description">{post.description}</p>
                                    </div>
                                </div>


                                {post.image && (
                                    <div className="postContent">
                                        <img
                                            src={post.image}
                                            alt="Post"
                                            className="postImage"
                                        />
                                    </div>
                                )}

                                <div className="postFooter">
                                    <div
                                        className="likes"
                                        onClick={() => handleLike(post.id)}
                                    >
                                        <span className="heart">♥</span>
                                        <span>{post.noLikes}</span>
                                    </div>
                                    <span className="date">
                                    {post.date ? new Date(post.date).toLocaleString() : 'Date not available'}
                                </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <aside className="friendsSidebarFixed">
                    <h3>Friends</h3>
                    {friends.length === 0 ? <p>No friends yet.</p> : (
                        friends.map(friend => (
                            <div
                                key={friend.id}
                                className="friendCard"
                                onClick={() => handleFriendClick(friend.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={friend.image} alt={friend.firstName} className="friendAvatar" />
                                <div className="friendName">{friend.firstName} {friend.lastName}</div>
                            </div>
                        ))
                    )}
                </aside>
            </div>
        </>
    );
};

export default NewsFeed;
