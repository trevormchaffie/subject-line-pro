// src/pages/admin/PowerWordsManagement.jsx
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Alert, Card } from "react-bootstrap";
import PowerWordsList from "../../components/admin/powerWords/PowerWordsList";
import CategoriesList from "../../components/admin/powerWords/CategoriesList";
import RatingConfig from "../../components/admin/powerWords/RatingConfig";
import PowerWordForm from "../../components/admin/powerWords/PowerWordForm";
import * as powerWordApi from "../../services/api/powerWordApi";
import "../../components/admin/powerWords/bootstrap-imports.css";

// Helper function to format error messages consistently
const formatErrorMessage = (error, defaultMessage) => {
  console.error("API Error:", error);
  
  if (!error) return defaultMessage;
  
  // If error.response.data exists, try to extract the message
  if (error.response?.data) {
    const apiError = error.response.data;
    
    // Handle object error responses
    if (typeof apiError === 'object') {
      // Check for specific nested error format from server: {error: {message: "..."}}
      if (apiError.error && typeof apiError.error === 'object' && apiError.error.message) {
        const errorMsg = apiError.error.message;
        
        // Handle specific error messages with friendlier wording
        if (errorMsg.includes("Cannot delete category with assigned words")) {
          return "This category has power words assigned to it. Please reassign or delete those words first.";
        }
        return errorMsg;
      }
      // Common API error format with message property
      else if (apiError.message) {
        const errorMsg = apiError.message;
        
        // Handle specific error messages with friendlier wording
        if (errorMsg.includes("Cannot delete category with assigned words")) {
          return "This category has power words assigned to it. Please reassign or delete those words first.";
        }
        return errorMsg;
      } 
      // Error might be in 'error' property as a string
      else if (apiError.error && typeof apiError.error === 'string') {
        return apiError.error;
      }
      // Error might be in 'error' property as another object
      else if (apiError.error && typeof apiError.error === 'object') {
        return JSON.stringify(apiError.error);
      }
      // Fallback to stringifying the whole object
      return JSON.stringify(apiError);
    } 
    // Handle string error responses
    else if (typeof apiError === 'string') {
      return apiError;
    }
  }
  
  // Fallback to error.message or default message
  return error.message || defaultMessage;
};

const PowerWordsManagement = () => {
  const [activeTab, setActiveTab] = useState("words");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [categories, setCategories] = useState([]);
  const [powerWords, setPowerWords] = useState([]);
  const [ratingScale, setRatingScale] = useState({ min: 1, max: 100, default: 70, step: 5 });
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 1,
    limit: 20,
  });

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  // Simple toast implementation
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wordsResponse, categoriesResponse, scaleResponse] =
        await Promise.all([
          powerWordApi.getPowerWords(filters),
          powerWordApi.getCategories(),
          powerWordApi.getRatingScale(),
        ]);

      console.log("API Responses:", {
        wordsResponse,
        categoriesResponse,
        scaleResponse,
      }); // Add this

      const wordsData = wordsResponse.data.data;
      setPowerWords(wordsData.data || []);
      setPaginationInfo({
        total: wordsData.total || 0,
        page: wordsData.page || 1,
        totalPages: wordsData.totalPages || 1,
        limit: wordsData.limit || 20,
      });
      setCategories(categoriesResponse.data.data || []);
      setRatingScale(scaleResponse.data.data || { min: 0, max: 100, step: 5 });
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = async (wordData) => {
    try {
      if (selectedWord) {
        await powerWordApi.updatePowerWord(selectedWord.id, wordData);
        showToast("success", "Power word updated successfully");
      } else {
        await powerWordApi.createPowerWord(wordData);
        showToast("success", "Power word created successfully");
      }
      setShowForm(false);
      setSelectedWord(null);
      loadData();
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to save power word"));
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await powerWordApi.deletePowerWord(id);
      showToast("success", "Power word deleted successfully");
      loadData();
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to delete power word"));
    }
  };

  const handleEditWord = (word) => {
    setSelectedWord(word);
    setShowForm(true);
  };

  const handleCategoryUpdate = async () => {
    try {
      const categoriesResponse = await powerWordApi.getCategories();
      
      // Log category response for debugging
      console.log("Categories updated:", categoriesResponse);
      
      // Make sure we're using the correct data structure
      if (categoriesResponse.data && categoriesResponse.data.data) {
        setCategories(categoriesResponse.data.data);
      } else {
        console.error("Unexpected category response format:", categoriesResponse);
        setCategories(categoriesResponse.data || []);
      }
      
      // Reload all data to ensure power words display the updated categories
      loadData();
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to update categories"));
    }
  };

  const handleRatingUpdate = async (newScale) => {
    try {
      await powerWordApi.updateRatingScale(newScale);
      setRatingScale(newScale);
      showToast("success", "Rating scale updated successfully");
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to update rating scale"));
    }
  };

  const handleImport = async (file) => {
    try {
      const result = await powerWordApi.importPowerWords(file);
      showToast("success", `Imported ${result.data.imported} power words`);
      if (result.data.errors?.length > 0) {
        setError(`Errors: ${result.data.errors.join(", ")}`);
      }
      loadData();
      return result;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Import failed");
    }
  };

  const handleExport = async (categoryId) => {
    // Clear any previous messages
    setError(null);
    setSuccess(null);
    
    try {
      const response = await powerWordApi.exportPowerWords(categoryId);
      console.log("Export response:", response);
      
      // Extract data - could be directly in response or in response.data
      const dataToExport = Array.isArray(response.data) ? response.data : 
                          (Array.isArray(response) ? response : []);
      
      // Convert to JSON
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json"
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `power-words-${categoryId || "all"}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      // Display success message
      setSuccess("Power words exported successfully");
    } catch (err) {
      setError(formatErrorMessage(err, "Export failed"));
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">Power Words Management</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {toast && (
        <Alert variant={toast.type} onClose={() => setToast(null)} dismissible>
          {toast.message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="words" title="Power Words">
              {showForm ? (
                <PowerWordForm
                  word={selectedWord}
                  categories={categories}
                  onSave={handleSaveWord}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedWord(null);
                  }}
                  ratingScale={ratingScale}
                />
              ) : (
                <PowerWordsList
                  words={powerWords}
                  categories={categories}
                  onEdit={handleEditWord}
                  onDelete={handleDeleteWord}
                  onAddNew={() => setShowForm(true)}
                  onImport={handleImport}
                  onExport={handleExport}
                  onFilterChange={handleFilterChange}
                  filters={filters}
                  paginationInfo={paginationInfo}
                  onPageChange={handlePageChange}
                  setError={setError}
                  showToast={showToast}
                />
              )}
            </Tab>
            <Tab eventKey="categories" title="Categories">
              <CategoriesList
                categories={categories}
                onUpdate={handleCategoryUpdate}
                setError={setError}
                showToast={showToast}
              />
            </Tab>
            <Tab eventKey="config" title="Rating Configuration">
              <RatingConfig
                currentScale={ratingScale}
                onUpdate={handleRatingUpdate}
                setError={setError}
                showToast={showToast}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PowerWordsManagement;
