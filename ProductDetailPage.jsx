import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product || data);
    } catch {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${id}`);
      setReviews(data.reviews || data || []);
    } catch {
      setReviews([]);
    }
  };

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please login first');
    try {
      const { data } = await api.post('/wishlist/toggle', { productId: Number(id) });
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to write a review');
    try {
      setSubmitting(true);
      await api.post('/reviews', { productId: Number(id), ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><p>Product not found.</p></div>;

  const images = product.images ? JSON.parse(product.images || '[]') : [];

  return (
    <div className="product-detail container">
      <div className="product-detail-grid">
        {/* Image */}
        <div className="product-detail-image">
          {images[0] ? (
            <img src={images[0]} alt={product.name} />
          ) : (
            <div className="product-placeholder-lg"><span>🏋️</span></div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <div className="product-detail-rating">
            <div className="stars">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} fill={s <= Math.round(product.rating || 0) ? '#f4c430' : 'none'} color="#f4c430" size={18} />
              ))}
            </div>
            <span>{Number(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)</span>
          </div>

          <div className="product-detail-price">
            <span className="current-price">${Number(product.price).toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="old-price">${Number(product.originalPrice).toFixed(2)}</span>
                <span className="badge badge-red">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="product-description">{product.description || 'No description available.'}</p>

          <div className="stock-status">
            {product.stock > 0 ? (
              <span className="badge badge-green">In Stock ({product.stock})</span>
            ) : (
              <span className="badge badge-red">Out of Stock</span>
            )}
          </div>

          <div className="product-actions">
            <div className="qty-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}><FiPlus /></button>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock === 0}
            >
              <FiShoppingCart /> Add to Cart
            </button>
            <button className={`wishlist-btn-lg ${wishlisted ? 'active' : ''}`} onClick={toggleWishlist}>
              <FiHeart fill={wishlisted ? '#e63946' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">CUSTOMER <span className="gradient-text">REVIEWS</span></h2>

        {user && (
          <form className="review-form card" onSubmit={handleReviewSubmit}>
            <h3>Write a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-select">
                {[1,2,3,4,5].map((s) => (
                  <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <FiStar fill={s <= reviewForm.rating ? '#f4c430' : 'none'} color="#f4c430" size={24} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-input"
                placeholder="Review title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                className="form-input"
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-light)', padding: '2rem' }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-item card">
                <div className="review-header">
                  <div>
                    <strong>{r.user_name || r.name || 'User'}</strong>
                    <div className="stars">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} fill={s <= r.rating ? '#f4c430' : 'none'} color="#f4c430" size={14} />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.title && <h4>{r.title}</h4>}
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

