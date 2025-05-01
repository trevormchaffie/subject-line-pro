// Script to fix JWT auth issues
const fs = require('fs');
const path = require('path');

console.log('=== JWT Auth Fix ===');

// Option 1: Modify jwt.utils.js to use config.jwtSecret for verification
const jwtUtilsPath = path.join(__dirname, 'src', 'utils', 'jwt.utils.js');
const jwtUtilsContent = fs.readFileSync(jwtUtilsPath, 'utf8');

console.log('1. Creating backup of jwt.utils.js');
fs.writeFileSync(`${jwtUtilsPath}.bak`, jwtUtilsContent, 'utf8');
console.log('   Backup created at', `${jwtUtilsPath}.bak`);

// Fix the JWT utils to use config.jwtSecret for verification
console.log('2. Modifying jwt.utils.js to use main config JWT secret');

// Add import for main config
const updatedContent = jwtUtilsContent.replace(
  'const config = require("../config/jwt.config");',
  `const config = require("../config/jwt.config");
const mainConfig = require("../config/config");`
);

// Update the verification function to use main config secret
const updatedVerification = updatedContent.replace(
  'return jwt.verify(token, config.accessToken.secret);',
  'return jwt.verify(token, mainConfig.jwtSecret);'
);

fs.writeFileSync(jwtUtilsPath, updatedVerification, 'utf8');

console.log('3. JWT utils updated to use main config JWT secret');
console.log('   Changes made:');
console.log('   - Added import for main config');
console.log('   - Updated token verification to use mainConfig.jwtSecret');

console.log('\n=== Fix Complete ===');
console.log('Please restart the server and try the API tests again.')