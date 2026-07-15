import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend URL
});

export const getSkills = () => API.get("/skills");
export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);