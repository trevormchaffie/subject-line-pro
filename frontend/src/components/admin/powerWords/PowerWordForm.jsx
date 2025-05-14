// src/components/admin/powerWords/PowerWordForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const PowerWordForm = ({ word, categories, onSave, onCancel, ratingScale }) => {
  const [formData, setFormData] = useState({
    word: '',
    categoryId: '',
    effectivenessRating: ratingScale?.default || 3,
    description: '',
    usage: ''  // Changed from 'example' to 'usage' to match backend field name
  });
  const [loading, setLoading] = useState(false);

  // Load data if editing an existing word
  useEffect(() => {
    if (word) {
      console.log("Loading word data for editing:", word);
      setFormData({
        word: word.word || '',
        categoryId: word.categoryId || '',
        effectivenessRating: word.effectiveness || ratingScale?.default || 3, // Use rating scale default
        description: word.description || '',
        usage: word.usage || ''  // Changed from 'example' to 'usage' to match backend field
      });
    } else {
      // Reset to defaults for new words, using rating scale
      setFormData(prev => ({
        ...prev,
        effectivenessRating: ratingScale?.default || 3
      }));
    }
  }, [word, ratingScale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numerical inputs to integers
    if (name === 'effectivenessRating') {
      parsedValue = parseInt(value, 10);
      
      // Ensure value is within min/max bounds
      const min = ratingScale?.min || 0;
      const max = ratingScale?.max || 100;
      if (parsedValue < min) parsedValue = min;
      if (parsedValue > max) parsedValue = max;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
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
      
      // Pass data back to parent component
      await onSave(formData);
    } catch (err) {
      console.error("Error saving power word:", err);
      // No longer trying to call setError directly
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
        <Form.Label>{`Effectiveness Rating (${ratingScale?.min || 0}-${ratingScale?.max || 100}%)`}</Form.Label>
        <Form.Range
          name="effectivenessRating"
          value={formData.effectivenessRating}
          onChange={handleChange}
          min={ratingScale?.min || 0}
          max={ratingScale?.max || 100}
          step="1"
        />
        <div className="d-flex justify-content-between align-items-center">
          <Form.Control
            type="number"
            name="effectivenessRating"
            value={formData.effectivenessRating}
            onChange={handleChange}
            min={ratingScale?.min || 0}
            max={ratingScale?.max || 100}
            required
            style={{maxWidth: "100px"}}
          />
          <div className="ms-2 text-warning">
            {Array(5).fill(null).map((_, i) => (
              <span key={i}>{i < Math.round((formData.effectivenessRating / 100) * 5) ? "★" : "☆"}</span>
            ))}
          </div>
        </div>
        <Form.Text className="text-muted">
          Rate how effective this word is in email subject lines on a percentage scale (higher is better)
        </Form.Text>
        <div className="alert alert-info small mt-2 mb-0 p-2">
          <strong>Note:</strong> 100% = 5 stars, 60% = 3 stars, 20% = 1 star in the display
        </div>
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
        <Form.Label>Usage</Form.Label>
        <Form.Control
          type="text"
          name="usage"
          value={formData.usage}
          onChange={handleChange}
          placeholder="Example: 'Creates urgency in subject lines'"
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : (word ? 'Update' : 'Create')}
        </Button>
      </div>
    </Form>
  );
};

export default PowerWordForm;