// src/hooks/useToast.js
import { useState, useCallback } from 'react';

/**
 * Simple hook to manage toast notifications
 * @returns {Object} Toast state and functions
 */
export const useToast = () => {
  const [toast, setToast] = useState(null);

  /**
   * Show a toast notification
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {string} message - Toast message
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  const showToast = useCallback((type, message, duration = 3000) => {
    setToast({ type, message });
    
    // Auto-hide toast after duration
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  /**
   * Hide the current toast
   */
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
};

export default useToast;