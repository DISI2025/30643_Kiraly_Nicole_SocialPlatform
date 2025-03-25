import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/auth';

export const registerUser = async (userDTO) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, userDTO);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const loginUser = async (loginDTO) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, loginDTO);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const resetPassword = async (email, newPassword) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/reset-password`, { email, newPassword });
        return response.data;  // Return the response data (success message)
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error resetting password');
    }
};

export const testApi = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/test`);
        return response.data;
    } catch (error) {
        throw new Error('Test API failed');
    }
};

export const getUserData = async (jwt) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

