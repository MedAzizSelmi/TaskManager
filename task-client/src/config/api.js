export const API_URL = 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.headers,
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};
