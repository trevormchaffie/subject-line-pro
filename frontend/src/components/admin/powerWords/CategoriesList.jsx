// src/components/admin/powerWords/CategoriesList.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Badge, Modal } from "react-bootstrap";
import {
  getCategories,
  deleteCategory,
} from "../../../services/api/powerWordApi";
import CategoryForm from "./CategoryForm";

const CategoriesList = ({ setError, showToast }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [setError]);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteCategory(confirmDelete.id);
      loadCategories();
      showToast("success", "Category deleted successfully");
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleFormSubmit = () => {
    loadCategories();
    setShowAddModal(false);
    setEditingCategory(null);
  };

  const getImpactBadge = (impact) => {
    const variants = {
      low: "secondary",
      medium: "primary",
      high: "danger",
    };

    return <Badge bg={variants[impact] || "secondary"}>{impact}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{getImpactBadge(category.impact)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setConfirmDelete(category)}
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

      {/* Add/Edit Modal */}
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "Edit Category" : "Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleFormSubmit}
            setError={setError}
            showToast={showToast}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category "
          <strong>{confirmDelete?.name}</strong>"?
          <div className="alert alert-warning mt-3">
            Note: You cannot delete a category that has power words assigned to
            it.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoriesList;
