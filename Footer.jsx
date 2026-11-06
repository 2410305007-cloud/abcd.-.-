import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const categories = [
  { name: 'Dumbbells & Weights', slug: 'weights' },
  { name: 'Resistance Bands', slug: 'bands' },
  { name: 'Protein Supplements', slug: 'supplements' },
  { name: 'Gym Apparel', slug: 'apparel' },
  { name: 'Cardio Equipment', slug: 'cardio' },
  { name: 'Recovery & Wellness', slug: 'recovery' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="gradient-text">IRONFORGE</h3>
            <p>Premium gym equipment, supplements, and apparel. Forge Your Strength. Define Your Legacy.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Orders</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/products?category=${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="contact-list">
              <li><FiMapPin /> 123 Fitness Avenue, NY 10001</li>
              <li><FiPhone /> +1 (555) 123-4567</li>
              <li><FiMail /> support@ironforge.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} IronForge Athletics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

