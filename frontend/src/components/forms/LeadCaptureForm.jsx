import { useState } from "react";

const LeadCaptureForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessType: "",
  });

  const [errors, setErrors] = useState({});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.businessType.trim())
      newErrors.businessType = "Business type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLocalSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const isSubmitting = isLoading || isLocalSubmitting;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Get More Email Marketing Tips
      </h2>
      <p className="text-gray-600 mb-4">
        Sign up to receive our expert email marketing strategies directly to
        your inbox.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full p-3 border ${
              errors.name ? "border-danger" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full p-3 border ${
              errors.email ? "border-danger" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-danger">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="businessType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Business Type
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full p-3 border ${
              errors.businessType ? "border-danger" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Select Business Type</option>
            <option value="ecommerce">E-commerce</option>
            <option value="service">Service-based</option>
            <option value="saas">SaaS / Software</option>
            <option value="agency">Agency / Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-danger">{errors.businessType}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-primary text-white py-2 px-4 rounded-md transition-colors ${
            isSubmitting
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-primary/80"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Get Free Tips"
          )}
        </button>
      </form>
    </div>
  );
};

export default LeadCaptureForm;
