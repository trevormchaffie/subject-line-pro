// src/pages/admin/PowerWordsManagement.jsx
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Alert } from "react-bootstrap";
import PowerWordsList from "../../components/admin/powerWords/PowerWordsList";
import CategoriesList from "../../components/admin/powerWords/CategoriesList";
import RatingConfig from "../../components/admin/powerWords/RatingConfig";
import { useToast } from "../../hooks/useToast";

const PowerWordsManagement = () => {
  const [activeTab, setActiveTab] = useState("words");
  const { showToast } = useToast();
  const [error, setError] = useState(null);

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">Power Words Management</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

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
    </div>
  );
};

export default PowerWordsManagement;
