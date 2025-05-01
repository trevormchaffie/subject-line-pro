// Test script specifically for the auth middleware
const jwt = require('jsonwebtoken');
const jwtConfig = require('./src/config/jwt.config');
const jwtUtils = require('./src/utils/jwt.utils');

console.log('=== Auth Middleware Debug ===');

// Mock objects for testing middleware
const createMockRequest = (headers = {}, cookies = {}) => ({
  headers,
  cookies,
  user: null // Will be populated by middleware
});

// Test 1: Valid Bearer token in Authorization header
function testValidTokenInHeader() {
  console.log('\n1. Testing valid token in Authorization header:');
  
  // Generate a valid token
  const userId = 'test-user-123';
  const role = 'admin';
  const token = jwtUtils.generateAccessToken(userId, role);
  
  // Create mock request with Authorization header
  const req = createMockRequest({
    authorization: `Bearer ${token}`
  });
  
  try {
    // Replace the actual middleware call with a simulated one for debugging
    console.log('- Token:', token.substring(0, 20) + '...');
    
    // Manually verify the token
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    console.log('- Direct token verification:', decoded ? 'Valid' : 'Invalid');
    console.log('- Decoded payload:', decoded);
    
    // Check token extraction
    const extractedToken = jwtUtils.extractTokenFromHeader(req);
    console.log('- Extracted token from header:', extractedToken ? 'Success' : 'Failed');
    
    // Check token verification via utils
    const verifiedToken = jwtUtils.verifyAccessToken(extractedToken);
    console.log('- Token verification via utils:', verifiedToken ? 'Valid' : 'Invalid');
    
    console.log('- Summary: Token is technically valid and correctly extracted');
  } catch (error) {
    console.error('- Error during token test:', error.message);
  }
}

// Test the auth middleware directly with a new token from login
async function testWithRealToken() {
  console.log('\n2. Testing with token from login:');
  const axios = require('axios');
  
  try {
    // Get a real token from login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'mr1018',
      password: 'Maya03112005'
    });
    
    const token = loginResponse.data.token;
    console.log('- Login succeeded, token:', token.substring(0, 20) + '...');
    
    // Decode and verify the token
    const decoded = jwt.decode(token);
    console.log('- Decoded token:', decoded);
    
    // Try to verify with our local config
    try {
      const verified = jwt.verify(token, jwtConfig.accessToken.secret);
      console.log('- Token verification with config secret:', verified ? 'Valid' : 'Invalid');
    } catch (error) {
      console.log('- Token verification failed:', error.message);
    }
    
    // Check with utils
    const verifiedWithUtils = jwtUtils.verifyAccessToken(token);
    console.log('- Token verification with utils:', verifiedWithUtils ? 'Valid' : 'Invalid');
    
    // Deeper check of sessionId and userId
    if (decoded) {
      console.log('- User ID in token:', decoded.sub || decoded.userId || 'Not found');
      console.log('- Session ID in token:', decoded.sessionId || 'Not found');
      console.log('- Role in token:', decoded.role || 'Not found');
    }
    
    console.log('- Username in token:', decoded.username || 'Not found');
  } catch (error) {
    console.error('- Error in real token test:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
  }
}

// Run tests
testValidTokenInHeader();
testWithRealToken().then(() => {
  console.log('\n=== Debug Complete ===');
}).catch(error => {
  console.error('Test failed:', error);
});