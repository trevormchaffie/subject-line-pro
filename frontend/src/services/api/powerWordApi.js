// src/services/api/powerWordApi.js
import api from "./api";

// Category endpoints
export const getCategories = () => api.get("/power-words/categories");
export const getCategory = (id) => api.get(`/power-words/categories/${id}`);
export const createCategory = (data) =>
  api.post("/power-words/categories", data);
export const updateCategory = (id, data) =>
  api.put(`/power-words/categories/${id}`, data);
export const deleteCategory = (id) =>
  api.delete(`/power-words/categories/${id}`);

// Power word endpoints
export const getPowerWords = (params) =>
  api.get("/power-words/words", { params });
export const getPowerWord = (id) => api.get(`/power-words/words/${id}`);
export const createPowerWord = (data) => api.post("/power-words/words", data);
export const updatePowerWord = (id, data) =>
  api.put(`/power-words/words/${id}`, data);
export const deletePowerWord = (id) => api.delete(`/power-words/words/${id}`);

// Rating config endpoints
export const getRatingConfig = () => api.get("/power-words/rating-config");
export const updateRatingConfig = (data) =>
  api.put("/power-words/rating-config", data);
