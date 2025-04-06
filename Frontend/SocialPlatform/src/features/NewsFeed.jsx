import React, { useEffect, useState } from 'react';
import { getAllPosts, updatePost } from '../assets/api-feed';

const NewsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleLike = async (postId) => {
        try {
            // Optimistic UI update
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, noLikes: post.noLikes + 1 }
                    : post
            ));

            // Get the updated post from the state
            const updatedPost = posts.find(p => p.id === postId);

            // Create the DTO with all fields, updating only noLikes
            const postDTO = {
                image: updatedPost.image, // Keep the current image
                description: updatedPost.description, // Keep the current description
                date: updatedPost.date, // Keep the current date
                user: updatedPost.user, // Keep the current userId
                noLikes: updatedPost.noLikes + 1, // Increment the noLikes field
                visible: updatedPost.visible, // Keep the visibility as is
            };

            // Call the updatePost function to update the post in the database
            await updatePost(postId, postDTO);

            console.log('Post liked successfully!');
        } catch (err) {
            console.error('Error updating like:', err);

            // Rollback the optimistic update in case of failure
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
                .like-button:hover {
                    transform: scale(1.05);
                }
                .like-button:active {
                    transform: scale(1.1);
                }
            `}</style>

            <div style={styles.newsFeedContainer}>
                <h1 style={styles.header}>Feed</h1>

                {posts.length === 0 ? (
                    <p style={styles.noPosts}>No posts available</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id} style={styles.post}>
                            <div style={styles.postHeader}>
                                <img
                                    src={post.user.image}
                                    alt={post.user.firstName}
                                    style={styles.userImage}
                                />
                                <div style={styles.userInfo}>
                                    <h3>{post.user.firstName} {post.user.lastName}</h3>
                                    <p style={styles.description}>{post.description}</p>
                                </div>
                            </div>

                            <div style={styles.postContent}>
                                <img
                                    src={post.image}
                                    alt="Post"
                                    style={styles.postImage}
                                />

                            </div>

                            <div style={styles.postFooter}>
                                <div
                                    style={styles.likes}
                                    onClick={() => handleLike(post.id)}
                                    className="like-button"
                                >
                                    <span style={styles.heart}>♥</span>
                                    <span>{post.noLikes}</span>
                                </div>
                                <span style={styles.date}>
                                    {new Date(post.date).toLocaleString()}
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
    loading: {
        color: 'white',
        textAlign: 'center',
        marginTop: '50px',
        fontSize: '1.5rem',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '50px',
        fontSize: '1.5rem',
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
    caption: {
        fontSize: '0.95rem',
        color: '#333',
        marginTop: '10px',
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
};

export default NewsFeed;