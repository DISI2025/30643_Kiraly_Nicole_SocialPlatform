import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/post';

export const getpostData = async (jwt) => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post data');
    }
};

export const getpostById = async (jwt, postId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${postId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post data');
    }
};

export const updatepost = async (jwt, postDto) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${postDto.id}`, postDto, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post data');
    }
};

export const deletepost = async (jwt, postId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${postId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post data');
    }
};