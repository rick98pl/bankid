const { generateHtmlHeader } = require('./rendererParts/header');
const { generateHtmlFooter } = require('./rendererParts/footer');
const { generateHtmlBody } = require('./rendererParts/body');

function renderHtml(globalIpAddress, savedOrders, lastOrderDetails) {
  const lastOrder = savedOrders.lastOrder;
  
  const header = generateHtmlHeader();
  const body = generateHtmlBody(globalIpAddress, savedOrders, lastOrderDetails, lastOrder);
  const footer = generateHtmlFooter();
  
  return `${header}${body}${footer}`;
}

module.exports = { renderHtml };