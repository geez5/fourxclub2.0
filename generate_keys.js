const crypto = require('crypto');
const k1 = crypto.randomBytes(32).toString('hex');
const k2 = crypto.randomBytes(16).toString('hex');
const k3 = crypto.randomBytes(32).toString('hex');
console.log(`JWT_SECRET=${k1}`);
console.log(`ENCRYPTION_KEY=${k2}`);
console.log(`VIDEO_TOKEN_SECRET=${k3}`);
