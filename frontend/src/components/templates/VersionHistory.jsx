import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import templateService from "../../services/templateService";
import "./templates.css";

const VersionHistory = ({ templateId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVersionId, setCurrentVersionId] = useState(null);

  // Load versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);

        // Get template for current version ID
        const template = await templateService.getTemplateById(templateId);
        setCurrentVersionId(template.currentVersion);

        // Get versions
        const versionsData = await templateService.getTemplateVersions(
          templateId
        );
        setVersions(versionsData);
      } catch (err) {
        setError("Failed to load versions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchVersions();
    }
  }, [templateId]);

  // Handle rollback
  const handleRollback = async (versionId) => {
    try {
      setLoading(true);
      await templateService.rollbackToVersion(templateId, versionId);

      // Refresh template data
      const template = await templateService.getTemplateById(templateId);
      setCurrentVersionId(template.currentVersion);

      setError(null);
    } catch (err) {
      setError("Failed to roll back to version");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="alert alert-info">No version history available.</div>
    );
  }

  return (
    <div className="version-history">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Version</th>
            <th>Created</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version, index) => (
            <tr key={version.id}>
              <td>
                {version.id === currentVersionId && (
                  <Badge bg="success" className="me-2">
                    Current
                  </Badge>
                )}
                v{versions.length - index}
              </td>
              <td>
                {new Date(version.createdAt).toLocaleDateString()}{" "}
                {new Date(version.createdAt).toLocaleTimeString()}
              </td>
              <td>{version.description || "No description"}</td>
              <td>
                {version.id !== currentVersionId && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleRollback(version.id)}
                  >
                    Roll Back
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

VersionHistory.propTypes = {
  templateId: PropTypes.string.isRequired,
};

export default VersionHistory;
