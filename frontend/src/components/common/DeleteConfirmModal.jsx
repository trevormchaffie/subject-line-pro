import React from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const DeleteConfirmModal = ({ show, onHide, onConfirm, title, message }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirm Delete"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message ||
          "Are you sure you want to delete this item? This action cannot be undone."}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
};

export default DeleteConfirmModal;
