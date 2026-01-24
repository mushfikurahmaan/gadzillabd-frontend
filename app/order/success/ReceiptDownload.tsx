'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import styles from './Success.module.css';
import { generateOrderPDF, type OrderPDFData } from './pdfUtils';

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
    size?: string;
    color?: string | null;
  }>;
  total: number;
  subtotal: number;
  shipping: number;
  createdAt: string;
  paymentMethod?: string;
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

    // Map delivery area to district format
    const district = orderData.deliveryArea === 'inside' ? 'Inside Dhaka City' : 'Outside Dhaka City';

    // Prepare PDF data
    const pdfData: OrderPDFData = {
      orderId: orderData.orderId,
      orderDate: orderData.createdAt,
      customerName: orderData.customerName,
      phoneNumber: orderData.phone,
      address: orderData.address,
      district: district,
      items: orderData.orderItems.map(item => {
        const unitPrice = typeof item.price === 'string' ? Number(item.price) : item.price;
        const quantity = typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity;
        return {
          name: item.name,
          color: item.color || null,
          quantity: quantity,
          unitPrice: unitPrice,
          total: unitPrice * quantity,
        };
      }),
      productTotal: subtotal,
      deliveryCharge: shipping,
      totalAmount: total,
    };

    // Generate and download PDF
    generateOrderPDF(pdfData);
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
