// Test script for admin authentication
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const AUTH_URL = `${API_URL}/auth/login`;

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'mr1018',
  password: 'Maya03112005'
};

// Test: Admin Login
const testAdminLogin = async () => {
  console.log("Testing admin login...");
  try {
    const response = await axios.post(AUTH_URL, ADMIN_CREDENTIALS);
    console.log("SUCCESS! Logged in as admin");
    console.log("Token:", response.data.token);
    return response.data.token;
  } catch (error) {
    console.log("FAILED to login as admin");
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

// Execute the test
testAdminLogin();