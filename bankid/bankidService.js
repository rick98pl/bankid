const https = require('https');
const fs = require('fs');
const { updateOrderStatus } = require('./orderService');

function makeBankIDRequest(endpoint, data, ca, cert, key) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify(data);

    const options = {
      hostname: 'appapi2.test.bankid.com',
      port: 443,
      path: `/rp/v6.0/${endpoint}`,
      method: 'POST',
      ca: ca,
      cert: cert,
      key: key,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`${endpoint} Status: ${res.statusCode}`);
        
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error making BankID ${endpoint} request:`, error.message);
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

function phoneIdAuth(personalNumber, ipAddress, ca, cert, key){
    const data = {
        callInitiator: "user",
        userNonVisibleData: "dGVzdA==",
        userVisibleData: "aGV5",
        userVisibleDataFormat: "simpleMarkdownV1",
        personalNumber: personalNumber || "199801036816"
      };
      const startTime = Date.now() / 1000;

  return makeBankIDRequest('phone/auth', data, ca, cert, key)
    .then(response => {
      return {
        ...response,
        startTime: startTime
      };
    });
}

function bankIDAuth(personalNumber, ipAddress, ca, cert, key) {
  const data = {
    endUserIp: ipAddress,
    returnUrl: "www.google.com",
    userNonVisibleData: "dGVzdA==",
    userVisibleData: "aGV5",
    userVisibleDataFormat: "plaintext",
    requirement: {
      personalNumber: personalNumber || "199801036816"
    }
  };

  const startTime = Date.now() / 1000;

  return makeBankIDRequest('auth', data, ca, cert, key)
    .then(response => {
      return {
        ...response,
        startTime: startTime
      };
    });
}

function bankIDCancel(orderRef, ca, cert, key) {
  const data = {
    orderRef: orderRef
  };

  return makeBankIDRequest('cancel', data, ca, cert, key)
    .then(response => {
      if (response.status === 200) {
        updateOrderStatus(orderRef, 'cancelled');
      }
      return response;
    });
}

function bankIDCollect(orderRef, ca, cert, key) {
  const data = {
    orderRef: orderRef
  };

  return makeBankIDRequest('collect', data, ca, cert, key)
    .then(response => {
      if (response.status === 200 && response.body.status === 'complete') {
        updateOrderStatus(orderRef, 'complete');
      }
      return response;
    });
}

module.exports = {
  phoneIdAuth,
  bankIDAuth,
  bankIDCancel,
  bankIDCollect
};