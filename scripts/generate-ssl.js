const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// 生成证书
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048,
  extensions: [
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2,
          value: 'localhost'
        },
        {
          type: 2,
          value: '127.0.0.1'
        }
      ]
    }
  ]
});

// 确保 ssl 目录存在
const sslDir = path.join(__dirname, '..', 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

// 写入证书文件
fs.writeFileSync(path.join(sslDir, 'localhost-key.pem'), pems.private);
fs.writeFileSync(path.join(sslDir, 'localhost-cert.pem'), pems.cert);

console.log('SSL certificates generated successfully!'); 