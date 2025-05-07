// src/components/admin/powerWords/RatingConfig.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import {
  getRatingConfig,
  updateRatingConfig,
} from "../../../services/api/powerWordApi";

const RatingConfig = ({ setError, showToast }) => {
  const [config, setConfig] = useState({
    min: 1,
    max: 5,
    default: 3,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await getRatingConfig();
        setConfig(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load rating configuration"
        );
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: parseInt(value),
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

    // Additional validation
    if (config.min >= config.max) {
      setError("Minimum rating must be less than maximum rating");
      return;
    }

    if (config.default < config.min || config.default > config.max) {
      setError("Default rating must be within min-max range");
      return;
    }

    setSaving(true);

    try {
      await updateRatingConfig(config);
      showToast("success", "Rating configuration updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update rating configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (count) => {
    return "★".repeat(count);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h3>Effectiveness Rating Configuration</h3>
      </Card.Header>
      <Card.Body>
        <p className="mb-4">
          Configure how effectiveness ratings work for power words. These
          settings will affect how power words are scored and displayed
          throughout the application.
        </p>

        <Alert variant="info">
          <Alert.Heading>How ratings affect subject line scoring</Alert.Heading>
          <p>
            Power words with higher effectiveness ratings have a greater
            positive impact on the overall subject line score. Changing these
            settings may affect existing analysis results.
          </p>
        </Alert>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Minimum Rating</Form.Label>
                <Form.Control
                  type="number"
                  name="min"
                  value={config.min}
                  onChange={handleChange}
                  min={1}
                  max={config.max - 1}
                  required
                />
                <Form.Text>
                  Currently: {config.min} {renderStars(config.min)}
                </Form.Text>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Maximum Rating</Form.Label>
                <Form.Control
                  type="number"
                  name="max"
                  value={config.max}
                  onChange={handleChange}
                  min={config.min + 1}
                  max={10}
                  required
                />
                <Form.Text>
                  Currently: {config.max} {renderStars(config.max)}
                </Form.Text>
              </Form.Group>
            </div>

            <div className="col-md-4">
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
                <Form.Text>
                  Currently: {config.default} {renderStars(config.default)}
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RatingConfig;
