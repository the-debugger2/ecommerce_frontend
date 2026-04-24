import axios from "axios";

const API = axios.create({
    // If the env variable is missing, it defaults to localhost:5000
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
    const storedUser = localStorage.getItem("userInfo");
    
    // Safety check: only parse if storedUser actually exists
    if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        if (userInfo?.token) {
            req.headers.Authorization = `Bearer ${userInfo.token}`;
        }
    }

    return req;
});

export default API;