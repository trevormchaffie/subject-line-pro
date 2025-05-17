import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useSettings } from "../../../context/SettingsContext";

const EmailSettings = () => {
  const {
    emailSettings,
    updateEmailSettings,
    sendTestEmail,
    isSaving,
    saveError,
  } = useSettings();
  const [formData, setFormData] = useState({
    smtpServer: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    enableSSL: true,
    fromEmail: "",
    fromName: "",
    replyToEmail: "",
    notificationFrequency: "immediate",
    emailTemplateId: "default",
    includeCompanyLogo: true,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  // Email template options
  const emailTemplates = [
    { value: "default", label: "Default Template" },
    { value: "minimal", label: "Minimal Template" },
    { value: "professional", label: "Professional Template" },
    { value: "marketing", label: "Marketing Template" },
  ];

  // Notification frequency options
  const notificationFrequencies = [
    { value: "immediate", label: "Immediate" },
    { value: "hourly", label: "Hourly Digest" },
    { value: "daily", label: "Daily Digest" },
    { value: "weekly", label: "Weekly Digest" },
  ];

  // Initialize form when settings are loaded
  useEffect(() => {
    if (emailSettings) {
      setFormData({
        smtpServer: emailSettings.smtpServer || "",
        smtpPort: emailSettings.smtpPort || 587,
        smtpUsername: emailSettings.smtpUsername || "",
        smtpPassword: emailSettings.smtpPassword || "",
        enableSSL: emailSettings.enableSSL !== false,
        fromEmail: emailSettings.fromEmail || "",
        fromName: emailSettings.fromName || "",
        replyToEmail: emailSettings.replyToEmail || "",
        notificationFrequency:
          emailSettings.notificationFrequency || "immediate",
        emailTemplateId: emailSettings.emailTemplateId || "default",
        includeCompanyLogo: emailSettings.includeCompanyLogo !== false,
      });
      setIsDirty(false);
    }
  }, [emailSettings]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const validateForm = () => {
    if (!formData.smtpServer.trim()) {
      setFormError("SMTP server is required");
      return false;
    }

    if (
      !formData.smtpPort ||
      formData.smtpPort < 1 ||
      formData.smtpPort > 65535
    ) {
      setFormError("SMTP port must be between 1 and 65535");
      return false;
    }

    if (!formData.fromEmail.trim()) {
      setFormError("From email address is required");
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.fromEmail)) {
      setFormError("Please enter a valid from email address");
      return false;
    }

    if (formData.replyToEmail && !emailRegex.test(formData.replyToEmail)) {
      setFormError("Please enter a valid reply-to email address");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateEmailSettings(formData);
      setIsDirty(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving email settings:", error);
    }
  };

  const handleReset = () => {
    if (emailSettings) {
      setFormData({
        smtpServer: emailSettings.smtpServer || "",
        smtpPort: emailSettings.smtpPort || 587,
        smtpUsername: emailSettings.smtpUsername || "",
        smtpPassword: emailSettings.smtpPassword || "",
        enableSSL: emailSettings.enableSSL !== false,
        fromEmail: emailSettings.fromEmail || "",
        fromName: emailSettings.fromName || "",
        replyToEmail: emailSettings.replyToEmail || "",
        notificationFrequency:
          emailSettings.notificationFrequency || "immediate",
        emailTemplateId: emailSettings.emailTemplateId || "default",
        includeCompanyLogo: emailSettings.includeCompanyLogo !== false,
      });
      setIsDirty(false);
      setFormError("");
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();

    if (!testEmail.trim()) {
      setTestEmailResult({
        success: false,
        message: "Test email address is required",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setTestEmailResult({
        success: false,
        message: "Please enter a valid email address",
      });
      return;
    }

    setTestingEmail(true);
    setTestEmailResult(null);

    try {
      const result = await sendTestEmail(testEmail);
      setTestEmailResult({
        success: true,
        message: "Test email sent successfully!",
      });
    } catch (error) {
      setTestEmailResult({
        success: false,
        message: "Failed to send test email. Check SMTP settings.",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (!emailSettings) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Email Settings</h5>
      </Card.Header>
      <Card.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && (
          <Alert variant="success">Email settings saved successfully!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <h6 className="text-primary mb-3">SMTP Configuration</h6>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>
                  SMTP Server <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="smtpServer"
                  value={formData.smtpServer}
                  onChange={handleChange}
                  placeholder="smtp.example.com"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  SMTP Port <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                  min={1}
                  max={65535}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>SMTP Username</Form.Label>
                <Form.Control
                  type="text"
                  name="smtpUsername"
                  value={formData.smtpUsername}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>SMTP Password</Form.Label>
                <Form.Control
                  type="password"
                  name="smtpPassword"
                  value={formData.smtpPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="enableSSL"
              name="enableSSL"
              label="Enable SSL/TLS"
              checked={formData.enableSSL}
              onChange={handleChange}
            />
          </Form.Group>

          <h6 className="text-primary mb-3">Email Identity</h6>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  From Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="fromEmail"
                  value={formData.fromEmail}
                  onChange={handleChange}
                  placeholder="noreply@yourcompany.com"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>From Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fromName"
                  value={formData.fromName}
                  onChange={handleChange}
                  placeholder="Subject Line Pro"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Reply-To Email</Form.Label>
            <Form.Control
              type="email"
              name="replyToEmail"
              value={formData.replyToEmail}
              onChange={handleChange}
              placeholder="support@yourcompany.com"
            />
            <Form.Text className="text-muted">
              Leave empty to use the From Email address as Reply-To
            </Form.Text>
          </Form.Group>

          <h6 className="text-primary mb-3">Notification Settings</h6>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email Template</Form.Label>
                <Form.Select
                  name="emailTemplateId"
                  value={formData.emailTemplateId}
                  onChange={handleChange}
                >
                  {emailTemplates.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Notification Frequency</Form.Label>
                <Form.Select
                  name="notificationFrequency"
                  value={formData.notificationFrequency}
                  onChange={handleChange}
                >
                  {notificationFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="includeCompanyLogo"
              name="includeCompanyLogo"
              label="Include company logo in emails"
              checked={formData.includeCompanyLogo}
              onChange={handleChange}
            />
          </Form.Group>

          <Card className="mb-4 bg-light">
            <Card.Body>
              <h6 className="text-primary mb-3">Send Test Email</h6>
              <Row>
                <Col md={8}>
                  <InputGroup className="mb-2">
                    <Form.Control
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter email address for testing"
                    />
                    <Button
                      variant="outline-primary"
                      onClick={handleTestEmail}
                      disabled={
                        testingEmail ||
                        !formData.smtpServer ||
                        !formData.fromEmail
                      }
                    >
                      {testingEmail ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Sending...
                        </>
                      ) : (
                        "Send Test"
                      )}
                    </Button>
                  </InputGroup>
                  {testEmailResult && (
                    <Alert
                      variant={testEmailResult.success ? "success" : "danger"}
                      className="py-2"
                    >
                      {testEmailResult.message}
                    </Alert>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

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

export default EmailSettings;
