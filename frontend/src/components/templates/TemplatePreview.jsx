import React from "react";
import { Card } from "react-bootstrap";
import PropTypes from "prop-types";
import "./templates.css";

const TemplatePreview = ({ content }) => {
  return (
    <Card className="template-preview">
      <Card.Header className="bg-light">Preview</Card.Header>
      <Card.Body>
        {content ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        ) : (
          <div className="text-center text-muted py-4">
            Preview your template with sample variables
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

TemplatePreview.propTypes = {
  content: PropTypes.string,
};

export default TemplatePreview;
