// Test script for full JWT auth flow including token validation
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api';
const AUTH_URL = `${API_URL}/auth/login`;
const LEADS_URL = `${API_URL}/leads/admin`;

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'mr1018',
  password: 'Maya03112005'
};

// Helper to log the result
const logResult = (test, success, data = null, error = null) => {
  console.log(`\n====== ${test} ======`);
  if (success) {
    console.log('✅ SUCCESS');
    if (data) console.log('Data:', JSON.stringify(data, null, 2));
  } else {
    console.log('❌ FAILED');
    if (error) {
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
};

// Test JWT auth workflow
const testJwtAuth = async () => {
  try {
    // 1. Login to get token
    console.log('🔑 Testing JWT authentication workflow\n');
    console.log('1. Logging in to get tokens');
    
    const loginResponse = await axios.post(AUTH_URL, ADMIN_CREDENTIALS);
    const token = loginResponse.data.token;
    
    if (!token) {
      throw new Error('No token received from login');
    }
    
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Decode token to examine payload
    try {
      const decodedToken = jwt.decode(token);
      console.log('Token payload:', decodedToken);
    } catch (e) {
      console.log('Could not decode token:', e.message);
    }
    
    // 2. Use token to access protected endpoint
    console.log('\n2. Using token to access protected endpoint');
    
    const leadsResponse = await axios.get(LEADS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: 1,
        limit: 5
      }
    });
    
    logResult('Access protected resource', true, {
      status: leadsResponse.status,
      success: leadsResponse.data.success,
      recordCount: leadsResponse.data.data?.leads?.length || 0
    });
    
    return true;
  } catch (error) {
    console.error('❌ JWT Auth Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Run the JWT auth test
testJwtAuth();