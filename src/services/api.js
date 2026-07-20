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
                     errorMessage;
    } else if (error.request) {
      if (!navigator.onLine) {
        errorMessage = "You are offline. Please check your connection.";
      } else {
        errorMessage = "Network error. Please check your internet connection.";
      }
    }

    toast.error(`❌ ${errorMessage}`);
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

// ========== AI APIs - NO /api PREFIX ==========
export const getAIInsights = (data) => API.post('/ai/insights', data);
export const getCareerReadiness = (data) => API.post('/ai/readiness', data);

// ========== ROADMAP API ==========
export const generateRoadmap = (data) => API.post('/roadmap/generate', data);
export const saveRoadmap = (data) => API.post('/roadmap/save', data);
export const getRoadmap = () => API.get('/roadmap');
export const toggleTask = (data) => API.post('/roadmap/toggle', data);
export const deleteRoadmap = (id) => API.delete(`/roadmap/${id}`);
export const testRoadmap = () => API.get('/roadmap/test'); 

export default API;