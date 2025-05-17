import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useSettings } from "../../../context/SettingsContext";

const GeneralSettings = () => {
  const { generalSettings, updateGeneralSettings, isSaving, saveError } =
    useSettings();
  const [formData, setFormData] = useState({
    appName: "",
    appDescription: "",
    defaultLanguage: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Supported languages
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
  ];

  // Date format options
  const dateFormats = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  // Time format options
  const timeFormats = [
    { value: "12h", label: "12-hour (AM/PM)" },
    { value: "24h", label: "24-hour" },
  ];

  // Initialize form when settings are loaded
  useEffect(() => {
    if (generalSettings) {
      setFormData({
        appName: generalSettings.appName || "",
        appDescription: generalSettings.appDescription || "",
        defaultLanguage: generalSettings.defaultLanguage || "en",
        dateFormat: generalSettings.dateFormat || "MM/DD/YYYY",
        timeFormat: generalSettings.timeFormat || "12h",
        sessionTimeout: generalSettings.sessionTimeout || 30,
        maxLoginAttempts: generalSettings.maxLoginAttempts || 5,
      });
      setIsDirty(false);
    }
  }, [generalSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const validateForm = () => {
    if (!formData.appName.trim()) {
      setFormError("Application name is required");
      return false;
    }

    if (formData.sessionTimeout < 1 || formData.sessionTimeout > 1440) {
      setFormError("Session timeout must be between 1 and 1440 minutes");
      return false;
    }

    if (formData.maxLoginAttempts < 1 || formData.maxLoginAttempts > 10) {
      setFormError("Max login attempts must be between 1 and 10");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateGeneralSettings(formData);
      setIsDirty(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving general settings:", error);
    }
  };

  const handleReset = () => {
    if (generalSettings) {
      setFormData({
        appName: generalSettings.appName || "",
        appDescription: generalSettings.appDescription || "",
        defaultLanguage: generalSettings.defaultLanguage || "en",
        dateFormat: generalSettings.dateFormat || "MM/DD/YYYY",
        timeFormat: generalSettings.timeFormat || "12h",
        sessionTimeout: generalSettings.sessionTimeout || 30,
        maxLoginAttempts: generalSettings.maxLoginAttempts || 5,
      });
      setIsDirty(false);
      setFormError("");
    }
  };

  if (!generalSettings) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">General Settings</h5>
      </Card.Header>
      <Card.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && (
          <Alert variant="success">Settings saved successfully!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Application Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Application Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="appDescription"
              value={formData.appDescription}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Default Language</Form.Label>
                <Form.Select
                  name="defaultLanguage"
                  value={formData.defaultLanguage}
                  onChange={handleChange}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Date Format</Form.Label>
                <Form.Select
                  name="dateFormat"
                  value={formData.dateFormat}
                  onChange={handleChange}
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Time Format</Form.Label>
                <Form.Select
                  name="timeFormat"
                  value={formData.timeFormat}
                  onChange={handleChange}
                >
                  {timeFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Session Timeout (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="sessionTimeout"
                  value={formData.sessionTimeout}
                  onChange={handleChange}
                  min={1}
                  max={1440}
                />
                <Form.Text className="text-muted">
                  Between 1 and 1440 minutes (24 hours)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Maximum Login Attempts</Form.Label>
            <Form.Control
              type="number"
              name="maxLoginAttempts"
              value={formData.maxLoginAttempts}
              onChange={handleChange}
              min={1}
              max={10}
            />
            <Form.Text className="text-muted">
              Number of failed login attempts before account lockout
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!isDirty || isSaving}
            >
              {isSaving ? (
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
                "Save Changes"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GeneralSettings;
