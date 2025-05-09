// src/components/admin/powerWords/CategoriesList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Spinner, Badge } from 'react-bootstrap';

const CategoriesList = ({ setError, showToast }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulated data until actual API is connected
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories([
        { id: 'premium', name: 'Premium', description: 'Premium value words', impact: 'high' },
        { id: 'value', name: 'Value', description: 'Value proposition words', impact: 'medium' },
        { id: 'urgency', name: 'Urgency', description: 'Time-sensitive words', impact: 'high' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    };
    
    return <Badge bg={colors[impact] || 'secondary'}>{impact}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Button variant="primary">Add Category</Button>
      </div>

      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Impact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{getImpactBadge(category.impact)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CategoriesList;