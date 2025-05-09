// src/pages/admin/PowerWordsManagement.jsx
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Alert, Card } from "react-bootstrap";
import PowerWordsList from "../../components/admin/powerWords/PowerWordsList";
import CategoriesList from "../../components/admin/powerWords/CategoriesList";
import RatingConfig from "../../components/admin/powerWords/RatingConfig";
import '../../components/admin/powerWords/bootstrap-imports.css';

const PowerWordsManagement = () => {
  const [activeTab, setActiveTab] = useState("words");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Simple toast implementation
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">Power Words Management</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {toast && (
        <Alert variant={toast.type} onClose={() => setToast(null)} dismissible>
          {toast.message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="words" title="Power Words">
              <PowerWordsList setError={setError} showToast={showToast} />
            </Tab>
            <Tab eventKey="categories" title="Categories">
              <CategoriesList setError={setError} showToast={showToast} />
            </Tab>
            <Tab eventKey="config" title="Rating Configuration">
              <RatingConfig setError={setError} showToast={showToast} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PowerWordsManagement;