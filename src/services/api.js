import axios from "axios";
import { toast } from "react-toastify";

// ✅ CORRECT: No /api at the end
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL);

const API = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptors...
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Error handling...
    return Promise.reject(error);
  }
);

// ✅ CORRECT: Routes start with / not /api
export const getSkills = () => API.get("/skills");
export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);

export const searchSkills = (query) => API.get(`/skills/search?q=${query}`);
export const createSkillInRegistry = (data) => API.post('/skills/registry', data);

export default API;