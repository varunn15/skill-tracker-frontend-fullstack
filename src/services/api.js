import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ REQUEST INTERCEPTOR - Add loading indicators if needed
API.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Centralized error handling
API.interceptors.response.use(
  (response) => {
    // Any successful response can be processed here
    return response;
  },
  (error) => {
    // ✅ Centralized error toast
    let errorMessage = "Something went wrong. Please try again.";

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.error || "Bad request. Please check your input.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to do this.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      // Request made but no response (network error)
      errorMessage = "Network error. Please check your internet connection.";
      
      // ✅ Network awareness
      if (!navigator.onLine) {
        errorMessage = "You are offline. Please check your connection.";
      }
    }

    // Show error toast
    toast.error(`❌ ${errorMessage}`);

    // ✅ Attach user-friendly message to error for component use
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

// ✅ Export named functions
export const getSkills = () => API.get("/skills");
export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);

export default API;