import React, { useEffect, useState } from 'react';
import { getAllPosts, updatePost, createPost } from '../assets/api-feed';

const NewsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPost, setNewPost] = useState({
        description: '',
        image: '',
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

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
        fetchPosts();
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

            setNewPost({ description: '', image: '' });
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
                    ? { ...post, noLikes: post.noLikes + 1 }
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
                    ? { ...post, noLikes: post.noLikes - 1 }
                    : post
            ));
        }
    };

    return (
        <>
            <style>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    background-color: #0C2734;
                    display: flex;
                    flex-direction: column;
                }
                #root {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
                    background: linear-gradient(135deg, #145067, #1b6b8f);
                }
            `}</style>

            <div style={styles.newsFeedContainer}>
                <h1 style={styles.header}>Feed</h1>

                <button onClick={toggleFormVisibility} style={styles.createPostButton}>
                    <b style={{ fontSize: '1rem'}}>+</b> Create New Post
                </button>

                {isFormVisible && (
                    <form onSubmit={handlePostSubmit} style={styles.formContainer}>
                        {error && <p style={styles.errorMessage}>{error}</p>} {/* Error message */}
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={newPost.description}
                            onChange={handleFormChange}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                            }}
                            style={styles.textarea}
                        />
                        <input
                            type="text"
                            name="image"
                            placeholder="Enter Image URL"
                            value={newPost.image}
                            onChange={handleFormChange}
                            style={styles.inputField}
                        />
                        <button type="submit" style={styles.submitButton}>Submit</button>
                    </form>
                )}


                {posts.length === 0 ? (
                    <p style={styles.noPosts}>No posts available</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id || `${post.description}-${Math.random()}`} style={styles.post}>
                            <div style={styles.postHeader}>
                                <img
                                    src={post.user?.image}
                                    alt={post.user?.firstName}
                                    style={styles.userImage}
                                />
                                <div style={styles.userInfo}>
                                    <h3>{post.user?.firstName} {post.user?.lastName}</h3>
                                    <p style={styles.description}>{post.description}</p>
                                </div>
                            </div>

                            {post.image && (
                                <div style={styles.postContent}>
                                    <img
                                        src={post.image}
                                        alt="Post"
                                        style={styles.postImage}
                                    />
                                </div>
                            )}

                            <div style={styles.postFooter}>
                                <div
                                    style={styles.likes}
                                    onClick={() => handleLike(post.id)}
                                >
                                    <span style={styles.heart}>♥</span>
                                    <span>{post.noLikes}</span>
                                </div>
                                <span style={styles.date}>
                                    {post.date ? new Date(post.date).toLocaleString() : 'Date not available'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

const styles = {
    newsFeedContainer: {
        width: '60vw',
        padding: '20px',
        backgroundColor: '#e0e0e0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
    },
    header: {
        color: '#0C2734',
        marginBottom: '30px',
    },
    noPosts: {
        color: '#555',
        fontSize: '1.2rem',
    },
    post: {
        backgroundColor: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
        padding: '15px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '800px',
    },
    postHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    userImage: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
    },
    userInfo: {
        paddingLeft: '10px',
        color: 'black',
    },
    description: {
        fontSize: '0.9rem',
        color: '#555',
    },
    postContent: {
        marginBottom: '10px',
    },
    postImage: {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '500px',
        width: 'auto',
        height: 'auto',
        margin: '0 auto 10px',
        borderRadius: '8px',
        objectFit: 'contain',
    },
    postFooter: {
        fontSize: '0.9rem',
        color: '#888',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid #eee',
    },
    likes: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        color: '#0C2734',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        userSelect: 'none',
    },

    heart: {
        marginRight: '5px',
        color: '#0C2734',
        fontSize: '1.5rem',
        transition: 'transform 0.2s',
    },
    date: {
        fontSize: '0.8rem',
    },
    createPostButton: {
        background: 'linear-gradient(135deg, #0C2734, #145067)',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        marginBottom: '20px',
        letterSpacing: '0.5px',
        verticalAlign: 'middle',
    },
    formContainer: {
        width: '100%',
        maxWidth: '600px',
        margin: '20px auto',
        marginTop: '10px',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    textarea: {
        width: '100%',
        maxHeight: '200px',
        resize: 'none',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '1rem',
        marginBottom: '15px',
        fontFamily: 'Arial, sans-serif'
    },
    inputField: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '1rem',
        marginBottom: '15px',
        fontFamily: 'Arial, sans-serif'
    },
    submitButton: {
        background: 'linear-gradient(135deg, #0C2734, #145067)',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px',
        letterSpacing: '0.5px',
        verticalAlign: 'middle',
        display: 'block',  // Ensure it's a block-level element
        width: '30%',     // Make it take the full width of the parent container
        maxWidth: '300px', // Optional: limit the max width to prevent it from being too wide
        marginLeft: 'auto',  // Center the button horizontally
        marginRight: 'auto', // Center the button horizontally
    },
    errorMessage: {
        backgroundColor: '#f1b0b7',
        color: '#721c24',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #f5c6cb',
        fontSize: '1rem',
        marginBottom: '15px',
        textAlign: 'center',  // Center align the error message text
        fontWeight: 'bold',    // Make the text bold
    },




};

export default NewsFeed;
