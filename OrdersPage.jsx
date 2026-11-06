import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import api from '../utils/api';
import './OrdersPage.css';

const statusColors = {
  pending: 'badge-gold',
  processing: 'badge-red',
  shipped: 'badge-red',
  delivered: 'badge-green',
  cancelled: 'badge-gray',
};

const paymentColors = {
  pending: 'badge-gold',
  paid: 'badge-green',
  failed: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders || data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="orders-page container">
      <h1 className="section-title">MY <span className="gradient-text">ORDERS</span></h1>
      <p className="section-subtitle">Track and manage your orders</p>

      {orders.length === 0 ? (
        <div className="cart-empty">
          <FiPackage size={64} />
          <h2>No Orders Yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-badges">
                  <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>{order.status}</span>
                  <span className={`badge ${paymentColors[order.paymentStatus] || 'badge-gray'}`}>{order.paymentStatus}</span>
                </div>
              </div>
              <div className="order-card-body">
                <span className="order-products">{order.product_names || order.items?.length + ' items' || 'View details'}</span>
                <span className="order-total">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

