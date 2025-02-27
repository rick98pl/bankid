const fs = require('fs');
const http = require('http');
const url = require('url');
const { getGlobalIpAddress } = require('./ipService');
const { readSavedOrders, saveOrder, getOrderDetails } = require('./orderService');
const { generateQrCodeContent } = require('./qrService');
const { renderHtml } = require('./htmlRenderer');
const { phoneIdAuth, bankIDAuth, bankIDCancel, bankIDCollect } = require('./bankidService');

let globalIpAddress = '127.0.0.1';

try {
  const ca = fs.readFileSync('./appapi2.test.bankid.com.pem');
  const cert = fs.readFileSync('./FPTestcert5_20240610_cert.pem');
  const key = fs.readFileSync('./FPTestcert5_20240610_key.pem');

  getGlobalIpAddress().then(ip => {
    globalIpAddress = ip;
    console.log(`Using global IP address: ${globalIpAddress}`);
  }).catch(err => {
    console.error('Failed to get global IP, using default:', err);
  });

  // Handle POST request body
  function readRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', (error) => {
        reject(error);
      });
    });
  }

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/') {
      const savedOrders = readSavedOrders();
      const lastOrder = savedOrders.lastOrder;
      const lastOrderDetails = lastOrder ? getOrderDetails(lastOrder) : null;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(renderHtml(globalIpAddress, savedOrders, lastOrderDetails));
    } else if (parsedUrl.pathname === '/refresh-ip') {
      getGlobalIpAddress().then(ip => {
        globalIpAddress = ip;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ip: globalIpAddress }));
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
    } else if (parsedUrl.pathname === '/auth') {
      console.log('server.js /auth');
      const personalNumber = parsedUrl.query.personalNumber;
      
      bankIDAuth(personalNumber, globalIpAddress, ca, cert, key)
        .then(response => {
          if (response.status === 200 && response.body.orderRef) {
            saveOrder(
              response.body.orderRef,
              personalNumber,
              response.body.qrStartToken,
              response.body.qrStartSecret,
              response.body.autoStartToken
            );
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        })
        .catch(error => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });
    } else if (parsedUrl.pathname === '/phone/auth' && req.method === 'POST') {
      const personalNumber = parsedUrl.query.personalNumber;
      
      phoneIdAuth(personalNumber, globalIpAddress, ca, cert, key)
        .then(response => {
          if (response.status === 200 && response.body.orderRef) {
            saveOrder(
              response.body.orderRef,
              personalNumber,
              response.body.qrStartToken,
              response.body.qrStartSecret,
              response.body.autoStartToken
            );
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        })
        .catch(error => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });
    } else if (parsedUrl.pathname === '/cancel') {
      const orderRef = parsedUrl.query.orderRef;
      
      bankIDCancel(orderRef, ca, cert, key)
        .then(response => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        })
        .catch(error => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });
    } else if (parsedUrl.pathname === '/collect') {
      const orderRef = parsedUrl.query.orderRef;
      
      bankIDCollect(orderRef, ca, cert, key)
        .then(response => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        })
        .catch(error => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });
    } else if (parsedUrl.pathname === '/qrcode') {
      const qrStartToken = parsedUrl.query.qrStartToken;
      const startTime = parseFloat(parsedUrl.query.startTime);
      const qrStartSecret = parsedUrl.query.qrStartSecret;
      
      if (!qrStartToken || !startTime || !qrStartSecret) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing required parameters');
        return;
      }
      
      try {
        const qrContent = generateQrCodeContent(qrStartToken, startTime, qrStartSecret);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(qrContent);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error generating QR code: ' + error.message);
      }
    } else if (parsedUrl.pathname === '/order-details') {
      const orderRef = parsedUrl.query.orderRef;
      
      if (!orderRef) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'orderRef is required' }));
        return;
      }
      
      const orderDetails = getOrderDetails(orderRef);
      
      if (!orderDetails) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Order not found' }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(orderDetails));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
  });

} catch (error) {
  console.error('Error starting the application:', error.message);
  console.error('Make sure the certificate files are in the same directory as this script:');
  console.error('- appapi2.test.bankid.com.pem');
  console.error('- FPTestcert5_20240610_cert.pem');
  console.error('- FPTestcert5_20240610_key.pem');
}