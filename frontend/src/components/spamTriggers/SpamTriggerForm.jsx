// src/components/SpamTriggerForm.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const initialFormState = {
  pattern: "",
  category: "",
  impact: 50,
  description: "",
  active: true,
};

const categoryOptions = [
  { value: "promotional", label: "Promotional" },
  { value: "misleading", label: "Misleading" },
  { value: "urgent", label: "Urgency/Scarcity" },
  { value: "offensive", label: "Offensive Content" },
  { value: "formatting", label: "Bad Formatting" },
  { value: "other", label: "Other" },
];

const SpamTriggerForm = ({ trigger, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with trigger data if editing
  useEffect(() => {
    if (trigger) {
      setFormData(trigger);
    } else {
      setFormData(initialFormState);
    }
  }, [trigger]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pattern.trim()) {
      newErrors.pattern = "Pattern is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.impact < 0 || formData.impact > 100) {
      newErrors.impact = "Impact must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
      // Handle form submission error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="pattern"
          className="block text-sm font-medium text-gray-700"
        >
          Pattern/Word <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="pattern"
          name="pattern"
          value={formData.pattern}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.pattern ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          placeholder="Enter trigger word or pattern"
        />
        {errors.pattern && (
          <p className="mt-1 text-sm text-red-500">{errors.pattern}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.category ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        >
          <option value="">Select a category</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="impact"
          className="block text-sm font-medium text-gray-700"
        >
          Impact Score (0-100)
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="range"
            id="impact"
            name="impact"
            min="0"
            max="100"
            step="1"
            value={formData.impact}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-3 text-gray-700 w-10">{formData.impact}</span>
        </div>
        {errors.impact && (
          <p className="mt-1 text-sm text-red-500">{errors.impact}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Explain why this pattern triggers spam detection"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="pt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : trigger ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

SpamTriggerForm.propTypes = {
  trigger: PropTypes.shape({
    id: PropTypes.string,
    pattern: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    impact: PropTypes.number.isRequired,
    description: PropTypes.string,
    active: PropTypes.bool.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SpamTriggerForm;
