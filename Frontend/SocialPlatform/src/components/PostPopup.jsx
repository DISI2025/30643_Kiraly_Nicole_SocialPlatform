import React, { useState, useEffect } from 'react';
import '../styles/PostPopup.css';
import EditPost from "./EditPost.jsx";
import { getPostById , deletePost} from '../assets/api-feed';

const EyeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#0c2734">
        <path d="M12 5C7 5 2.73 9.11 1 12c1.73 2.89 6 7 11 7s9.27-4.11 11-7c-1.73-2.89-6-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5
        5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#0c2734">
        <path d="M12 5c-3.14 0-5.92 1.53-8 4 1.1 1.34 2.5 2.53 4.14 3.33L4 19l1.41 1.41L21 4.41 19.59 3l-5.44 5.44C13.19 8.17 12.6 8 12 8a4 4 0 00-4 4c0 .6.17 1.19.44 1.69l-1.46 1.46C5.95 13.63 4.75 12.37 4 11c1.78-2.69 5.04-5 8-5 1.25 0 2.43.28 3.5.77l1.54-1.54C16.67 5.11 14.38 5 12 5zm0 14c3.14 0 5.92-1.53 8-4-1.1-1.34-2.5-2.53-4.14-3.33L20 5l-1.41-1.41L3 20.59 4.41 22l5.44-5.44C10.81 15.83 11.4 16 12 16a4 4 0 004-4c0-.6-.17-1.19-.44-1.69l1.46-1.46C18.05 10.37 19.25 11.63 20 13c-1.78 2.69-5.04 5-8 5z"/>
    </svg>
);

const PostPopup = ({ post, user, onClose }) => {
    const [isEditPostOpen, setIsEditPostOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);

    const handleEditPost = () => {
        setIsEditPostOpen(true);
    };

    const handlePostUpdateCallback = async () => {
        try {
            const updated = await getPostById(post.id);
            setCurrentPost(updated); // Actualizează cu datele noi
            setIsEditPostOpen(false); // Închide modalul
        } catch (err) {
            console.error('Error updating post:', err);
        }
    };

    const handleDeletePost = async () => {
        console.log('Delete post:', post.id);
        try {
            await deletePost(post.id);
            onClose(); // închide popup-ul după ștergere
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('A apărut o eroare la ștergerea postării.');
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={onClose}>×</button>

                <div className="popup-left">
                    <img src={currentPost.image} alt="Selected Post" className="popup-post-image" />
                </div>

                <div className="popup-right">
                    <div className="user-info">
                        <img
                            src={user?.image || '/default-profile.png'}
                            alt="User"
                            className="popup-user-image"
                        />
                        <h3>{user?.firstName} {user?.lastName}</h3>
                    </div>

                    <div className="popup-details">
                        <p className="post-description">{currentPost.description}</p>
                        <div className="post-visibility">
                            {currentPost.visible ? (
                                <div className="visibility-tag">
                                    <EyeIcon />
                                    <span>Public</span>
                                </div>
                            ) : (
                                <div className="visibility-tag">
                                    <EyeOffIcon />
                                    <span>Private</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="popup-actions">
                        <button className="btn-edit" onClick={handleEditPost}>Edit Post</button>
                        <button className="btn-delete" onClick={handleDeletePost}>Delete</button>
                    </div>

                    {isEditPostOpen && (
                        <EditPost
                            post={currentPost}
                            onClose={() => setIsEditPostOpen(false)}
                            onPostUpdate={handlePostUpdateCallback}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostPopup;
