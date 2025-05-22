import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/post';

// Get token from localStorage
const token = localStorage.getItem('token');

// Create a new post
export const createPost = async (postDTO) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, postDTO, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // post ID
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Post creation failed');
    }
};

// Get all posts
export const getAllPosts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // List of PostDTOs
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
};

// Get post by ID
export const getPostById = async (postId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
};

// Get all posts by user ID
export const getPostsByUserId = async (userId) => {
    try {
        const allPosts = await getAllPosts();
        const userPosts = allPosts.filter(post => post.user?.id === userId);
        return userPosts;
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch user posts');
    }
};

// Get all visible posts by user ID
export const getVisiblePostsByUserId = async (userId) => {
    try {
        const allPosts = await getAllPosts();
        const userPosts = allPosts.filter(post => post.user?.id === userId && post.visible === true);
        return userPosts;
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch user posts');
    }
};

// Update post
export const updatePost = async (postId, postDTO) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${postId}`, postDTO, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update post');
    }
};

// Like post
export const likePost = async (postId, userId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/like-post/${postId}/${userId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update post');
    }
};

// Delete post
export const deletePost = async (postId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
};
