import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './OrderDetailPage.css';

const statusColors = {
  pending: 'badge-gold', processing: 'badge-red', shipped: 'badge-red',
  delivered: 'badge-green', cancelled: 'badge-gray',
};
const paymentColors = { pending: 'badge-gold', paid: 'badge-green', failed: 'badge-red' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order || data);
        setItems(data.items || data.order?.items || []);
      } catch {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      setOrder((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (!order) return null;

  return (
    <div className="order-detail container">
      <div className="order-detail-header">
        <div>
          <h1 className="section-title">ORDER <span className="gradient-text">#{order.id}</span></h1>
          <p className="order-detail-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="order-badges">
          <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
          <span className={`badge ${paymentColors[order.paymentStatus]}`}>{order.paymentStatus}</span>
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-section card">
          <h3>Items</h3>
          <div className="order-items-list">
            {items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-info">
                  <strong>{item.product_name || item.name || 'Product'}</strong>
                  <span>Qty: {item.quantity}</span>
                </div>
                <span className="order-item-price">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="order-items-total">
            <span>Total</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div className="order-actions-section">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment</h3>
            <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>Method: {order.paymentMethod || 'Stripe'}</p>
            <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>Status: {order.paymentStatus}</p>
          </div>

          {order.status === 'pending' && (
            <button
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => navigate('/orders')}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}

