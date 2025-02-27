const fs = require('fs');

const ORDERS_FILE_PATH = './bankid-orders.json';

function readSavedOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading orders file:', error.message);
  }
  
  return { lastOrder: null, orders: [] };
}

function saveOrder(orderRef, personalNumber, qrStartToken, qrStartSecret, autoStartToken) {
  try {
    const orders = readSavedOrders();
    
    const timestamp = new Date().toISOString();
    orders.orders.push({
      orderRef,
      personalNumber,
      timestamp,
      status: 'active',
      qrStartToken,
      qrStartSecret,
      autoStartToken
    });
    
    orders.lastOrder = orderRef;
    
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2));
    console.log(`Saved order ${orderRef} to file`);
    
    return orders;
  } catch (error) {
    console.error('Error saving order:', error.message);
    return readSavedOrders();
  }
}

function updateOrderStatus(orderRef, status) {
  try {
    const orders = readSavedOrders();
    
    const order = orders.orders.find(o => o.orderRef === orderRef);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
    
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2));
    console.log(`Updated order ${orderRef} status to ${status}`);
    
    return orders;
  } catch (error) {
    console.error('Error updating order status:', error.message);
    return readSavedOrders();
  }
}

function getOrderDetails(orderRef) {
  const orders = readSavedOrders();
  return orders.orders.find(o => o.orderRef === orderRef);
}

module.exports = {
  readSavedOrders,
  saveOrder,
  updateOrderStatus,
  getOrderDetails
};