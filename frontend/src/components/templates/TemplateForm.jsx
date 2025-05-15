import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Spinner,
  Tab,
  Tabs,
  Badge,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import templateService from "../../services/templateService";
import VariableSelector from "./VariableSelector";
import TemplatePreview from "./TemplatePreview";
import VersionHistory from "./VersionHistory";
import * as powerWordService from "../../services/api/powerWordApi";
import "./templates.css";

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [template, setTemplate] = useState({
    name: "",
    description: "",
    category: "general",
    content: "",
    versionDescription: "",
  });

  const [variables, setVariables] = useState([]);
  const [testVariables, setTestVariables] = useState({});
  const [previewContent, setPreviewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [powerWords, setPowerWords] = useState([]);

  // Load template and variables
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load variables
        const variablesData = await templateService.getVariables();
        setVariables(variablesData);

        // Initialize test variables with default values
        const testVars = {};
        variablesData.forEach((v) => {
          testVars[v.name] = v.defaultValue || "";
        });
        setTestVariables(testVars);

        // Load Power Words
        try {
          const response = await powerWordService.getAllPowerWords();
          // The response should now have data directly as an array
          let powerWordsData = [];
          
          if (Array.isArray(response.data)) {
            powerWordsData = response.data;
          } else if (response.data && Array.isArray(response.data.powerWords)) {
            powerWordsData = response.data.powerWords;
          }
          
          setPowerWords(powerWordsData);
          console.log("Loaded power words:", powerWordsData.length);
        } catch (err) {
          console.error("Failed to load power words:", err);
          setPowerWords([]); // Ensure powerWords is always an array
        }

        // Load template if in edit mode
        if (isEditMode) {
          const templateData = await templateService.getTemplateById(id);

          // Find current version content
          const currentVersion =
            templateData.versions.find(
              (v) => v.id === templateData.currentVersion
            ) || templateData.versions[templateData.versions.length - 1];

          setTemplate({
            name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            content: currentVersion.content,
            versionDescription: "",
          });
        }
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplate({ ...template, [name]: value });
  };

  // Handle variable insertion
  const handleInsertVariable = (variable) => {
    setTemplate({
      ...template,
      content: template.content + `{${variable.name}}`,
    });
  };

  // Handle test variable changes
  const handleTestVariableChange = (name, value) => {
    setTestVariables({ ...testVariables, [name]: value });
  };

  // Preview template with variables
  const handlePreview = async () => {
    try {
      const result = await templateService.testTemplate(
        template.content,
        testVariables
      );
      setPreviewContent(result.renderedContent);
      setActiveTab("preview");
    } catch (err) {
      setError("Failed to preview template");
      console.error(err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isEditMode) {
        await templateService.updateTemplate(id, template);
      } else {
        await templateService.createTemplate(template);
      }

      navigate("/admin/templates");
    } catch (err) {
      setError("Failed to save template");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="template-form container-fluid px-4">

      {error && <div className="alert alert-danger">{error}</div>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={template.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={template.category}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="length">Length</option>
                <option value="spam">Spam</option>
                <option value="power-words">Power Words</option>
                <option value="personalization">Personalization</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={template.description}
            onChange={handleChange}
            rows={2}
          />
        </Form.Group>

        <Row>
          <Col md={8}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                // Automatically generate preview when preview tab is selected
                if (k === "preview") {
                  handlePreview();
                }
              }}
              className="mb-3"
            >
              <Tab eventKey="editor" title="Editor">
                <Form.Group className="mb-3">
                  <Form.Label>Template Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={template.content}
                    onChange={handleChange}
                    rows={10}
                    required
                  />
                  <Form.Text className="text-muted">
                    Use {"{variable_name}"} syntax to insert variables
                  </Form.Text>
                </Form.Group>
              </Tab>

              <Tab eventKey="preview" title="Preview">
                <TemplatePreview content={previewContent} />
              </Tab>

              {isEditMode && (
                <Tab eventKey="versions" title="Version History">
                  <VersionHistory templateId={id} />
                </Tab>
              )}
            </Tabs>

            {isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>Version Description</Form.Label>
                <Form.Control
                  type="text"
                  name="versionDescription"
                  value={template.versionDescription}
                  onChange={handleChange}
                  placeholder="Describe your changes (optional)"
                />
              </Form.Group>
            )}
          </Col>

          <Col md={4}>
            <Card className="mb-3">
              <Card.Header>Available Variables</Card.Header>
              <Card.Body>
                <VariableSelector
                  variables={variables}
                  onSelectVariable={handleInsertVariable}
                />
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Power Words</Card.Header>
              <Card.Body>
                <div className="power-words-cloud">
                  {Array.isArray(powerWords) && powerWords.map((word) => (
                    <Badge
                      key={word.id}
                      bg="light"
                      text="dark"
                      className="m-1 power-word-badge"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setTemplate({
                          ...template,
                          content: template.content + " " + word.word,
                        });
                      }}
                    >
                      {word.word}
                    </Badge>
                  ))}
                </div>
                {(!Array.isArray(powerWords) || powerWords.length === 0) && (
                  <div className="text-center text-muted">
                    No power words available
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>Test Variables</Card.Header>
              <Card.Body>
                {variables.map((variable) => (
                  <Form.Group key={variable.id} className="mb-2">
                    <Form.Label>{variable.name}</Form.Label>
                    <Form.Control
                      type="text"
                      value={testVariables[variable.name] || ""}
                      onChange={(e) =>
                        handleTestVariableChange(variable.name, e.target.value)
                      }
                      placeholder={variable.description}
                      size="sm"
                    />
                  </Form.Group>
                ))}
                {/* Preview happens automatically when tab is clicked */}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/templates")}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">
                  {isEditMode ? "Saving..." : "Creating..."}
                </span>
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Template"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default TemplateForm;
