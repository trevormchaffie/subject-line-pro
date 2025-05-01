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
   * Get leads with filtering, sorting, and pagination
   */
  async getLeads(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,
        businessType,
        startDate,
        endDate,
        search,
      } = req.query;

      // Get filtered leads
      const result = await dataService.getLeadsWithFilters({
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        filters: {
          status,
          businessType,
          startDate,
          endDate,
          search, // Search in name and email
        },
      });

      res.status(200).json({
        success: true,
        data: result.leads,
        meta: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single lead details
   */
  async getLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const lead = await dataService.getLeadById(id);

      if (!lead) {
        return res.status(404).json({
          error: {
            message: "Lead not found",
            status: 404,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update lead status/details
   */
  async updateLead(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updatedLead = await dataService.updateLead(id, {
        status,
        notes,
      });

      if (!updatedLead) {
        return res.status(404).json({
          error: {
            message: "Lead not found",
            status: 404,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: updatedLead,
        message: "Lead updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add notes to a lead
   */
  async addLeadNote(req, res, next) {
    try {
      const { leadId, note } = req.body;

      if (!leadId || !note) {
        return res.status(400).json({
          error: {
            message: "Lead ID and note are required",
            status: 400,
          },
        });
      }

      const updatedLead = await dataService.addLeadNote(leadId, {
        content: note,
        createdBy: req.user?.id || "Admin", // Use req.user if available
        createdAt: new Date().toISOString(),
      });

      if (!updatedLead) {
        return res.status(404).json({
          error: {
            message: "Lead not found",
            status: 404,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: updatedLead.notes,
        message: "Note added successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a lead
   */
  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await dataService.deleteLead(id);
      
      if (!result) {
        return res.status(404).json({
          error: {
            message: "Lead not found",
            status: 404,
          },
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete multiple leads
   */
  async deleteMultipleLeads(req, res, next) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          error: {
            message: "Invalid request: ids must be a non-empty array",
            status: 400,
          },
        });
      }
      
      const result = await dataService.deleteMultipleLeads(ids);
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} leads deleted successfully`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export leads (CSV/JSON)
   */
  async exportLeads(req, res, next) {
    try {
      const { format = "csv", filters = {} } = req.query;

      // Get all leads (potentially filtered)
      const leads = await dataService.getAllLeads(filters);

      if (format.toLowerCase() === "json") {
        return res.status(200).json({
          success: true,
          data: leads,
        });
      }

      // Format for CSV
      const fields = [
        "id",
        "name",
        "email",
        "businessType",
        "createdAt",
        "ipAddress",
        "subjectLine",
        "status",
        "location",
      ];

      // Create CSV content
      const csvData = [
        fields.join(","), // Header row
        ...leads.map((lead) => {
          return fields
            .map((field) => {
              let value = lead[field] || "";
              // Wrap string values in quotes and escape quotes within
              if (typeof value === "string") {
                value = `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",");
        }),
      ].join("\n");

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv");

      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leadsController;
