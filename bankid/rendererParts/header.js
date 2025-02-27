function generateHtmlHeader() {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BankID Authentication Test</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
      }
      h1, h2, h3 {
        color: #0066cc;
      }
      button {
        background-color: #0066cc;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin: 10px 10px 10px 0;
      }
      button:hover {
        background-color: #004c99;
      }
      button.cancel {
        background-color: #cc0000;
      }
      button.cancel:hover {
        background-color: #990000;
      }
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      pre {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
        overflow: auto;
        white-space: pre-wrap;
      }
      #response {
        margin-top: 20px;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        margin: 20px 0;
      }
      .input-group {
        margin: 10px 0;
      }
      .input-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      .input-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      .request-preview {
        margin-top: 15px;
      }
      .auto-update {
        color: #009900;
        font-size: 14px;
        margin-top: 5px;
        font-style: italic;
      }
      #qrCode {
        display: none;
        margin-top: 20px;
        text-align: center;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      #qr-canvas {
        background-color: white;
        margin: 0 auto;
        display: block;
      }
      #qrValue {
        font-family: monospace;
        word-break: break-all;
        margin-top: 10px;
        font-size: 12px;
      }
      .qr-info {
        font-size: 14px;
        margin-top: 10px;
        background-color: #ffffcc;
        padding: 10px;
        border-radius: 4px;
      }
      .info-box {
        background-color: #e6f3ff;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .info-text {
        margin: 15px 0;
        padding: 10px;
        background-color: #f8f9fa;
        border-left: 4px solid #17a2b8;
        border-radius: 4px;
      }
      .status {
        font-weight: bold;
        margin-top: 10px;
      }
      .button-group {
        display: flex;
        gap: 10px;
      }
      .last-order {
        background-color: #efefef;
        padding: 15px;
        border-radius: 4px;
        margin: 15px 0;
        border-left: 4px solid #0066cc;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      table th, table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      table th {
        background-color: #f2f2f2;
      }
      .badge {
        display: inline-block;
        padding: 3px 7px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
        color: white;
      }
      .badge.active {
        background-color: #28a745;
      }
      .badge.cancelled {
        background-color: #dc3545;
      }
      .badge.complete {
        background-color: #17a2b8;
      }
      .truncate {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .auth-status {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        background-color: #f0f0f0;
        text-align: center;
        font-weight: bold;
        display: none;
      }
      .auth-status.pending {
        background-color: #fff3cd;
        color: #856404;
      }
      .auth-status.failed {
        background-color: #f8d7da;
        color: #721c24;
      }
      .auth-status.complete {
        background-color: #d4edda;
        color: #155724;
      }
      .autostart-container {
        margin: 15px 0;
        padding: 10px;
        background-color: #e8f4ff;
        border-radius: 4px;
        text-align: center;
      }
      .autostart-link {
        display: inline-block;
        padding: 10px 15px;
        background-color: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
      }
      .autostart-link:hover {
        background-color: #218838;
      }
      .method-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
      }
      .tab-btn {
        margin: 0;
        padding: 10px 20px;
        background-color: #f0f0f0;
        color: #333;
        border: 1px solid #ddd;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
      }
      .tab-btn:hover {
        background-color: #e0e0e0;
      }
      .tab-btn.active {
        background-color: #0066cc;
        color: white;
      }
      .tab-content {
        display: none;
        padding: 15px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 4px 4px;
      }
      .tab-content.active {
        display: block;
      }
    </style>
    <!-- Include QRious library for QR code generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
  </head>
  <body>
    `;
  }
  
  module.exports = { generateHtmlHeader };