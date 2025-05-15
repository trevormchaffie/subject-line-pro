import React from "react";
import { ListGroup, Badge, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import "./templates.css";

const VariableSelector = ({ variables, onSelectVariable }) => {
  // Group variables by type
  const groupedVariables = variables.reduce((groups, variable) => {
    const type = variable.type || "text";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(variable);
    return groups;
  }, {});

  // Type badge colors
  const typeBadgeColors = {
    text: "primary",
    number: "success",
    date: "warning",
    boolean: "info",
  };

  return (
    <div className="variable-selector">
      {Object.entries(groupedVariables).map(([type, vars]) => (
        <div key={type} className="mb-3">
          <Badge bg={typeBadgeColors[type] || "secondary"} className="mb-2">
            {type}
          </Badge>
          <ListGroup>
            {vars.map((variable) => (
              <ListGroup.Item
                key={variable.id}
                className="d-flex justify-content-between align-items-center py-2"
              >
                <div>
                  <div className="fw-bold">{variable.name}</div>
                  <small className="text-muted">{variable.description}</small>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onSelectVariable(variable)}
                >
                  Insert
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ))}

      {variables.length === 0 && (
        <div className="text-center text-muted">No variables available</div>
      )}
    </div>
  );
};

VariableSelector.propTypes = {
  variables: PropTypes.array.isRequired,
  onSelectVariable: PropTypes.func.isRequired,
};

export default VariableSelector;
