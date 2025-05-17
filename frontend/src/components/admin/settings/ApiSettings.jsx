import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";
import { useSettings } from "../../../context/SettingsContext";

const ApiSettings = () => {
  const { apiSettings, updateApiSettings, isSaving, saveError } = useSettings();
  const [formData, setFormData] = useState({
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    apiKeys: [],
    ipWhitelist: [],
    ipBlacklist: [],
    showUsageStatistics: true,
    throttlingEnabled: true,
    throttleThreshold: 80,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New API key / IP input fields
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    key: "",
    active: true,
  });
  const [newIpAddress, setNewIpAddress] = useState("");
  const [ipType, setIpType] = useState("whitelist"); // 'whitelist' or 'blacklist'

  // Initialize form when settings are loaded
  useEffect(() => {
    if (apiSettings) {
      setFormData({
        rateLimit: {
          enabled: apiSettings.rateLimit?.enabled !== false,
          requestsPerMinute: apiSettings.rateLimit?.requestsPerMinute || 60,
          requestsPerHour: apiSettings.rateLimit?.requestsPerHour || 1000,
          requestsPerDay: apiSettings.rateLimit?.requestsPerDay || 10000,
        },
        apiKeys: apiSettings.apiKeys || [],
        ipWhitelist: apiSettings.ipWhitelist || [],
        ipBlacklist: apiSettings.ipBlacklist || [],
        showUsageStatistics: apiSettings.showUsageStatistics !== false,
        throttlingEnabled: apiSettings.throttlingEnabled !== false,
        throttleThreshold: apiSettings.throttleThreshold || 80,
      });
      setIsDirty(false);
    }
  }, [apiSettings]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Handle nested rate limit properties
    if (name.startsWith("rateLimit.")) {
      const rateLimitProp = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        rateLimit: {
          ...prev.rateLimit,
          [rateLimitProp]: type === "checkbox" ? checked : Number(value),
        },
      }));
    } else {
      // Handle regular properties
      if (type === "number") {
        newValue = Number(value);
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleApiKeyChange = (e) => {
    const { name, value } = e.target;
    setNewApiKey((prev) => ({ ...prev, [name]: value }));
  };

  const addApiKey = () => {
    if (!newApiKey.name.trim() || !newApiKey.key.trim()) {
      setFormError("API key name and key are required");
      return;
    }

    // Check for duplicates
    if (formData.apiKeys.some((key) => key.key === newApiKey.key)) {
      setFormError("API key already exists");
      return;
    }

    const updatedKeys = [
      ...formData.apiKeys,
      { ...newApiKey, id: Date.now().toString() },
    ];

    setFormData((prev) => ({ ...prev, apiKeys: updatedKeys }));
    setNewApiKey({ name: "", key: "", active: true });
    setIsDirty(true);
    setFormError("");
  };

  const removeApiKey = (keyId) => {
    const updatedKeys = formData.apiKeys.filter((key) => key.id !== keyId);
    setFormData((prev) => ({ ...prev, apiKeys: updatedKeys }));
    setIsDirty(true);
  };

  const toggleApiKeyStatus = (keyId) => {
    const updatedKeys = formData.apiKeys.map((key) => {
      if (key.id === keyId) {
        return { ...key, active: !key.active };
      }
      return key;
    });

    setFormData((prev) => ({ ...prev, apiKeys: updatedKeys }));
    setIsDirty(true);
  };

  const addIpAddress = () => {
    // Validate IP address format
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipRegex.test(newIpAddress)) {
      setFormError("Please enter a valid IP address");
      return;
    }

    // Check if IP already exists in the list
    const listName = ipType === "whitelist" ? "ipWhitelist" : "ipBlacklist";
    if (formData[listName].includes(newIpAddress)) {
      setFormError(`IP address already exists in the ${ipType}`);
      return;
    }

    const updatedList = [...formData[listName], newIpAddress];
    setFormData((prev) => ({ ...prev, [listName]: updatedList }));
    setNewIpAddress("");
    setIsDirty(true);
    setFormError("");
  };

  const removeIpAddress = (ip, listType) => {
    const listName = listType === "whitelist" ? "ipWhitelist" : "ipBlacklist";
    const updatedList = formData[listName].filter((item) => item !== ip);
    setFormData((prev) => ({ ...prev, [listName]: updatedList }));
    setIsDirty(true);
  };

  const validateForm = () => {
    // Validate rate limits
    if (formData.rateLimit.enabled) {
      if (formData.rateLimit.requestsPerMinute < 1) {
        setFormError("Requests per minute must be at least 1");
        return false;
      }

      if (
        formData.rateLimit.requestsPerHour <
        formData.rateLimit.requestsPerMinute
      ) {
        setFormError(
          "Requests per hour must be greater than or equal to requests per minute"
        );
        return false;
      }

      if (
        formData.rateLimit.requestsPerDay < formData.rateLimit.requestsPerHour
      ) {
        setFormError(
          "Requests per day must be greater than or equal to requests per hour"
        );
        return false;
      }
    }

    // Validate throttle threshold
    if (formData.throttlingEnabled) {
      if (formData.throttleThreshold < 1 || formData.throttleThreshold > 100) {
        setFormError("Throttle threshold must be between 1 and 100");
        return false;
      }
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateApiSettings(formData);
      setIsDirty(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving API settings:", error);
    }
  };

  const handleReset = () => {
    if (apiSettings) {
      setFormData({
        rateLimit: {
          enabled: apiSettings.rateLimit?.enabled !== false,
          requestsPerMinute: apiSettings.rateLimit?.requestsPerMinute || 60,
          requestsPerHour: apiSettings.rateLimit?.requestsPerHour || 1000,
          requestsPerDay: apiSettings.rateLimit?.requestsPerDay || 10000,
        },
        apiKeys: apiSettings.apiKeys || [],
        ipWhitelist: apiSettings.ipWhitelist || [],
        ipBlacklist: apiSettings.ipBlacklist || [],
        showUsageStatistics: apiSettings.showUsageStatistics !== false,
        throttlingEnabled: apiSettings.throttlingEnabled !== false,
        throttleThreshold: apiSettings.throttleThreshold || 80,
      });
      setIsDirty(false);
      setFormError("");
    }
  };

  if (!apiSettings) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">API Settings</h5>
      </Card.Header>
      <Card.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && (
          <Alert variant="success">API settings saved successfully!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <h6 className="text-primary mb-3">Rate Limiting</h6>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="rateLimitEnabled"
              name="rateLimit.enabled"
              label="Enable rate limiting"
              checked={formData.rateLimit.enabled}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Limit the number of API requests that can be made in a given time
              period
            </Form.Text>
          </Form.Group>

          {formData.rateLimit.enabled && (
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Requests per minute</Form.Label>
                  <Form.Control
                    type="number"
                    name="rateLimit.requestsPerMinute"
                    value={formData.rateLimit.requestsPerMinute}
                    onChange={handleChange}
                    min={1}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Requests per hour</Form.Label>
                  <Form.Control
                    type="number"
                    name="rateLimit.requestsPerHour"
                    value={formData.rateLimit.requestsPerHour}
                    onChange={handleChange}
                    min={1}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Requests per day</Form.Label>
                  <Form.Control
                    type="number"
                    name="rateLimit.requestsPerDay"
                    value={formData.rateLimit.requestsPerDay}
                    onChange={handleChange}
                    min={1}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          <h6 className="text-primary mb-3">API Keys</h6>

          <Card className="mb-4">
            <Card.Body>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Key Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newApiKey.name}
                      onChange={handleApiKeyChange}
                      placeholder="e.g. Production API Key"
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>API Key</Form.Label>
                    <Form.Control
                      type="text"
                      name="key"
                      value={newApiKey.key}
                      onChange={handleApiKeyChange}
                      placeholder="Enter API key"
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={addApiKey}
                    disabled={!newApiKey.name || !newApiKey.key}
                  >
                    Add Key
                  </Button>
                </Col>
              </Row>

              {formData.apiKeys.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td>{key.name}</td>
                        <td>
                          <code>
                            {key.key.substring(0, 8)}...
                            {key.key.substring(key.key.length - 4)}
                          </code>
                        </td>
                        <td>
                          <Badge bg={key.active ? "success" : "danger"}>
                            {key.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => toggleApiKeyStatus(key.id)}
                          >
                            {key.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeApiKey(key.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No API keys have been added yet.</Alert>
              )}
            </Card.Body>
          </Card>

          <h6 className="text-primary mb-3">IP Restrictions</h6>

          <Card className="mb-4">
            <Card.Body>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>IP Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      placeholder="e.g. 192.168.1.1"
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>List Type</Form.Label>
                    <Form.Select
                      value={ipType}
                      onChange={(e) => setIpType(e.target.value)}
                    >
                      <option value="whitelist">Whitelist (Allow)</option>
                      <option value="blacklist">Blacklist (Block)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={addIpAddress}
                    disabled={!newIpAddress}
                  >
                    Add IP
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <h6>Whitelist</h6>
                  {formData.ipWhitelist.length > 0 ? (
                    <ul className="list-group">
                      {formData.ipWhitelist.map((ip) => (
                        <li
                          key={ip}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {ip}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeIpAddress(ip, "whitelist")}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No IP addresses whitelisted</p>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Blacklist</h6>
                  {formData.ipBlacklist.length > 0 ? (
                    <ul className="list-group">
                      {formData.ipBlacklist.map((ip) => (
                        <li
                          key={ip}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {ip}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeIpAddress(ip, "blacklist")}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No IP addresses blacklisted</p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <h6 className="text-primary mb-3">Advanced Options</h6>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="showUsageStatistics"
              name="showUsageStatistics"
              label="Show API usage statistics in admin dashboard"
              checked={formData.showUsageStatistics}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="throttlingEnabled"
              name="throttlingEnabled"
              label="Enable request throttling"
              checked={formData.throttlingEnabled}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Gradually slow down responses when approaching rate limits instead
              of abruptly blocking requests
            </Form.Text>
          </Form.Group>

          {formData.throttlingEnabled && (
            <Form.Group className="mb-4">
              <Form.Label>Throttle Threshold (%)</Form.Label>
              <Form.Control
                type="number"
                name="throttleThreshold"
                value={formData.throttleThreshold}
                onChange={handleChange}
                min={1}
                max={100}
              />
              <Form.Text className="text-muted">
                Throttling begins when usage reaches this percentage of the rate
                limit
              </Form.Text>
            </Form.Group>
          )}

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

export default ApiSettings;
