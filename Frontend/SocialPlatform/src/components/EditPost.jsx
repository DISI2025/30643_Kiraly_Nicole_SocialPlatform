import React, { useState } from 'react';
import { updatePost } from '../assets/api-feed'; // Importăm funcția de update
import '../styles/EditPost.css'; // CSS pentru editarea postării

const EditPost = ({ post, onClose, onPostUpdate }) => {
    const [description, setDescription] = useState(post.description);
    const [visibility, setVisibility] = useState(post.visible);

    const handleVisibilityChange = () => {
        setVisibility(!visibility);
    };

    const handleSaveChanges = async () => {
        // Actualizăm postarea cu noile valori
        const updatedPost = {
            ...post, // Păstrăm toate câmpurile originale ale postării
            description, // Actualizăm descrierea
            visible: visibility, // Actualizăm vizibilitatea
        };

        // Construim DTO-ul pentru update
        const postDTO = {
            image: updatedPost.image, // Păstrăm imaginea
            description: updatedPost.description, // Folosim descrierea actualizată
            date: updatedPost.date, // Păstrăm data originală
            user: updatedPost.user, // Păstrăm utilizatorul original
            noLikes: updatedPost.noLikes, // Păstrăm numărul de like-uri
            visible: updatedPost.visible, // Folosim vizibilitatea actualizată
        };

        try {
            // Apelăm funcția updatePost pentru a salva modificările
            await updatePost(post.id, postDTO);
            // După ce postarea este actualizată, apelăm funcția onPostUpdate
            onPostUpdate(updatedPost); // Transmite postarea actualizată
            onClose(); // Închidem modalul
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    return (
        <div className="edit-popup">
            <div className="edit-popup-content">
                <button className="popup-close" onClick={onClose}>X</button>
                <div className="edit-post-details">
                    <img src={post.image} alt="Post" className="edit-post-image" />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="edit-post-description"
                    />
                    <div className="edit-post-visibility">
                        <button onClick={handleVisibilityChange}>
                            {visibility ? 'Make Private' : 'Make Public'}
                        </button>
                    </div>
                    <div className="edit-popup-actions">
                        <button className="edit-action-btn" onClick={handleSaveChanges}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPost;
