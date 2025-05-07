// src/components/admin/powerWords/PowerWordForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  createPowerWord,
  updatePowerWord,
  getRatingConfig,
} from "../../../services/api/powerWordApi";

const PowerWordForm = ({ word, categories, onSubmit, setError, showToast }) => {
  const [formData, setFormData] = useState({
    word: "",
    categoryId: "",
    effectivenessRating: 3,
    description: "",
    example: "",
  });

  const [ratingConfig, setRatingConfig] = useState({ min: 1, max: 5 });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    // Load rating configuration
    const loadRatingConfig = async () => {
      try {
        const response = await getRatingConfig();
        setRatingConfig(response.data.data);

        // Set default rating if not editing
        if (!word) {
          setFormData((prev) => ({
            ...prev,
            effectivenessRating: response.data.data.default,
          }));
        }
      } catch (err) {
        setError("Failed to load rating configuration");
      }
    };

    loadRatingConfig();

    // If editing, populate form with word data
    if (word) {
      setFormData({
        word: word.word || "",
        categoryId: word.categoryId || "",
        effectivenessRating: word.effectivenessRating || 3,
        description: word.description || "",
        example: word.example || "",
      });
    }
  }, [word, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "effectivenessRating" ? parseInt(value) : value,
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
      if (word) {
        // Update existing word
        await updatePowerWord(word.id, formData);
        showToast("success", "Power word updated successfully");
      } else {
        // Create new word
        await createPowerWord(formData);
        showToast("success", "Power word created successfully");
      }

      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save power word");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingOptions = () => {
    const options = [];
    for (let i = ratingConfig.min; i <= ratingConfig.max; i++) {
      options.push(
        <option key={i} value={i}>
          {i} - {"★".repeat(i)}
        </option>
      );
    }
    return options;
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Word *</Form.Label>
        <Form.Control
          type="text"
          name="word"
          value={formData.word}
          onChange={handleChange}
          required
          placeholder="Enter power word"
        />
        <Form.Control.Feedback type="invalid">
          Power word is required
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Effectiveness Rating</Form.Label>
        <Form.Select
          name="effectivenessRating"
          value={formData.effectivenessRating}
          onChange={handleChange}
        >
          {renderRatingOptions()}
        </Form.Select>
        <Form.Text className="text-muted">
          Higher rating means more effective in subject lines
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe why this is an effective power word"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Example Usage</Form.Label>
        <Form.Control
          type="text"
          name="example"
          value={formData.example}
          onChange={handleChange}
          placeholder="Example: 'Exclusive offer just for you'"
        />
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
          ) : word ? (
            "Update Power Word"
          ) : (
            "Add Power Word"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PowerWordForm;
