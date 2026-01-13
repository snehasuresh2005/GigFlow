import axios from "axios";

// TEMPORARY FIX: Hardcode the URL to bypass the environment variable issue
const baseURL = "https://gigflow-backend-4mnl.onrender.com/api";

console.log("Using Hardcoded URL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;