// src/components/admin/powerWords/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  createCategory,
  updateCategory,
} from "../../../services/api/powerWordApi";

const CategoryForm = ({ category, onSubmit, setError, showToast }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    impact: "medium",
  });

  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        impact: category.impact || "medium",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);

    try {
      if (category) {
        await updateCategory(category.id, formData);
        showToast("success", "Category updated successfully");
      } else {
        await createCategory(formData);
        showToast("success", "Category created successfully");
      }

      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter category name"
        />
        <Form.Control.Feedback type="invalid">
          Category name is required
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe this category of power words"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Impact Level</Form.Label>
        <Form.Select
          name="impact"
          value={formData.impact}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Form.Select>
        <Form.Text className="text-muted">
          How much impact do words in this category have on open rates?
        </Form.Text>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              Saving...
            </>
          ) : category ? (
            "Update Category"
          ) : (
            "Add Category"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CategoryForm;
