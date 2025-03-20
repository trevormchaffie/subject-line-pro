const dataService = require("../services/dataService");

/**
 * Controller for lead management
 */
const leadsController = {
  /**
   * Submit a new lead
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async submitLead(req, res, next) {
    try {
      const { name, email, businessType, subjectLine, analysisResults } =
        req.body;

      // Validate required fields
      if (!name || !email || !businessType) {
        return res.status(400).json({
          error: {
            message: "Name, email, and business type are required",
            status: 400,
          },
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: {
            message: "Invalid email format",
            status: 400,
          },
        });
      }

      // Save lead
      const savedLead = await dataService.saveLead({
        name,
        email,
        businessType,
        subjectLine,
        analysisResults,
        ipAddress: req.ip, // Store IP for analytics (consider privacy implications)
        userAgent: req.headers["user-agent"], // Store user agent for analytics
      });

      // Return success
      res.status(201).json({
        success: true,
        data: {
          id: savedLead.id,
          createdAt: savedLead.createdAt,
        },
        message: "Lead submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all leads (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getLeads(req, res, next) {
    try {
      // Get all leads
      const leads = await dataService.getLeads();

      // Return leads
      res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leadsController;
