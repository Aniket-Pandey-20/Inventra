// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_ENDPOINT_URL}/api`, 
});

// Optional: intercept requests to add auth headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
