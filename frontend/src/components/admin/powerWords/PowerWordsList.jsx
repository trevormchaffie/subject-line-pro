// src/components/admin/powerWords/PowerWordsList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import PowerWordForm from './PowerWordForm';

const PowerWordsList = ({ setError, showToast }) => {
  const [powerWords, setPowerWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingWord, setDeletingWord] = useState(null);
  const [categories, setCategories] = useState([]);

  // Simulated data until actual API is connected
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories([
        { id: 'premium', name: 'Premium', description: 'Premium value words', impact: 'high' },
        { id: 'value', name: 'Value', description: 'Value proposition words', impact: 'medium' },
        { id: 'urgency', name: 'Urgency', description: 'Time-sensitive words', impact: 'high' },
      ]);
      
      setPowerWords([
        { id: '1', word: 'exclusive', categoryId: 'premium', effectivenessRating: 4, description: 'Creates premium perception', example: 'Exclusive offer for members' },
        { id: '2', word: 'free', categoryId: 'value', effectivenessRating: 3, description: 'Appeals to value-seekers', example: 'Get your free copy today' },
        { id: '3', word: 'limited', categoryId: 'urgency', effectivenessRating: 5, description: 'Creates scarcity', example: 'Limited time offer' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const renderRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add new power word
  const handleAddWord = () => {
    setEditingWord(null);
    setShowAddModal(true);
  };

  // Edit existing power word
  const handleEdit = (word) => {
    setEditingWord(word);
    setShowAddModal(true);
  };

  // Delete power word
  const handleDeleteClick = (word) => {
    setDeletingWord(word);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingWord) return;
    
    // Simulated delete API call
    setPowerWords(prevWords => prevWords.filter(word => word.id !== deletingWord.id));
    showToast('success', `Power word "${deletingWord.word}" deleted successfully.`);
    setShowDeleteModal(false);
    setDeletingWord(null);
  };

  // Handle form submission for add/edit
  const handleFormSubmit = (formData) => {
    if (editingWord) {
      // Update existing word
      setPowerWords(prevWords => 
        prevWords.map(word => 
          word.id === editingWord.id ? { ...word, ...formData } : word
        )
      );
      showToast('success', `Power word "${formData.word}" updated successfully.`);
    } else {
      // Add new word
      const newId = 'pw_' + Date.now();
      setPowerWords(prevWords => [
        ...prevWords, 
        { 
          id: newId,
          ...formData
        }
      ]);
      showToast('success', `Power word "${formData.word}" added successfully.`);
    }
    
    setShowAddModal(false);
    setEditingWord(null);
  };

  // Get category name from id
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Filter power words based on search term
  const filteredWords = powerWords.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Power Words</h2>
        <Button variant="primary" onClick={handleAddWord}>Add Power Word</Button>
      </div>

      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search power words..."
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
              <th>Word</th>
              <th>Category</th>
              <th>Effectiveness</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No power words found
                </td>
              </tr>
            ) : (
              filteredWords.map((word) => (
                <tr key={word.id}>
                  <td>{word.word}</td>
                  <td>{getCategoryName(word.categoryId)}</td>
                  <td className="text-warning">
                    {renderRatingStars(word.effectivenessRating)}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(word)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(word)}
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

      {/* Add/Edit Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingWord ? 'Edit Power Word' : 'Add Power Word'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PowerWordForm 
            word={editingWord}
            categories={categories}
            onSubmit={handleFormSubmit}
            setError={setError}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the power word <strong>"{deletingWord?.word}"</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PowerWordsList;