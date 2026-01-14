import axios from "axios";

// Export the base URL so it can be used by other utilities (like socket.js)
export const baseURL = "https://gigflow-backend-4mnl.onrender.com";

console.log("Using Hardcoded URL:", baseURL);

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;