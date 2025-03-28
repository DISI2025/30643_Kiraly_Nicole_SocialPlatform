import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/user';

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

export const getUserById = async (jwt, userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

export const updateUser = async (jwt, userDto) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${userDto.id}`, userDto, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

export const deleteUser = async (jwt, userId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
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