// src/components/admin/powerWords/RatingConfig.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

const RatingConfig = ({ setError, showToast }) => {
  const [config, setConfig] = useState({
    min: 1,
    max: 5,
    default: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Simulated data fetch
  useEffect(() => {
    setTimeout(() => {
      setConfig({
        min: 1,
        max: 5,
        default: 3
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: parseInt(value, 10)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Validation
    if (config.min >= config.max) {
      setError('Minimum rating must be less than maximum rating');
      setSaving(false);
      return;
    }
    
    if (config.default < config.min || config.default > config.max) {
      setError('Default rating must be within the min-max range');
      setSaving(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage('Rating configuration updated successfully');
      showToast('success', 'Rating configuration updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h3>Rating Scale Configuration</h3>
      </Card.Header>
      <Card.Body>
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}
        
        <p className="text-muted">
          Configure the effectiveness rating scale for power words. These settings will be applied globally.
        </p>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Minimum Rating</Form.Label>
            <Form.Control
              type="number"
              name="min"
              value={config.min}
              onChange={handleChange}
              min="1"
              max="9"
              required
            />
            <Form.Text className="text-muted">
              The lowest possible rating (minimum 1)
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Maximum Rating</Form.Label>
            <Form.Control
              type="number"
              name="max"
              value={config.max}
              onChange={handleChange}
              min="2"
              max="10"
              required
            />
            <Form.Text className="text-muted">
              The highest possible rating (maximum 10)
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Default Rating</Form.Label>
            <Form.Control
              type="number"
              name="default"
              value={config.default}
              onChange={handleChange}
              min={config.min}
              max={config.max}
              required
            />
            <Form.Text className="text-muted">
              The default rating assigned to new power words
            </Form.Text>
          </Form.Group>
          
          <div className="mt-4">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={saving}
            >
              {saving ? <Spinner animation="border" size="sm" /> : 'Save Configuration'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RatingConfig;