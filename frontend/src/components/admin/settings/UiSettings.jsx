import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useSettings } from "../../../context/SettingsContext";

const UiSettings = () => {
  const { uiSettings, updateUiSettings, isSaving, saveError } = useSettings();
  const [formData, setFormData] = useState({
    theme: "light",
    primaryColor: "#0d6efd",
    secondaryColor: "#6c757d",
    dashboardLayout: "default",
    fontSize: "medium",
    showHelp: true,
    enableAnimations: true
  });

  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showColorPickers, setShowColorPickers] = useState({
    primary: false,
    secondary: false,
  });

  // Dashboard layout options
  const dashboardLayouts = [
    { value: "default", label: "Default Layout" },
    { value: "compact", label: "Compact View" },
    { value: "analytics", label: "Analytics Focus" },
    { value: "leads", label: "Lead Management Focus" },
  ];

  // Font size options
  const fontSizes = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium (Default)" },
    { value: "large", label: "Large" },
  ];

  // Initialize form when settings are loaded
  useEffect(() => {
    if (uiSettings) {
      setFormData({
        theme: uiSettings.theme || "light",
        primaryColor: uiSettings.primaryColor || "#0d6efd",
        secondaryColor: uiSettings.secondaryColor || "#6c757d",
        dashboardLayout: uiSettings.dashboardLayout || "default",
        fontSize: uiSettings.fontSize || "medium",
        showHelp: uiSettings.showHelp !== false,
        enableAnimations: uiSettings.enableAnimations !== false
      });
      setIsDirty(false);
    }
  }, [uiSettings]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const validateForm = () => {
    // Color validation - ensure they are valid hex colors
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    if (!hexColorRegex.test(formData.primaryColor)) {
      setFormError(
        "Primary color must be a valid hex color code (e.g. #0d6efd)"
      );
      return false;
    }

    if (!hexColorRegex.test(formData.secondaryColor)) {
      setFormError(
        "Secondary color must be a valid hex color code (e.g. #6c757d)"
      );
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateUiSettings(formData);
      setIsDirty(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving UI settings:", error);
    }
  };

  const handleReset = () => {
    if (uiSettings) {
      setFormData({
        theme: uiSettings.theme || "light",
        primaryColor: uiSettings.primaryColor || "#0d6efd",
        secondaryColor: uiSettings.secondaryColor || "#6c757d",
        dashboardLayout: uiSettings.dashboardLayout || "default",
        fontSize: uiSettings.fontSize || "medium",
        showHelp: uiSettings.showHelp !== false,
        enableAnimations: uiSettings.enableAnimations !== false
      });
      setIsDirty(false);
      setFormError("");
    }
  };

  // Toggle color picker visibility
  const toggleColorPicker = (colorType) => {
    setShowColorPickers((prev) => ({
      ...prev,
      [colorType]: !prev[colorType],
    }));
  };

  if (!uiSettings) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  // Preview styles based on current form data
  const themePreviewStyle = {
    backgroundColor: formData.theme === "light" ? "#ffffff" : "#343a40",
    color: formData.theme === "light" ? "#343a40" : "#ffffff",
    padding: "1rem",
    borderRadius: "0.25rem",
    marginTop: "1rem",
    marginBottom: "1rem",
  };

  const primaryButtonStyle = {
    backgroundColor: formData.primaryColor,
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    backgroundColor: formData.secondaryColor,
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    marginLeft: "0.5rem",
    cursor: "pointer",
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">UI Settings</h5>
      </Card.Header>
      <Card.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && (
          <Alert variant="success">UI settings saved successfully!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <h6 className="text-primary mb-3">Theme Settings</h6>

          <Form.Group className="mb-3">
            <Form.Label>Theme</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                id="theme-light"
                name="theme"
                value="light"
                label="Light"
                checked={formData.theme === "light"}
                onChange={handleChange}
                className="me-3"
              />
              <Form.Check
                inline
                type="radio"
                id="theme-dark"
                name="theme"
                value="dark"
                label="Dark"
                checked={formData.theme === "dark"}
                onChange={handleChange}
              />
            </div>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Primary Color</Form.Label>
                <div className="d-flex">
                  <div
                    className="color-preview me-2"
                    style={{
                      backgroundColor: formData.primaryColor,
                      width: "30px",
                      height: "30px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: "1px solid #ced4da",
                    }}
                    onClick={() => toggleColorPicker("primary")}
                  ></div>
                  <Form.Control
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleColorChange}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#0d6efd"
                  />
                </div>
                {showColorPickers.primary && (
                  <div className="mt-2">
                    <Form.Control
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        handleColorChange({
                          target: {
                            name: "primaryColor",
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-100"
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Secondary Color</Form.Label>
                <div className="d-flex">
                  <div
                    className="color-preview me-2"
                    style={{
                      backgroundColor: formData.secondaryColor,
                      width: "30px",
                      height: "30px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: "1px solid #ced4da",
                    }}
                    onClick={() => toggleColorPicker("secondary")}
                  ></div>
                  <Form.Control
                    type="text"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleColorChange}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#6c757d"
                  />
                </div>
                {showColorPickers.secondary && (
                  <div className="mt-2">
                    <Form.Control
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        handleColorChange({
                          target: {
                            name: "secondaryColor",
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-100"
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Default Dashboard Layout</Form.Label>
                <Form.Select
                  name="dashboardLayout"
                  value={formData.dashboardLayout}
                  onChange={handleChange}
                >
                  {dashboardLayouts.map((layout) => (
                    <option key={layout.value} value={layout.value}>
                      {layout.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Font Size</Form.Label>
                <Form.Select
                  name="fontSize"
                  value={formData.fontSize}
                  onChange={handleChange}
                >
                  {fontSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <h6 className="text-primary mb-3">Theme Preview</h6>

          <div style={themePreviewStyle}>
            <h5>Sample Dashboard</h5>
            <p
              style={{
                fontSize:
                  formData.fontSize === "small"
                    ? "0.875rem"
                    : formData.fontSize === "large"
                    ? "1.125rem"
                    : "1rem",
              }}
            >
              This is how your dashboard will appear with the selected theme
              settings.
            </p>
            <div>
              <button style={primaryButtonStyle}>Primary Button</button>
              <button style={secondaryButtonStyle}>Secondary Button</button>
            </div>
          </div>

          <h6 className="text-primary mb-3 mt-4">Feature Toggles</h6>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="showHelp"
              name="showHelp"
              label="Show Help Guides"
              checked={formData.showHelp}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="enableAnimations"
              name="enableAnimations"
              label="Enable UI Animations"
              checked={formData.enableAnimations}
              onChange={handleChange}
            />
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

export default UiSettings;
