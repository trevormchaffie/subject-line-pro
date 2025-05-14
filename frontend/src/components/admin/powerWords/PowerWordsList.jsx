// src/components/admin/powerWords/PowerWordsList.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Modal,
  Pagination,
} from "react-bootstrap";
import PowerWordForm from "./PowerWordForm";

const PowerWordsList = ({
  words = [],
  categories = [],
  onEdit,
  onDelete,
  onAddNew,
  onImport,
  onExport,
  onFilterChange,
  filters = {},
  paginationInfo,
  onPageChange,
  setError,
  showToast,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingWord, setDeletingWord] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Local search state to maintain input focus
  // Use internal state for search form inputs to prevent loss of focus
  const [searchValue, setSearchValue] = useState(filters.search || "");
  
  // Update search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);
  
  // Simpler approach without debounce to fix focus issues
  const renderRatingStars = (rating) => {
    const percentage = (rating / 100) * 5;
    const stars = Math.round(percentage);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };
  
  // Update internal state without calling filter change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };
  
  // Apply search when user presses Enter or input loses focus
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      onFilterChange({ search: searchValue });
    }
  };
  
  // Handle category filter change directly
  const handleCategoryFilter = (e) => {
    onFilterChange({ category: e.target.value });
  };

  const handleDeleteClick = (word) => {
    setDeletingWord(word);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWord) return;

    try {
      setLoading(true);
      await onDelete(deletingWord.id);
      setShowDeleteModal(false);
      setDeletingWord(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      await onImport(file);
      e.target.value = ""; // Reset file input
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await onExport(filters.category);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";

    // Flexible ID matching for finding a category
    const category = categories.find((cat) => {
      // Handle both numeric and string IDs
      if (cat.id === categoryId) return true;
      
      // Try converting string to number if applicable
      const numericCatId = typeof cat.id === 'string' && !isNaN(cat.id) ? parseInt(cat.id, 10) : cat.id;
      const numericToFind = typeof categoryId === 'string' && !isNaN(categoryId) ? parseInt(categoryId, 10) : categoryId;
      
      return numericCatId === numericToFind || cat.id.toString() === categoryId.toString();
    });
    
    // Useful for debugging category matching issues
    if (!category) {
      console.log(`Category not found for ID: ${categoryId} (type: ${typeof categoryId})`);
      console.log("Available categories:", categories.map(c => ({ id: c.id, name: c.name, idType: typeof c.id })));
    }
    
    return category ? category.name : "Uncategorized";
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Power Words</h2>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={handleExport}
          >
            Export
          </Button>
          <label className="btn btn-outline-primary me-2 mb-0">
            Import
            <input type="file" hidden accept=".json" onChange={handleImport} />
          </label>
          <Button variant="primary" onClick={onAddNew}>
            Add Power Word
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="row">
          <div className="col-md-6">
            <InputGroup>
              <Form.Control
                placeholder="Search power words..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
              />
              <Button 
                variant="outline-secondary"
                onClick={() => onFilterChange({ search: searchValue })}
              >
                Search
              </Button>
            </InputGroup>
          </div>
          <div className="col-md-4">
            <Form.Select
              value={filters.category || ""}
              onChange={handleCategoryFilter}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Word</th>
                <th>Category</th>
                <th>Effectiveness</th>
                <th>Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No power words found
                  </td>
                </tr>
              ) : (
                words.map((word) => (
                  <tr key={word.id}>
                    <td>{word.word}</td>
                    <td>{getCategoryName(word.categoryId)}</td>
                    <td>
                      <div>
                        <span className="text-warning">
                          {renderRatingStars(word.effectiveness)}
                        </span>
                        <span className="ms-2 text-muted">
                          {word.effectiveness}%
                        </span>
                      </div>
                    </td>
                    <td>{word.usage || "N/A"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => onEdit(word)}
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

          {/* Pagination */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First
                  onClick={() => onPageChange(1)}
                  disabled={paginationInfo.page === 1}
                />
                <Pagination.Prev
                  onClick={() => onPageChange(paginationInfo.page - 1)}
                  disabled={paginationInfo.page === 1}
                />

                {[...Array(paginationInfo.totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === paginationInfo.page}
                    onClick={() => onPageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => onPageChange(paginationInfo.page + 1)}
                  disabled={paginationInfo.page === paginationInfo.totalPages}
                />
                <Pagination.Last
                  onClick={() => onPageChange(paginationInfo.totalPages)}
                  disabled={paginationInfo.page === paginationInfo.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the power word{" "}
          <strong>"{deletingWord?.word}"</strong>?
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
