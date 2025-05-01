// Script to test JWT configuration
const configMain = require('./src/config/config');
const jwtConfig = require('./src/config/jwt.config');

console.log('=== JWT Configuration Comparison ===');

console.log('\nMain Config JWT Secret:');
console.log('- Value:', configMain.jwtSecret ? `${configMain.jwtSecret.substring(0, 10)}...` : 'Not set');
console.log('- Type:', typeof configMain.jwtSecret);
console.log('- Length:', configMain.jwtSecret ? configMain.jwtSecret.length : 0);

console.log('\nJWT Config Access Token Secret:');
console.log('- Value:', jwtConfig.accessToken.secret ? `${jwtConfig.accessToken.secret.substring(0, 10)}...` : 'Not set');
console.log('- Type:', typeof jwtConfig.accessToken.secret);
console.log('- Length:', jwtConfig.accessToken.secret ? jwtConfig.accessToken.secret.length : 0);

console.log('\nJWT Config Refresh Token Secret:');
console.log('- Value:', jwtConfig.refreshToken.secret ? `${jwtConfig.refreshToken.secret.substring(0, 10)}...` : 'Not set');
console.log('- Type:', typeof jwtConfig.refreshToken.secret);
console.log('- Length:', jwtConfig.refreshToken.secret ? jwtConfig.refreshToken.secret.length : 0);

console.log('\nSECRET COMPARISON:');
console.log('Main config secret === JWT config access secret?', configMain.jwtSecret === jwtConfig.accessToken.secret);
console.log('Main config secret === JWT config refresh secret?', configMain.jwtSecret === jwtConfig.refreshToken.secret);

console.log('\n=== JWT Configuration Comparison Complete ===')