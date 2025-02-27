function generateHtmlFooter() {
    return `
    <script>
      const personalNumberInput = document.getElementById('personalNumber');
      const personalNumberSameDeviceInput = document.getElementById('personalNumberSameDevice');
      const personalNumberPhoneInput = document.getElementById('personalNumberPhone');
      const requestPreview = document.getElementById('requestPreview');
      const phoneRequestPreview = document.getElementById('phoneRequestPreview');
      const responseArea = document.getElementById('responseData');
      const qrCodeDiv = document.getElementById('qrCode');
      const qrCanvas = document.getElementById('qr-canvas');
      const qrValueDiv = document.getElementById('qrValue');
      const qrStartTokenSpan = document.getElementById('qrStartToken');
      const orderRefSpan = document.getElementById('orderRef');
      const autoStartTokenSpan = document.getElementById('autoStartToken');
      const autostartLink = document.getElementById('autostartLink');
      const statusMessage = document.getElementById('statusMessage');
      const sendRequestBtn = document.getElementById('sendRequest');
      const startSameDeviceAuthBtn = document.getElementById('startSameDeviceAuth');
      const startPhoneAuthBtn = document.getElementById('startPhoneAuth');
      const cancelRequestBtn = document.getElementById('cancelRequest');
      const cancelPhoneRequestBtn = document.getElementById('cancelPhoneRequest');
      const globalIpSpan = document.getElementById('globalIp');
      const refreshIpBtn = document.getElementById('refreshIp');
      const authStatusDiv = document.getElementById('authStatus');
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');
      
      const lastOrderRef = document.getElementById('lastOrderRef');
      const cancelLastOrderBtn = document.getElementById('cancelLastOrder');
      const showLastQRBtn = document.getElementById('showLastQR');
      
      let qrUpdateInterval;
      let collectInterval;
      let authStartTime;
      let qrStartToken;
      let qrStartSecret;
      let autoStartToken;
      let currentOrderRef = null;
      let qr = null;
      
      // Tab switching
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons and contents
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Add active class to clicked button and corresponding content
          button.classList.add('active');
          const tabId = button.dataset.tab;
          document.getElementById(tabId).classList.add('active');
        });
      });
      
      if (refreshIpBtn) {
        refreshIpBtn.addEventListener('click', function() {
          fetch('/refresh-ip')
            .then(response => response.json())
            .then(data => {
              globalIpSpan.textContent = data.ip;
              updateRequestPreview();
              updatePhoneRequestPreview();
            })
            .catch(error => {
              console.error('Error refreshing IP:', error);
            });
        });
      }
      
      if (showLastQRBtn) {
        showLastQRBtn.addEventListener('click', function() {
          const orderRef = lastOrderRef.textContent;
          showQrCodeForOrder(orderRef);
        });
      }
      
      if (cancelLastOrderBtn) {
        cancelLastOrderBtn.addEventListener('click', function() {
          const orderRef = lastOrderRef.textContent;
          cancelOrder(orderRef);
        });
      }
      
      document.querySelectorAll('.order-cancel').forEach(button => {
        button.addEventListener('click', function() {
          const orderRef = this.dataset.orderref;
          cancelOrder(orderRef);
        });
      });
      
      document.querySelectorAll('.show-qr').forEach(button => {
        button.addEventListener('click', function() {
          const orderRef = this.dataset.orderref;
          showQrCodeForOrder(orderRef);
        });
      });
      
      // Phone authentication
      startPhoneAuthBtn.addEventListener('click', function() {
        const personalNumber = personalNumberPhoneInput.value.trim();
        responseArea.textContent = 'Sending phone authentication request...';
        statusMessage.textContent = '';
        
        startPhoneAuthBtn.disabled = true;
        
        stopAllIntervals();
        
        qrCodeDiv.style.display = 'none';
        
        const phoneAuthData = {
          callInitiator: "user",
          personalNumber: personalNumber,
          userNonVisibleData: "dGVzdA==",
          userVisibleData: "SGVsbG8gdGhpcyBpcyBSaWNoYXJkIHBsZWFzZSBjb25maXJt",
          userVisibleDataFormat: "simpleMarkdownV1"
        };
        
        fetch('/phone/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(phoneAuthData)
        })
          .then(response => response.json())
          .then(data => {
            responseArea.textContent = JSON.stringify(data, null, 2);
            
            if (data.status === 200 && data.body && data.body.orderRef) {
                console.log(data);
              currentOrderRef = data.body.orderRef;
              orderRefSpan.textContent = currentOrderRef;
              cancelPhoneRequestBtn.disabled = false;
              statusMessage.textContent = 'Phone authentication initiated';
              
              // Start checking authentication status
              collectInterval = setInterval(checkAuthStatus, 2000);
            }
            
            startPhoneAuthBtn.disabled = false;
          })
          .catch(error => {
            responseArea.textContent = 'Error: ' + error.message;
            statusMessage.textContent = 'Error: ' + error.message;
            
            startPhoneAuthBtn.disabled = false;
          });
      });
      
      // Same device authentication
      startSameDeviceAuthBtn.addEventListener('click', function() {
        const personalNumber = personalNumberSameDeviceInput.value.trim();
        responseArea.textContent = 'Sending authentication request...';
        statusMessage.textContent = '';
        
        startSameDeviceAuthBtn.disabled = true;
        
        stopAllIntervals();
        
        qrCodeDiv.style.display = 'none';
        
        fetch('/auth?personalNumber=' + encodeURIComponent(personalNumber))
          .then(response => response.json())
          .then(data => {
            console.log(data);
            responseArea.textContent = JSON.stringify(data, null, 2);
            
            if (data.body && data.body.orderRef && data.body.autoStartToken) {
              currentOrderRef = data.body.orderRef;
              autoStartToken = data.body.autoStartToken;
              
              statusMessage.textContent = 'Authentication initiated with autoStartToken';
              
              // Launch BankID app directly
              window.location.href = 'bankid:///?autostarttoken=' + autoStartToken + '&redirect=null';
              
              // Start monitoring authentication status
              collectInterval = setInterval(checkAuthStatus, 2000);
            }
            
            startSameDeviceAuthBtn.disabled = false;
          })
          .catch(error => {
            responseArea.textContent = 'Error: ' + error.message;
            statusMessage.textContent = 'Error: ' + error.message;
            
            startSameDeviceAuthBtn.disabled = false;
          });
      });
      
      function updateAutostartLink(token) {
        if (token) {
          autostartLink.href = 'bankid:///?autostarttoken=' + token + '&redirect=null';
          autostartLink.style.display = 'inline-block';
        } else {
          autostartLink.style.display = 'none';
        }
      }
      
      function showQrCodeForOrder(orderRef) {
        if (!orderRef) {
          statusMessage.textContent = 'No order reference provided';
          return;
        }
        
        fetch('/order-details?orderRef=' + encodeURIComponent(orderRef))
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              statusMessage.textContent = data.error;
              return;
            }
            
            stopAllIntervals();
            
            currentOrderRef = data.orderRef;
            qrStartToken = data.qrStartToken;
            qrStartSecret = data.qrStartSecret;
            autoStartToken = data.autoStartToken;
            authStartTime = new Date(data.timestamp).getTime() / 1000;
            
            orderRefSpan.textContent = currentOrderRef;
            qrStartTokenSpan.textContent = qrStartToken || 'Not available';
            autoStartTokenSpan.textContent = autoStartToken || 'Not available';
            
            updateAutostartLink(autoStartToken);
            
            qrCodeDiv.style.display = 'block';
            authStatusDiv.style.display = 'block';
            authStatusDiv.className = 'auth-status pending';
            authStatusDiv.textContent = 'Waiting for authentication...';
            
            if (qrStartToken && qrStartSecret) {
              updateQrCode();
              qrUpdateInterval = setInterval(updateQrCode, 2000);
            } else {
              qrCanvas.style.display = 'none';
              qrValueDiv.textContent = 'QR code not available for this authentication method';
            }
            
            collectInterval = setInterval(checkAuthStatus, 2000);
          })
          .catch(error => {
            statusMessage.textContent = 'Error getting order details: ' + error.message;
          });
      }
      
      function cancelOrder(orderRef) {
        if (!orderRef) {
          statusMessage.textContent = 'No order reference provided';
          return;
        }
        
        statusMessage.textContent = 'Cancelling authentication...';
        responseArea.textContent = 'Sending cancel request...';
        
        fetch('/cancel?orderRef=' + encodeURIComponent(orderRef))
          .then(response => response.json())
          .then(data => {
            responseArea.textContent = JSON.stringify(data, null, 2);
            
            statusMessage.textContent = 'Authentication cancelled successfully';
            
            if (currentOrderRef === orderRef) {
              stopAllIntervals();
              qrCodeDiv.style.display = 'none';
            }
            
            setTimeout(() => {
              location.reload();
            }, 1500);
          })
          .catch(error => {
            responseArea.textContent = 'Error cancelling: ' + error.message;
            statusMessage.textContent = 'Failed to cancel authentication';
          });
      }
      
      function checkAuthStatus() {
        if (!currentOrderRef) {
          return;
        }
        
        fetch('/collect?orderRef=' + encodeURIComponent(currentOrderRef))
          .then(response => response.json())
          .then(data => {
            const collectData = data.body;
            
            responseArea.textContent = JSON.stringify(data, null, 2);
            
            if (collectData) {
              if (collectData.status === 'pending') {
                // Still pending, update status message
                if (authStatusDiv.style.display === 'block') {
                  authStatusDiv.className = 'auth-status pending';
                  authStatusDiv.textContent = 'Status: ' + (collectData.hintCode || 'Waiting for authentication...');
                }
                statusMessage.textContent = 'Status: ' + (collectData.hintCode || 'Waiting for authentication...');
              }
              else if (collectData.status === 'complete') {
                // Authentication complete
                if (authStatusDiv.style.display === 'block') {
                  authStatusDiv.className = 'auth-status complete';
                  authStatusDiv.textContent = 'Authentication successful!';
                }
                
                // Stop intervals
                stopAllIntervals();
                
                // Update UI
                statusMessage.textContent = 'Authentication completed successfully!';
                
                // Disable cancel buttons
                cancelRequestBtn.disabled = true;
                cancelPhoneRequestBtn.disabled = true;
              }
              else if (collectData.status === 'failed') {
                // Authentication failed
                if (authStatusDiv.style.display === 'block') {
                  authStatusDiv.className = 'auth-status failed';
                  authStatusDiv.textContent = 'Authentication failed: ' + collectData.hintCode;
                }
                
                // Stop intervals
                stopAllIntervals();
                
                // Update UI
                statusMessage.textContent = 'Authentication failed: ' + collectData.hintCode;
                
                // Disable cancel buttons
                cancelRequestBtn.disabled = true;
                cancelPhoneRequestBtn.disabled = true;
              }
            }
          })
          .catch(error => {
            console.error('Error checking auth status:', error);
          });
      }
      
      function stopAllIntervals() {
        if (qrUpdateInterval) {
          clearInterval(qrUpdateInterval);
          qrUpdateInterval = null;
        }
        
        if (collectInterval) {
          clearInterval(collectInterval);
          collectInterval = null;
        }
      }
      
      personalNumberInput.addEventListener('input', updateRequestPreview);
      personalNumberPhoneInput.addEventListener('input', updatePhoneRequestPreview);
      
      function updateRequestPreview() {
        const personalNumber = personalNumberInput.value.trim() || "199801036816";
        
        const requestData = {
          endUserIp: globalIpSpan.textContent,
          returnUrl: "www.google.com",
          userNonVisibleData: "dGVzdA==",
          userVisibleData: "aGV5",
          userVisibleDataFormat: "plaintext",
          requirement: {
            personalNumber: personalNumber
          }
        };
        
        requestPreview.textContent = JSON.stringify(requestData, null, 2);
      }
      
      function updatePhoneRequestPreview() {
        const personalNumber = personalNumberPhoneInput.value.trim() || "199801036816";
        
        const phoneRequestData = {
          callInitiator: "user",
          personalNumber: personalNumber,
          userNonVisibleData: "dGVzdA==",
          userVisibleData: "SGVsbG8gdGhpcyBpcyBSaWNoYXJkIHBsZWFzZSBjb25maXJt",
          userVisibleDataFormat: "simpleMarkdownV1"
        };
        
        phoneRequestPreview.textContent = JSON.stringify(phoneRequestData, null, 2);
      }
      
      function updateQrCode() {
        if (!qrStartToken || !authStartTime || !qrStartSecret) {
          console.error('Missing required QR data');
          return;
        }
        
        const payload = {
          qrStartToken: qrStartToken,
          startTime: authStartTime,
          qrStartSecret: qrStartSecret
        };
        
        fetch('/qrcode?' + new URLSearchParams(payload))
          .then(response => response.text())
          .then(qrContent => {
            // Create a new QRious instance with the content
            qr = new QRious({
              element: qrCanvas,
              value: qrContent,
              size: 300,
              level: 'H' // High error correction
            });
            
            // Display QR code value
            qrValueDiv.textContent = qrContent;
          })
          .catch(error => {
            console.error('Error updating QR code:', error);
          });
      }
      
      cancelRequestBtn.addEventListener('click', function() {
        if (!currentOrderRef) {
          statusMessage.textContent = 'No active authentication to cancel';
          return;
        }
        
        cancelOrder(currentOrderRef);
      });
      
      cancelPhoneRequestBtn.addEventListener('click', function() {
        if (!currentOrderRef) {
          statusMessage.textContent = 'No active authentication to cancel';
          return;
        }
        
        cancelOrder(currentOrderRef);
      });
      
      sendRequestBtn.addEventListener('click', function() {
        const personalNumber = personalNumberInput.value.trim();
        responseArea.textContent = 'Sending request to BankID...';
        statusMessage.textContent = '';
        
        sendRequestBtn.disabled = true;
        
        stopAllIntervals();
        
        qrCodeDiv.style.display = 'none';
        
        fetch('/auth?personalNumber=' + encodeURIComponent(personalNumber))
          .then(response => response.json())
          .then(data => {
            responseArea.textContent = JSON.stringify(data, null, 2);
            
            if (data.body && data.body.orderRef) {
            console.log(data);
              currentOrderRef = data.body.orderRef;
              orderRefSpan.textContent = currentOrderRef;
              cancelRequestBtn.disabled = false;
              statusMessage.textContent = 'Authentication initiated';
              
              qrStartToken = data.body.qrStartToken;
              qrStartSecret = data.body.qrStartSecret;
              autoStartToken = data.body.autoStartToken;
              authStartTime = data.startTime;
              
              qrStartTokenSpan.textContent = qrStartToken || 'Not available';
              autoStartTokenSpan.textContent = autoStartToken || 'Not available';
              
              updateAutostartLink(autoStartToken);
              
              qrCodeDiv.style.display = 'block';
              authStatusDiv.style.display = 'block';
              authStatusDiv.className = 'auth-status pending';
              authStatusDiv.textContent = 'Waiting for authentication...';
              
              if (qrStartToken && qrStartSecret) {
                updateQrCode();
                qrUpdateInterval = setInterval(updateQrCode, 2000);
              } else {
                qrCanvas.style.display = 'none';
                qrValueDiv.textContent = 'QR code not available for this authentication method';
              }
              
              collectInterval = setInterval(checkAuthStatus, 2000);
            }
            
            sendRequestBtn.disabled = false;
          })
          .catch(error => {
            responseArea.textContent = 'Error: ' + error.message;
            statusMessage.textContent = 'Error: ' + error.message;
            
            sendRequestBtn.disabled = false;
          });
      });
      
      // Initialize previews
      updateRequestPreview();
      updatePhoneRequestPreview();
    </script>
  </body>
  </html>
    `;
  }
  
  module.exports = { generateHtmlFooter };