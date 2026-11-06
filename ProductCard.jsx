import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, onToggleWishlist, isWishlisted }) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="product-card card">
      <Link to={`/products/${product.id}`} className="product-card-image">
        {product.images && JSON.parse(product.images || '[]')[0] ? (
          <img src={JSON.parse(product.images)[0]} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <span>🏋️</span>
          </div>
        )}
        {discount > 0 && <span className="discount-tag">-{discount}%</span>}
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        <div className="product-card-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar
                key={s}
                className={s <= Math.round(product.rating || 0) ? '' : 'empty'}
                fill={s <= Math.round(product.rating || 0) ? '#f4c430' : 'none'}
                size={14}
              />
            ))}
          </div>
          <span>({product.reviewCount || 0})</span>
        </div>

        <div className="product-card-price">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          {product.originalPrice && (
            <span className="original-price">${Number(product.originalPrice).toFixed(2)}</span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
            disabled={product.stock === 0}
          >
            <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {onToggleWishlist && (
            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
            >
              <FiHeart fill={isWishlisted ? '#e63946' : 'none'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

