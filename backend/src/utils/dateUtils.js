/**
 * Date utility functions
 */

/**
 * Get date range based on period
 * @param {string} period - 'day', 'week', 'month', 'year', or 'all'
 * @returns {Object} - { startDate, endDate }
 */
function getDateRange(period = "all") {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      // Set to beginning of current week (Sunday)
      const day = startDate.getDay(); // 0-6, 0 is Sunday
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "all":
    default:
      // Set to earliest possible date
      startDate = new Date(0);
      break;
  }

  return { startDate, endDate };
}

module.exports = {
  getDateRange,
};
