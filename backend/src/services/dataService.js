// src/services/dataService.js
const fs = require("fs").promises;
const path = require("path");

// Path to the leads data file
const LEADS_FILE = path.join(__dirname, "../data/leads.json");
// Path to the analyzed subjects data file
const ANALYZED_SUBJECTS_FILE = path.join(__dirname, "../data/analyzed_subjects.json");

// Helper function to read leads data
async function readLeadsData() {
  const data = await fs.readFile(LEADS_FILE, "utf8");
  return JSON.parse(data || "[]");
}

// Helper function to write leads data
async function writeLeadsData(leads) {
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  return leads;
}

// Helper function to read analyzed subjects data
async function readAnalyzedSubjectsData() {
  try {
    const data = await fs.readFile(ANALYZED_SUBJECTS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with empty array
      await fs.writeFile(ANALYZED_SUBJECTS_FILE, "[]", "utf8");
      return [];
    }
    throw error;
  }
}

// Helper function to write analyzed subjects data
async function writeAnalyzedSubjectsData(subjects) {
  await fs.writeFile(ANALYZED_SUBJECTS_FILE, JSON.stringify(subjects, null, 2), "utf8");
  return subjects;
}

const dataService = {
  /**
   * Save analysis results to the database
   * @param {Object} analysisData - The analysis results to save
   * @returns {Promise<Object>} - The saved analysis data with ID
   */
  async saveAnalysis(analysisData) {
    const subjects = await readAnalyzedSubjectsData();
    
    // Create a new entry with ID and timestamp
    const newAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...analysisData,
      createdAt: new Date().toISOString(),
    };
    
    subjects.push(newAnalysis);
    await writeAnalyzedSubjectsData(subjects);
    
    return newAnalysis;
  },
  
  /**
   * Get all analyzed subjects data
   * @returns {Promise<Array>} - All analyzed subjects
   */
  async getAnalyzedSubjects() {
    return await readAnalyzedSubjectsData();
  },
  
  /**
   * Get all leads without filtering (for internal use)
   * @returns {Promise<Array>} - All leads
   */
  async getLeads() {
    return await readLeadsData();
  },
  
  /**
   * Get analytics statistics
   * @returns {Promise<Object>} Analysis statistics
   */
  async getAnalysisStats() {
    const leads = await readLeadsData();
    const analyzedSubjects = await readAnalyzedSubjectsData();
    
    // Calculate conversion rate
    const totalAnalyses = analyzedSubjects.length;
    const totalLeads = leads.length;
    const conversionRate = totalAnalyses > 0 
      ? ((totalLeads / totalAnalyses) * 100).toFixed(2) 
      : "0.00";
    
    // Track frequency of subject length ranges
    const lengthRanges = {
      'short': 0,    // 1-30 chars
      'medium': 0,   // 31-60 chars
      'long': 0      // 61+ chars
    };
    
    // Track most common words
    const wordFrequency = {};
    
    // Process each subject line
    analyzedSubjects.forEach(subject => {
      // Calculate subject length range
      if (subject.subjectLine) {
        const length = subject.subjectLine.length;
        if (length <= 30) {
          lengthRanges.short++;
        } else if (length <= 60) {
          lengthRanges.medium++;
        } else {
          lengthRanges.long++;
        }
        
        // Process word frequency (simple tokenization)
        const words = subject.subjectLine.toLowerCase().split(/\s+/);
        words.forEach(word => {
          // Filter out common stop words and words shorter than 3 chars
          if (word.length > 2) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          }
        });
      }
    });
    
    // Get top words (top 10)
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    return {
      totalAnalyses,
      totalLeads,
      conversionRate,
      lengthDistribution: lengthRanges,
      topWords
    };
  },
  
  /**
   * Get all leads (can be filtered)
   */
  async getAllLeads(filters = {}) {
    let leads = await readLeadsData();

    // Apply filters if provided
    if (filters.status) {
      leads = leads.filter((lead) => lead.status === filters.status);
    }

    if (filters.businessType) {
      leads = leads.filter(
        (lead) => lead.businessType === filters.businessType
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      leads = leads.filter((lead) => new Date(lead.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      leads = leads.filter((lead) => new Date(lead.createdAt) <= endDate);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      leads = leads.filter(
        (lead) =>
          (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm))
      );
    }

    return leads;
  },

  /**
   * Get leads with filtering, sorting, and pagination
   */
  async getLeadsWithFilters({ page, limit, sortBy, sortOrder, filters }) {
    let leads = await this.getAllLeads(filters);

    // Get total before pagination
    const total = leads.length;

    // Sort leads
    leads.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle dates
      if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Sort order
      if (sortOrder.toLowerCase() === "desc") {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    leads = leads.slice(startIndex, endIndex);

    return { leads, total };
  },

  /**
   * Get a single lead by ID
   */
  async getLeadById(id) {
    const leads = await readLeadsData();
    return leads.find((lead) => lead.id === id);
  },

  /**
   * Save a new lead
   */
  async saveLead(leadData) {
    const leads = await readLeadsData();

    // Create a new lead with ID and timestamp
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...leadData,
      status: "New", // Default status
      notes: [], // Initialize empty notes array
      createdAt: new Date().toISOString(),
    };

    leads.push(newLead);
    await writeLeadsData(leads);

    return newLead;
  },

  /**
   * Update lead details
   */
  async updateLead(id, updates) {
    const leads = await readLeadsData();
    const leadIndex = leads.findIndex((lead) => lead.id === id);

    if (leadIndex === -1) {
      return null;
    }

    // Update the lead
    leads[leadIndex] = {
      ...leads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeLeadsData(leads);
    return leads[leadIndex];
  },

  /**
   * Add a note to a lead
   */
  async addLeadNote(leadId, noteData) {
    const leads = await readLeadsData();
    const leadIndex = leads.findIndex((lead) => lead.id === leadId);

    if (leadIndex === -1) {
      return null;
    }

    // Initialize notes array if it doesn't exist
    if (!leads[leadIndex].notes) {
      leads[leadIndex].notes = [];
    }

    // Add the note with an ID
    const note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...noteData,
    };

    leads[leadIndex].notes.push(note);
    leads[leadIndex].updatedAt = new Date().toISOString();

    await writeLeadsData(leads);
    return leads[leadIndex];
  },
  
  /**
   * Delete a lead by ID
   */
  async deleteLead(id) {
    const leads = await readLeadsData();
    const leadIndex = leads.findIndex((lead) => lead.id === id);
    
    if (leadIndex === -1) {
      return null;
    }
    
    // Remove the lead
    leads.splice(leadIndex, 1);
    
    // Save changes
    await writeLeadsData(leads);
    
    return { success: true };
  },
  
  /**
   * Delete multiple leads by their IDs
   */
  async deleteMultipleLeads(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { deletedCount: 0 };
    }
    
    const leads = await readLeadsData();
    const initialCount = leads.length;
    
    // Filter out leads with IDs in the provided array
    const remainingLeads = leads.filter((lead) => !ids.includes(lead.id));
    
    // Calculate how many were deleted
    const deletedCount = initialCount - remainingLeads.length;
    
    // Save changes
    await writeLeadsData(remainingLeads);
    
    return { deletedCount };
  },
};

module.exports = dataService;
