// src/components/admin/powerWords/RatingConfig.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

const RatingConfig = ({ currentScale, onUpdate, setError, showToast }) => {
  const [config, setConfig] = useState({
    min: 1,
    max: 100,
    default: 70
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize with current scale from props
  useEffect(() => {
    if (currentScale) {
      setConfig({
        min: currentScale.min || 1,
        max: currentScale.max || 5,
        default: currentScale.default || 3
      });
    }
    setLoading(false);
  }, [currentScale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = parseInt(value, 10);
    
    // Ensure the value is within bounds
    if (name === 'min') {
      if (parsedValue < 0) parsedValue = 0;
      if (parsedValue > 50) parsedValue = 50;
    } else if (name === 'max') {
      if (parsedValue < config.min + 1) parsedValue = config.min + 1;
      if (parsedValue > 100) parsedValue = 100;
    } else if (name === 'default') {
      if (parsedValue < config.min) parsedValue = config.min;
      if (parsedValue > config.max) parsedValue = config.max;
    }
    
    setConfig({
      ...config,
      [name]: parsedValue
    });
  };

  const handleSubmit = async (e) => {
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
    
    try {
      // Call the onUpdate prop with the new config
      await onUpdate(config);
      setSuccessMessage('Rating configuration updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to update rating configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
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
        
        <div className="alert alert-info">
          <strong>Note:</strong> The rating system uses a percentage scale (0-100%). 
          The percentage is converted to a star rating display (0-5 stars) in the interface.
          <div className="mt-2">
            <span className="text-warning">★★★★★</span> = 100% effective
            <span className="ms-3 text-warning">★★★☆☆</span> = 60% effective
            <span className="ms-3 text-warning">★☆☆☆☆</span> = 20% effective
          </div>
        </div>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Minimum Rating (%)</Form.Label>
            <Form.Control
              type="number"
              name="min"
              value={config.min}
              onChange={handleChange}
              min="0"
              max="50"
              required
            />
            <Form.Text className="text-muted">
              The lowest possible percentage (recommended: 0 or 1)
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Maximum Rating (%)</Form.Label>
            <Form.Control
              type="number"
              name="max"
              value={config.max}
              onChange={handleChange}
              min="2"
              max="100"
              required
            />
            <Form.Text className="text-muted">
              The highest possible percentage (recommended: 100)
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Default Rating (%)</Form.Label>
            <Form.Range
              name="default" 
              value={config.default}
              onChange={handleChange}
              min={config.min}
              max={config.max}
              step="1"
            />
            <div className="d-flex justify-content-between align-items-center mt-2">
              <Form.Control
                type="number"
                name="default"
                value={config.default}
                onChange={handleChange}
                min={config.min}
                max={config.max}
                required
                style={{maxWidth: "100px"}}
              />
              <div className="ms-2 text-warning">
                {Array(5).fill(null).map((_, i) => (
                  <span key={i}>{i < Math.round((config.default / 100) * 5) ? "★" : "☆"}</span>
                ))}
              </div>
            </div>
            <Form.Text className="text-muted">
              The default percentage effectiveness assigned to new power words
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