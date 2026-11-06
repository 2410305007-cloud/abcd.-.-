import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiAward, FiRefreshCw, FiHeadphones, FiStar } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const categories = [
  { name: 'Dumbbells & Weights', slug: 'weights', icon: '🏋️' },
  { name: 'Resistance Bands', slug: 'bands', icon: '💪' },
  { name: 'Protein Supplements', slug: 'supplements', icon: '🥤' },
  { name: 'Gym Apparel', slug: 'apparel', icon: '👕' },
  { name: 'Cardio Equipment', slug: 'cardio', icon: '🏃' },
  { name: 'Recovery & Wellness', slug: 'recovery', icon: '🧘' },
];

const features = [
  { icon: <FiTruck />, title: 'Free Shipping', desc: 'On all orders over $50' },
  { icon: <FiAward />, title: 'Premium Quality', desc: 'Certified equipment' },
  { icon: <FiRefreshCw />, title: '30-Day Returns', desc: 'Money back guarantee' },
  { icon: <FiHeadphones />, title: 'Expert Support', desc: '24/7 customer service' },
];

const testimonials = [
  { name: 'Alex Johnson', role: 'Fitness Coach', text: 'IronForge equipment transformed my gym. Best quality I\'ve ever used.', rating: 5 },
  { name: 'Sarah Williams', role: 'CrossFit Athlete', text: 'The dumbbells are incredible quality and the delivery was super fast!', rating: 5 },
  { name: 'Mike Chen', role: 'Bodybuilder', text: 'Great supplements and amazing customer service. Highly recommend!', rating: 4 },
];

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return [count, () => setStarted(true)];
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [taglineIdx, setTaglineIdx] = useState(0);

  const taglines = ['Forge Your Strength.', 'Define Your Legacy.', 'Break Your Limits.', 'Build Your Empire.'];

  const [customers, startCustomers] = useCounter(10000);
  const [products, startProducts] = useCounter(500);
  const [years, startYears] = useCounter(15);
  const [satisfaction, startSatisfaction] = useCounter(98);

  // Typing effect
  useEffect(() => {
    const line = taglines[taglineIdx];
    let i = 0;
    let deleting = false;
    const timer = setInterval(() => {
      if (!deleting) {
        setTypedText(line.slice(0, i + 1));
        i++;
        if (i === line.length) {
          deleting = true;
          setTimeout(() => {}, 1500);
          clearInterval(timer);
          setTimeout(() => {
            const deleteTimer = setInterval(() => {
              setTypedText((prev) => prev.slice(0, -1));
              i--;
              if (i <= 0) {
                clearInterval(deleteTimer);
                setTaglineIdx((prev) => (prev + 1) % taglines.length);
              }
            }, 40);
          }, 1500);
        }
      }
    }, 80);
    return () => clearInterval(timer);
  }, [taglineIdx]);

  // Fetch featured products
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data.products || data || []);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Start counters on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCustomers();
          startProducts();
          startYears();
          startSatisfaction();
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('stats-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <h1>
            <span className="gradient-text">{typedText}</span>
            <span className="cursor">|</span>
          </h1>
          <p>Premium gym equipment, supplements & apparel for champions.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat"><span className="stat-number">{customers.toLocaleString()}+</span><span className="stat-label">Happy Customers</span></div>
            <div className="stat"><span className="stat-number">{products}+</span><span className="stat-label">Products</span></div>
            <div className="stat"><span className="stat-number">{years}+</span><span className="stat-label">Years Experience</span></div>
            <div className="stat"><span className="stat-number">{satisfaction}%</span><span className="stat-label">Satisfaction</span></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">SHOP BY <span className="gradient-text">CATEGORY</span></h2>
          <p className="section-subtitle">Find exactly what you need</p>
          <div className="grid grid-3 categories-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.slug}`} key={cat.slug} className="category-card card">
                <span className="category-icon">{cat.icon}</span>
                <h3>{cat.name}</h3>
                <FiArrowRight className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">FEATURED <span className="gradient-text">PRODUCTS</span></h2>
          <p className="section-subtitle">Top picks for serious athletes</p>
          {loading ? (
            <div className="spinner-container"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="grid grid-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--gray-light)' }}>No featured products yet. Add products via the admin panel.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-outline">View All Products <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title">WHY CHOOSE <span className="gradient-text">IRONFORGE</span></h2>
          <p className="section-subtitle">Built different. Built better.</p>
          <div className="grid grid-4 features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">WHAT ATHLETES <span className="gradient-text">SAY</span></h2>
          <p className="section-subtitle">Trusted by champions worldwide</p>
          <div className="grid grid-3 testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div className="stars" style={{ marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map((s) => (
                    <FiStar key={s} fill={s <= t.rating ? '#f4c430' : 'none'} color="#f4c430" size={16} />
                  ))}
                </div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

