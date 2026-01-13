import axios from "axios";

// 1. Debugging: This will print the variable to your browser console
console.log("DEBUG: VITE_API_URL is:", import.meta.env.VITE_API_URL);

// 2. Safety Check: Fallback to localhost if the variable is missing (prevents the 404 on frontend)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;