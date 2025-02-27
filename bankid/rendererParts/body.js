function generateHtmlBody(globalIpAddress, savedOrders, lastOrderDetails, lastOrder) {
    return `
    <h1>BankID Authentication Test</h1>
    
    <div class="info-box">
      Using global IP address: <strong id="globalIp">${globalIpAddress}</strong>
      <button id="refreshIp">Refresh IP</button>
    </div>
    
    ${lastOrder ? `
    <div class="last-order">
      <h3>Last Order</h3>
      <p>Order Reference: <strong id="lastOrderRef">${lastOrder}</strong></p>
      <button id="cancelLastOrder" class="cancel">Cancel Last Order</button>
      ${lastOrderDetails && lastOrderDetails.status === 'active' ? `
      <button id="showLastQR">Show QR Code</button>
      ` : ''}
    </div>
    ` : ''}
    
    <div class="panel auth-methods">
      <h2>Authentication Methods</h2>
      <div class="method-tabs">
        <button class="tab-btn active" data-tab="qr-auth">QR Authentication</button>
        <button class="tab-btn" data-tab="same-device">Same Device</button>
        <button class="tab-btn" data-tab="phone">Direct Phone Notification</button>
      </div>
      
      <div id="qr-auth" class="tab-content active">
        <h3>QR Code Authentication</h3>
        <div class="input-group">
          <label for="personalNumber">Personal Number:</label>
          <input type="text" id="personalNumber" value="199801036816">
          <div class="auto-update">Request preview will update automatically</div>
        </div>
        
        <div class="request-preview">
          <pre id="requestPreview">{
    "endUserIp": "${globalIpAddress}",
    "returnUrl": "www.google.com",
    "userNonVisibleData": "dGVzdA==",
    "userVisibleData": "aGV5",
    "userVisibleDataFormat": "plaintext",
    "requirement": {
      "personalNumber": "199801036816"
    }
  }</pre>
        </div>
        
        <div class="button-group">
          <button id="sendRequest">Start Authentication</button>
          <button id="cancelRequest" class="cancel" disabled>Cancel Authentication</button>
        </div>
      </div>
      
      <div id="same-device" class="tab-content">
        <h3>Same Device Authentication</h3>
        <div class="input-group">
          <label for="personalNumberSameDevice">Personal Number:</label>
          <input type="text" id="personalNumberSameDevice" value="199801036816">
        </div>
        
        <div class="info-text">
          Authentication will start in this device's BankID app.
        </div>
        
        <div class="button-group">
          <button id="startSameDeviceAuth">Launch BankID</button>
        </div>
      </div>
      
      <div id="phone" class="tab-content">
        <h3>Direct Phone Notification</h3>
        <div class="input-group">
          <label for="personalNumberPhone">Personal Number:</label>
          <input type="text" id="personalNumberPhone" value="199801036816">
        </div>
        
        <div class="info-text">
          A notification will be sent directly to the BankID app on the user's phone.
        </div>
        
        <div class="request-preview">
          <pre id="phoneRequestPreview">{
    "callInitiator": "user",
    "personalNumber": "199801036816",
    "userNonVisibleData": "dGVzdA==",
    "userVisibleData": "SGVsbG8gdGhpcyBpcyBSaWNoYXJkIHBsZWFzZSBjb25maXJt",
    "userVisibleDataFormat": "simpleMarkdownV1"
  }</pre>
        </div>
        
        <div class="button-group">
          <button id="startPhoneAuth">Send Phone Notification</button>
          <button id="cancelPhoneRequest" class="cancel" disabled>Cancel</button>
        </div>
      </div>
      
      <div class="status" id="statusMessage"></div>
    </div>
    
    <div id="qrCode">
      <h2>QR Code</h2>
      <div id="authStatus" class="auth-status pending">Waiting for authentication...</div>
      
      <div class="autostart-container">
        <a href="#" id="autostartLink" class="autostart-link">Click here to launch BankID on this device</a>
      </div>
      
      <canvas id="qr-canvas"></canvas>
      <div id="qrValue"></div>
      <div class="qr-info">
        <p>This QR code updates every 2 seconds and should be scanned with the BankID app.</p>
        <p>QR Start Token: <span id="qrStartToken">Not available yet</span></p>
        <p>Order Reference: <span id="orderRef">Not available yet</span></p>
        <p>Auto Start Token: <span id="autoStartToken">Not available yet</span></p>
      </div>
    </div>
    
    <div id="response" class="panel">
      <h2>Response</h2>
      <pre id="responseData">Click the button to send a request</pre>
    </div>
    
    <div class="panel">
      <h2>Order History</h2>
      <table id="orderHistory">
        <thead>
          <tr>
            <th>Order Reference</th>
            <th>Personal Number</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${savedOrders.orders.map(order => `
          <tr>
            <td class="truncate" title="${order.orderRef}">${order.orderRef}</td>
            <td>${order.personalNumber || "N/A"}</td>
            <td>${new Date(order.timestamp).toLocaleString()}</td>
            <td><span class="badge ${order.status}">${order.status}</span></td>
            <td>${order.status === 'active' ? 
              `<button class="cancel order-cancel" data-orderref="${order.orderRef}">Cancel</button>
               <button class="show-qr" data-orderref="${order.orderRef}">Show QR</button>` : 
              ''}
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `;
  }
  
  module.exports = { generateHtmlBody };