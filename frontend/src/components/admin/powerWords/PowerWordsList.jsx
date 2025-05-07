// src/components/admin/powerWords/PowerWordsList.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { getPowerWords, deleteWord } from "../../../services/api/powerWordApi";
import { getCategories } from "../../../services/api/powerWordApi";
import PowerWordForm from "./PowerWordForm";
import { debounce } from "lodash";

const PowerWordsList = ({ setError, showToast }) => {
  const [powerWords, setPowerWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: "word",
    direction: "asc",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load data
  const loadPowerWords = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        const response = await getPowerWords({
          search: filters.searchTerm || searchTerm,
          categoryId: filters.categoryId || categoryFilter,
          minRating: filters.minRating || minRatingFilter,
          sortBy: filters.sortField || sortConfig.field,
          sortDir: filters.sortDirection || sortConfig.direction,
        });
        setPowerWords(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load power words");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, categoryFilter, minRatingFilter, sortConfig, setError]
  );

  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    }
  }, [setError]);

  useEffect(() => {
    loadPowerWords();
    loadCategories();
  }, [loadPowerWords, loadCategories]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      loadPowerWords({ searchTerm: value });
    }, 500),
    [loadPowerWords]
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    loadPowerWords({ categoryId: e.target.value });
  };

  const handleMinRatingFilterChange = (e) => {
    setMinRatingFilter(e.target.value);
    loadPowerWords({ minRating: e.target.value });
  };

  const handleSort = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ field, direction });
    loadPowerWords({ sortField: field, sortDirection: direction });
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteWord(confirmDelete.id);
      loadPowerWords();
      showToast("success", "Power word deleted successfully");
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete power word");
    }
  };

  const handleFormSubmit = () => {
    loadPowerWords();
    setShowAddModal(false);
    setEditingWord(null);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const renderRatingStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Power Words</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Power Word
        </Button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <InputGroup>
            <Form.Control
              placeholder="Search power words..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </div>
        <div className="col-md-4">
          <Form.Select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-4">
          <Form.Select
            value={minRatingFilter}
            onChange={handleMinRatingFilterChange}
          >
            <option value="">All Ratings</option>
            <option value="1">★ and up</option>
            <option value="2">★★ and up</option>
            <option value="3">★★★ and up</option>
            <option value="4">★★★★ and up</option>
            <option value="5">★★★★★ only</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("word")}
                style={{ cursor: "pointer" }}
              >
                Word{" "}
                {sortConfig.field === "word" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("categoryId")}
                style={{ cursor: "pointer" }}
              >
                Category{" "}
                {sortConfig.field === "categoryId" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("effectivenessRating")}
                style={{ cursor: "pointer" }}
              >
                Effectiveness{" "}
                {sortConfig.field === "effectivenessRating" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Description</th>
              <th>Example</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {powerWords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No power words found
                </td>
              </tr>
            ) : (
              powerWords.map((word) => (
                <tr key={word.id}>
                  <td>{word.word}</td>
                  <td>
                    {word.categoryId ? (
                      <Badge bg="info">
                        {getCategoryName(word.categoryId)}
                      </Badge>
                    ) : (
                      <Badge bg="secondary">Uncategorized</Badge>
                    )}
                  </td>
                  <td className="text-warning">
                    {renderRatingStars(word.effectivenessRating)}
                  </td>
                  <td>{word.description}</td>
                  <td>
                    <em>{word.example}</em>
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
                      onClick={() => setConfirmDelete(word)}
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
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setEditingWord(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWord ? "Edit Power Word" : "Add Power Word"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PowerWordForm
            word={editingWord}
            categories={categories}
            onSubmit={handleFormSubmit}
            setError={setError}
            showToast={showToast}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the power word "
          <strong>{confirmDelete?.word}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PowerWordsList;
