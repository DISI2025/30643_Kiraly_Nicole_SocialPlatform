import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/user';

// Funcția getUserToken pentru a obține token-ul
const getUserToken = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Token-ul de autentificare nu a fost găsit.');
    }

    return token;
};

// Adaugă token-ul de autentificare la header-ul cererii
const getAuthHeaders = () => {
    const token = getUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const updateUser = async (userId, updatedUserData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${userId}`, updatedUserData, {
            headers: getAuthHeaders(),
        });
        return response.data;  // Returnează datele utilizatorului actualizat
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${userId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;  // Returnează succesul operațiunii de ștergere
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete profile');
    }
};

// Noua metodă findUserById
export const findUserById = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${userId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;  // Returnează datele utilizatorului găsit
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to find user by ID');
    }
};

export const createUser = async (jwt, user) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, user,{
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to insert user data');
    }
};

export const getUserData = async (jwt) => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

export const addFriend = async (friendId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/add-friend/${friendId}`, {}, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add friend');
    }
};

export const removeFriend = async (friendId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/remove-friend/${friendId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to remove friend');
    }
};

export const getUserFriends = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/friends`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch friends list');
    }
};

export const sendFriendRequest = async (receiverId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/request-friend/${receiverId}`, {}, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send friend request');
    }
};

export const acceptFriendRequest = async (senderId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/accept-friend/${senderId}`, {}, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to accept friend request');
    }
};

export const getPendingFriendRequests = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pending-requests`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending friend requests');
    }
};

export const rejectFriendRequest = async (senderId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8080/user/reject-friend/${senderId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to reject friend request");
    }
};

export const getFriendSuggestions = async (userId, limit = 10) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/${userId}/friend-suggestions?limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch friend suggestions");
    }
    return await response.json();
};


