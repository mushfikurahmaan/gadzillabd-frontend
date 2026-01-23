'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import styles from './Success.module.css';

interface OrderData {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  subtotal: number;
  shipping: number;
  createdAt: string;
}

export default function ReceiptDownload() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Get order data from sessionStorage
    const stored = sessionStorage.getItem('lastOrder');
    if (stored) {
      try {
        setOrderData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse order data:', e);
      }
    }
  }, []);

  const downloadReceipt = () => {
    if (!orderData) return;

    // Ensure all numeric values are numbers (they might be strings from sessionStorage)
    const total = typeof orderData.total === 'string' ? Number(orderData.total) : orderData.total;
    const subtotal = typeof orderData.subtotal === 'string' ? Number(orderData.subtotal) : orderData.subtotal;
    const shipping = typeof orderData.shipping === 'string' ? Number(orderData.shipping) : orderData.shipping;
    
    // Helper function to safely format numbers
    const formatPrice = (value: number | string): string => {
      const num = typeof value === 'string' ? Number(value) : value;
      return Number.isFinite(num) ? num.toFixed(2) : '0.00';
    };

    const websiteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gadzillabd.com';

    // Create receipt HTML
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Receipt - GADZILLA</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #ff4444;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #ff4444;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      color: #2d2d2d;
      font-size: 18px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 5px 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #2d2d2d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background-color: #f5f5f5;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #e0e0e0;
      font-weight: 600;
      color: #2d2d2d;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .text-right {
      text-align: right;
    }
    .total-row {
      font-weight: 600;
      font-size: 16px;
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GADZILLA</h1>
    <p>Your Ultimate Gadgets & Accessories Destination</p>
    <p>Email: gadzillabd@gmail.com</p>
  </div>

  <div class="section">
    <h2>Order Information</h2>
    <div class="info-row">
      <span class="info-label">Order ID:</span>
      <span class="info-value">${orderData.orderId}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Order Date:</span>
      <span class="info-value">${new Date(orderData.createdAt).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}</span>
    </div>
  </div>

  <div class="section">
    <h2>Customer Information</h2>
    <div class="info-row">
      <span class="info-label">Name:</span>
      <span class="info-value">${orderData.customerName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Phone:</span>
      <span class="info-value">${orderData.phone}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Address:</span>
      <span class="info-value">${orderData.address}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Delivery Area:</span>
      <span class="info-value">${orderData.deliveryArea === 'inside' ? 'Inside Dhaka City' : 'Outside Dhaka City'}</span>
    </div>
  </div>

  <div class="section">
    <h2>Order Items</h2>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderData.orderItems.map(item => {
          const price = typeof item.price === 'string' ? Number(item.price) : item.price;
          const quantity = typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity;
          return `
          <tr>
            <td>${item.name}</td>
            <td class="text-right">${quantity}</td>
            <td class="text-right">৳${formatPrice(price)}</td>
            <td class="text-right">৳${formatPrice(price * quantity)}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Payment Summary</h2>
    <div class="info-row">
      <span class="info-label">Subtotal:</span>
      <span class="info-value">৳${formatPrice(subtotal)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Delivery Charge:</span>
      <span class="info-value">৳${formatPrice(shipping)}</span>
    </div>
    <div class="info-row total-row">
      <span class="info-label">Total:</span>
      <span class="info-value">৳${formatPrice(total)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your order!</p>
    <p>We will contact you shortly to confirm your order.</p>
    <p>Website: ${websiteUrl}</p>
    <p>Email: gadzillabd@gmail.com</p>
  </div>
</body>
</html>
    `;

    // Create blob and download as HTML (user can print to PDF from browser)
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GADZILLA_Receipt_${orderData.orderId.substring(0, 8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!orderData) {
    return null;
  }

  return (
    <button onClick={downloadReceipt} className={styles.downloadButton}>
      <Download size={18} style={{ marginRight: '8px' }} />
      Download Receipt
    </button>
  );
}
