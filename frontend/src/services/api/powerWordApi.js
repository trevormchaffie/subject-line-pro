// src/services/api/powerWordApi.js
import api from "./api";

// Category endpoints
export const getCategories = () => api.get("/power-words/categories");
export const getCategory = (id) => api.get(`/power-words/categories/${id}`);
export const createCategory = (data) =>
  api.post("/power-words/categories", data);
export const updateCategory = (id, data) => {
  // Handle numeric ids properly
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  
  // Set default impact if not provided
  if (!data.impact) {
    data.impact = 'medium';
  }
  
  // Handle 'order' field if needed
  if (!data.order && typeof numericId === 'number' && numericId <= 10) {
    data.order = numericId;
  }
  
  return api.put(`/power-words/categories/${numericId}`, data);
};
export const deleteCategory = (id) => {
  // Handle numeric ids properly
  const numericId = typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) : id;
  return api.delete(`/power-words/categories/${numericId}`);
};

// Power word endpoints
export const getPowerWords = (params) => api.get("/power-words", { params });
export const getAllPowerWords = async () => {
  // Set a large limit to get all power words at once
  const response = await api.get("/power-words", { 
    params: { limit: 1000 } 
  });
  
  // The backend returns { success: true, data: { data: [...], total: X } }
  // We want to extract the array of power words
  if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
    return { data: response.data.data.data };
  } else if (response.data && response.data.data) {
    return { data: response.data.data };
  }
  return response;
};
export const getPowerWord = (id) => api.get(`/power-words/${id}`);
export const createPowerWord = (data) => {
  // Convert effectivenessRating to effectiveness for backend compatibility
  const transformedData = {
    ...data,
    effectiveness: data.effectivenessRating,
  };
  delete transformedData.effectivenessRating;
  
  return api.post("/power-words", transformedData);
};
export const updatePowerWord = (id, data) => {
  // Convert effectivenessRating to effectiveness for backend compatibility
  const transformedData = {
    ...data,
    effectiveness: data.effectivenessRating,
  };
  delete transformedData.effectivenessRating;
  
  return api.put(`/power-words/${id}`, transformedData);
};
export const deletePowerWord = (id) => api.delete(`/power-words/${id}`);

// Import/Export endpoints
export const importPowerWords = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/power-words/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const exportPowerWords = (categoryId = null) => {
  const params = categoryId ? { categoryId } : {};
  console.log("Exporting power words with params:", params);
  console.log("Export URL:", "/power-words/export");
  return api.get("/power-words/export", {
    params,
  });
};

// Settings endpoints
export const getRatingScale = () =>
  api.get("/power-words/settings/rating-scale");
export const updateRatingScale = (data) =>
  api.put("/power-words/settings/rating-scale", data);
