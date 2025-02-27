const https = require('https');

function getGlobalIpAddress() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.ipify.org',
      port: 443,
      path: '?format=json',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`Global IP detected: ${result.ip}`);
          resolve(result.ip);
        } catch (e) {
          console.error('Error parsing IP address:', e);
          resolve('127.0.0.1');
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error getting global IP:', error.message);
      resolve('127.0.0.1');
    });
    
    req.end();
  });
}

module.exports = { getGlobalIpAddress };