// src/components/admin/powerWords/CategoriesList.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import * as powerWordApi from "../../../services/api/powerWordApi";

const CategoriesList = ({ categories: propCategories, onUpdate, setError, showToast }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use categories from props
  useEffect(() => {
    console.log("Categories from props:", propCategories);
    setCategories(propCategories || []);
    setLoading(false);
  }, [propCategories]);

  // Load categories from API (as a fallback)
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await powerWordApi.getCategories();
      console.log("API response:", response);
      setCategories(response.data.data || []);
      
      // Notify parent component that categories have been updated
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError((err.response?.data?.error || err.message || "Failed to load categories").toString());
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactBadge = (impact) => {
    // Handle case where impact might be in the 'order' field for older entries
    let displayImpact = impact;
    
    // Display default if no impact provided
    if (!impact) {
      displayImpact = 'medium'; // Default
    }
    
    // If still not set, default to "medium"
    if (!displayImpact) displayImpact = 'medium';
    
    const colors = {
      high: "danger",
      medium: "warning",
      low: "info",
    };

    return <Badge bg={colors[displayImpact] || "secondary"}>{displayImpact}</Badge>;
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };
  
  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      // Call API to delete category
      await powerWordApi.deleteCategory(selectedCategory.id);
      
      // Remove from local state
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      showToast('success', 'Category deleted successfully');
      
      // Notify parent component to update categories
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      
      // Detailed error handling
      let errorMessage = 'Failed to delete category';
      
      // Deeply nested error object handling - some APIs nest errors in response.data.error.message
      if (error.response?.data) {
        const apiError = error.response.data;
        
        if (typeof apiError === 'object') {
          // Handle nested error object with message property
          if (apiError.error && typeof apiError.error === 'object' && apiError.error.message) {
            errorMessage = apiError.error.message;
          }
          // Handle direct message property
          else if (apiError.message) {
            errorMessage = apiError.message;
          }
          // Handle error as string property
          else if (apiError.error && typeof apiError.error === 'string') {
            errorMessage = apiError.error;
          }
          // Fallback to stringify entire error object
          else {
            errorMessage = JSON.stringify(apiError);
          }
          
          // Check if this is the "cannot delete category with assigned words" error
          if (errorMessage.includes("Cannot delete category with assigned words")) {
            errorMessage = "This category has power words assigned to it. Please reassign or delete those words first.";
          }
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setShowDeleteModal(false);
    }
  };
  
  const CategoryForm = () => {
    // Use useEffect to update form when selectedCategory changes
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      impact: 'medium'
    });
    
    // Update form data when selectedCategory changes
    useEffect(() => {
      if (selectedCategory) {
        setFormData({
          name: selectedCategory.name || '',
          description: selectedCategory.description || '',
          impact: selectedCategory.impact || 'medium'
        });
      }
    }, [selectedCategory]);
    const [formLoading, setFormLoading] = useState(false);
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormLoading(true);
      
      try {
        let result;
        
        if (selectedCategory) {
          // Update existing category via API
          result = await powerWordApi.updateCategory(selectedCategory.id, formData);
          showToast('success', 'Category updated successfully');
          console.log("Updated category result:", result);
        } else {
          // Add new category via API
          result = await powerWordApi.createCategory(formData);
          showToast('success', 'Category added successfully');
          console.log("New category result:", result);
        }
        
        // Notify parent component to update categories
        if (onUpdate) {
          onUpdate();
        } else {
          // Fallback to local reload if no onUpdate provided
          loadCategories();
        }
        
        setShowForm(false);
        setSelectedCategory(null);
      } catch (error) {
        console.error("Error saving category:", error);
        
        const defaultMsg = selectedCategory ? 'Failed to update category' : 'Failed to add category';
        let errorMessage = defaultMsg;
        
        // Handle API error response
        if (error.response?.data) {
          const apiError = error.response.data;
          
          if (typeof apiError === 'object') {
            // If it has a message property (common API error format)
            if (apiError.message) {
              errorMessage = apiError.message;
            } 
            // Error might be in the error property
            else if (apiError.error) {
              errorMessage = typeof apiError.error === 'string' 
                ? apiError.error 
                : JSON.stringify(apiError.error);
            }
            // Fallback to stringifying the object
            else {
              errorMessage = JSON.stringify(apiError);
            }
          } else if (typeof apiError === 'string') {
            errorMessage = apiError;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setFormLoading(false);
      }
    };
    
    return (
      <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
        <h3>{selectedCategory ? 'Edit Category' : 'Add New Category'}</h3>
        
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea"
            rows={2}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Impact</Form.Label>
          <Form.Select
            name="impact"
            value={formData.impact}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
        </Form.Group>
        
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading ? <Spinner size="sm" animation="border" /> : 'Save'}
          </Button>
        </div>
      </Form>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          Add Category
        </Button>
      </div>

      {showForm && <CategoryForm />}

      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Impact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{getImpactBadge(category.impact)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditCategory(category)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category{" "}
          <strong>{selectedCategory?.name}</strong>?
          <p className="text-danger mt-2">
            This will affect all power words in this category.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteCategory}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoriesList;
