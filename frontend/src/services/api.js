import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const sortArray = async (algorithm, array, speed) => {
    try {
        const response = await api.post('/sort/', {
            algorithm,
            array,
            speed
        });
        return response.data;
    } catch (error) {
        console.error("Error sorting array:", error);
        throw error;
    }
};

export default api;
