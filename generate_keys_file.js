const crypto = require('crypto');
const fs = require('fs');
const k1 = crypto.randomBytes(32).toString('hex');
const k2 = crypto.randomBytes(16).toString('hex');
const k3 = crypto.randomBytes(32).toString('hex');
const content = `JWT_SECRET=${k1}\nENCRYPTION_KEY=${k2}\nVIDEO_TOKEN_SECRET=${k3}`;
fs.writeFileSync('generated_keys.txt', content);
