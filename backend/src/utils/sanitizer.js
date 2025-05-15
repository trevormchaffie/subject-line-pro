/**
 * Simple HTML sanitizer to prevent XSS attacks
 * @param {string} content - HTML string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeHtml = (content) => {
  if (!content) return '';
  
  // Basic sanitization - replace potentially dangerous characters with HTML entities
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

module.exports = {
  sanitizeHtml,
};