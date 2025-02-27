const crypto = require('crypto');

function generateQrCodeContent(qrStartToken, startTime, qrStartSecret) {
  const currentTime = Date.now() / 1000;
  const elapsedSeconds = Math.floor(currentTime - startTime);
  
  const hmacDigest = crypto
    .createHmac('sha256', qrStartSecret)
    .update(elapsedSeconds.toString())
    .digest('hex');
  
  return `bankid.${qrStartToken}.${elapsedSeconds}.${hmacDigest}`;
}

module.exports = { generateQrCodeContent };