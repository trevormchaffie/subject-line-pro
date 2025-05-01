// Script to debug JWT token issues
const jwt = require('jsonwebtoken');
const jwtConfig = require('./src/config/jwt.config');
const jwtUtils = require('./src/utils/jwt.utils');

console.log('=== JWT Token Debugger ===');

// 1. Check JWT configuration
console.log('\n1. JWT Configuration:');
console.log('Access Token Secret:', jwtConfig.accessToken.secret ? `${jwtConfig.accessToken.secret.substring(0, 5)}...` : 'Not set');
console.log('Access Token Expiration:', jwtConfig.accessToken.expiresIn);
console.log('Refresh Token Secret:', jwtConfig.refreshToken.secret ? `${jwtConfig.refreshToken.secret.substring(0, 5)}...` : 'Not set');
console.log('Refresh Token Expiration:', jwtConfig.refreshToken.expiresIn);

// 2. Create a test token
console.log('\n2. Creating test token:');
const testUserData = {
  id: 'test-user-123',
  username: 'mr1018',
  role: 'admin'
};

let accessToken;
try {
  accessToken = jwtUtils.generateAccessToken(testUserData.id, testUserData.role);
  console.log('Access Token Created:', accessToken.substring(0, 20) + '...');
  
  // Decode token
  const decoded = jwt.decode(accessToken);
  console.log('Decoded Token:', decoded);
} catch (error) {
  console.error('Error creating access token:', error.message);
}

// 3. Verify the test token
console.log('\n3. Verifying test token:');
if (accessToken) {
  try {
    const verified = jwtUtils.verifyAccessToken(accessToken);
    console.log('Token Verification Result:', verified ? 'Valid' : 'Invalid');
    console.log('Verified Data:', verified);
  } catch (error) {
    console.error('Error verifying access token:', error.message);
  }
}

// 4. Compare with different secret (simulate mismatched configs)
console.log('\n4. Verification with mismatched secrets:');
try {
  const wrongSecret = 'wrong-secret-key';
  let isValid = false;
  
  try {
    jwt.verify(accessToken, wrongSecret);
    isValid = true;
  } catch (e) {
    isValid = false;
  }
  
  console.log('Valid with wrong secret?', isValid);
  
  // Try with configured secret directly (bypass utils)
  try {
    const result = jwt.verify(accessToken, jwtConfig.accessToken.secret);
    console.log('Valid with config secret?', !!result);
    console.log('Direct verification result:', result);
  } catch (e) {
    console.log('Valid with config secret?', false);
    console.log('Direct verification error:', e.message);
  }
} catch (error) {
  console.error('Error in secret comparison test:', error.message);
}

// 5. Check for any token blacklisting
console.log('\n5. Checking if token is blacklisted:');
try {
  // This is a simple test to see if the token we just generated is in blacklist
  // This depends on how your blacklist is structured
  const isBlacklisted = !(jwtUtils.verifyAccessToken(accessToken));
  console.log('Is Test Token Blacklisted?', isBlacklisted);
} catch (error) {
  console.error('Error checking token blacklist:', error.message);
}

console.log('\n=== Debug Complete ===');