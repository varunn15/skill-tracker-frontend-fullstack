import axios from "axios";
import { toast } from "react-toastify";

// ✅ API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL);

const API = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    let errorMessage = "Something went wrong. Please try again.";
    
    if (error.response) {
      errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     error.response.statusText ||
                     errorMessage;
      
      if (error.response.status === 400 || error.response.status === 500) {
        error.userMessage = errorMessage;
        return Promise.reject(error);
      }
    } else if (error.request) {
      if (!navigator.onLine) {
        errorMessage = "You are offline. Please check your connection.";
      } else {
        errorMessage = "Network error. Please check your internet connection.";
      }
    }
    
    if (error.response?.status !== 400 && error.response?.status !== 500) {
      toast.error(`❌ ${errorMessage}`);
    }
    
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

// ========== SKILL APIs ==========
export const getSkills = () => API.get('/skills');
export const createSkill = (data) => API.post('/skills', data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);
export const getSkillAnalytics = () => API.get('/skills/analytics');

// ========== SKILL REGISTRY APIs ==========
export const searchSkills = (query) => API.get(`/skills/search?q=${query}`);
export const createSkillInRegistry = (data) => API.post('/skills/registry', data);
export const getRegistrySkills = () => API.get('/skills/registry');

// ========== AI APIs ==========
export const getAIInsights = (data) => API.post('/ai/insights', data);
export const getCareerReadiness = (data) => API.post('/ai/readiness', data);

// ========== ROADMAP APIs ==========
export const generateRoadmap = (data) => API.post('/roadmap/generate', data);
export const saveRoadmap = (data) => API.post('/roadmap/save', data);
export const getRoadmap = (role) => {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return API.get(`/roadmap${query}`);
};
export const toggleTask = (data) => API.post('/roadmap/toggle', data);
export const deleteRoadmap = (id) => API.delete(`/roadmap/${id}`);

// ========== RESUME APIs ==========
export const uploadResume = (formData) => {
  return API.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });
};

export default API;