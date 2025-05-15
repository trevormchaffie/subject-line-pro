import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import templateService from "../../services/templateService";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import "./templates.css";

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const filter = {};
        if (categoryFilter) filter.category = categoryFilter;

        const data = await templateService.getAllTemplates(filter);
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError("Failed to load templates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [categoryFilter]);

  // Filter templates by search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await templateService.deleteTemplate(templateToDelete.id);
      setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      setError("Failed to delete template");
      console.error(err);
    }
  };

  // Category color mapping
  const getCategoryBadge = (category) => {
    const colors = {
      length: "primary",
      spam: "danger",
      "power-words": "success",
      personalization: "info",
      general: "secondary",
    };

    const bgColors = {
      length: "#e6f0ff",
      spam: "#ffebee",
      "power-words": "#e8f5e9",
      personalization: "#e3f2fd",
      general: "#f5f5f5",
    };

    const textColors = {
      length: "#0d47a1",
      spam: "#b71c1c",
      "power-words": "#1b5e20",
      personalization: "#01579b",
      general: "#424242",
    };

    const bgColor = bgColors[category] || "#f5f5f5";
    const textColor = textColors[category] || "#424242";

    return (
      <Badge 
        bg="none" 
        style={{ 
          backgroundColor: bgColor, 
          color: textColor,
          fontSize: "0.75rem",
          padding: "0.35em 0.65em",
          fontWeight: "600"
        }}
      >
        {category.replace("-", " ")}
      </Badge>
    );
  };

  return (
    <div className="template-list container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-3">
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
            />
          </InputGroup>
          
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ms-2"
            style={{ width: "180px" }}
          >
            <option value="">All Categories</option>
            <option value="length">Length</option>
            <option value="spam">Spam</option>
            <option value="power-words">Power Words</option>
            <option value="personalization">Personalization</option>
            <option value="general">General</option>
          </Form.Select>
        </div>
        
        <Link to="/admin/templates/new">
          <Button variant="primary">Create Template</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="alert alert-info">No templates found.</div>
      ) : (
        <Table hover borderless responsive className="align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-3">Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Last Updated</th>
              <th>Versions</th>
              <th className="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((template) => (
              <tr key={template.id} className="border-bottom">
                <td className="ps-3 fw-medium">{template.name}</td>
                <td>{getCategoryBadge(template.category)}</td>
                <td>
                  {template.description.substring(0, 50)}
                  {template.description.length > 50 ? "..." : ""}
                </td>
                <td>{new Date(template.updatedAt).toLocaleDateString()}</td>
                <td>{template.versions.length}</td>
                <td className="text-end pe-3">
                  <div className="d-flex gap-2 justify-content-end">
                    <Link
                      to={`/admin/templates/edit/${template.id}`}
                      className="btn btn-sm btn-outline-primary"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Delete"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TemplateList;
