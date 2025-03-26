import axios from 'axios';

// Create an Axios instance for API requests
// The BaseURL should point to your server's address when running in development
const api = axios.create({
  // Replace with your server's URL when deploying
  baseURL: 'http://10.0.2.2:5000', // Android emulator default address for localhost
  // baseURL: 'http://localhost:5000', // For iOS simulator
  timeout: 10000,
  withCredentials: true, // Important for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;