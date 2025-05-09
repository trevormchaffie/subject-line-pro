// src/components/admin/powerWords/PowerWordForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const PowerWordForm = ({ word, categories, onSubmit, setError, showToast }) => {
  const [formData, setFormData] = useState({
    word: '',
    categoryId: '',
    effectivenessRating: 3,
    description: '',
    example: ''
  });
  const [loading, setLoading] = useState(false);

  // Load data if editing an existing word
  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word || '',
        categoryId: word.categoryId || '',
        effectivenessRating: word.effectivenessRating || 3,
        description: word.description || '',
        example: word.example || ''
      });
    }
  }, [word]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'effectivenessRating' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.word.trim()) {
        throw new Error('Power word is required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pass data back to parent component
      onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save power word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Word</Form.Label>
        <Form.Control
          type="text"
          name="word"
          value={formData.word}
          onChange={handleChange}
          required
          placeholder="Enter power word"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        >
          <option value="">No Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Effectiveness Rating (1-5)</Form.Label>
        <Form.Control
          type="number"
          name="effectivenessRating"
          value={formData.effectivenessRating}
          onChange={handleChange}
          min="1"
          max="5"
          required
        />
        <Form.Text className="text-muted">
          Rate how effective this word is in email subject lines
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
          placeholder="Describe how this word affects readers"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Example Usage</Form.Label>
        <Form.Control
          type="text"
          name="example"
          value={formData.example}
          onChange={handleChange}
          placeholder="Example: 'Get exclusive access to our sale'"
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : (word ? 'Update' : 'Create')}
        </Button>
      </div>
    </Form>
  );
};

export default PowerWordForm;