import React from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

export default function CartPage() {
  const { cartItems, cartTotal, cartCount, updateCartItem, removeFromCart, clearCart, loading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) return toast.error('Please login to checkout');
    if (cartItems.length === 0) return toast.error('Cart is empty');
    try {
      const { data } = await api.post('/orders');
      toast.success('Order placed successfully!');
      fetchCart();
      navigate(`/orders/${data.order?.id || data.orderId || data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (!user) {
    return (
      <div className="container cart-empty">
        <FiShoppingBag size={64} />
        <h2>Please Login</h2>
        <p>Login to view your shopping cart</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <FiShoppingBag size={64} />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="section-title">YOUR <span className="gradient-text">CART</span></h1>
      <p className="section-subtitle">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => {
            const name = item.product_name || item.name || item.product?.name || 'Product';
            const price = item.product_price || item.price || item.product?.price || 0;
            const image = item.product_image || item.image || item.product?.images;

            return (
              <div key={item.id} className="cart-item card">
                <div className="cart-item-image">
                  {image ? (
                    <img src={typeof image === 'string' && image.startsWith('[') ? JSON.parse(image)[0] : image} alt={name} />
                  ) : (
                    <div className="product-placeholder"><span>🏋️</span></div>
                  )}
                </div>
                <div className="cart-item-info">
                  <h3>{name}</h3>
                  <span className="cart-item-price">${Number(price).toFixed(2)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-selector">
                    <button onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.id, item.quantity + 1)}><FiPlus /></button>
                  </div>
                  <span className="cart-item-subtotal">${(Number(price) * item.quantity).toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}

          <button className="btn btn-outline btn-sm" onClick={clearCart} style={{ marginTop: '1rem' }}>
            Clear Cart
          </button>
        </div>

        <div className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="text-green">{cartTotal >= 50 ? 'FREE' : '$5.99'}</span>
          </div>
          <div className="divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>${(cartTotal + (cartTotal >= 50 ? 0 : 5.99)).toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleCheckout}>
            Place Order <FiArrowRight />
          </button>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

