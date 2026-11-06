import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const categoryList = [
  { name: 'Dumbbells & Weights', slug: 'weights' },
  { name: 'Resistance Bands', slug: 'bands' },
  { name: 'Protein Supplements', slug: 'supplements' },
  { name: 'Gym Apparel', slug: 'apparel' },
  { name: 'Cardio Equipment', slug: 'cardio' },
  { name: 'Recovery & Wellness', slug: 'recovery' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [category, sort, minPrice, maxPrice, search, page]);

  // Sync URL params changes
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('category') || '';
    if (s !== search) setSearch(s);
    if (c !== category) setCategory(c);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', 12);

      let url = `/products?${params.toString()}`;
      if (category && !search) {
        url = `/products/category/${category}?${params.toString()}`;
      }
      if (search) {
        url = `/products?search=${search}&${params.toString()}`;
      }

      const { data } = await api.get(url);
      setProducts(data.products || data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCategory('');
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = category || sort || minPrice || maxPrice || search;

  return (
    <div className="products-page container">
      <div className="products-header">
        <div>
          <h1 className="section-title">ALL <span className="gradient-text">PRODUCTS</span></h1>
          {search && <p className="search-label">Results for "{search}"</p>}
        </div>
        <div className="products-header-actions">
          <select
            className="form-input sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="createdAt_desc">Newest</option>
          </select>
          <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      <div className="products-layout">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            {hasFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                <FiX /> Clear All
              </button>
            )}
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            {categoryList.map((cat) => (
              <label key={cat.slug} className="filter-checkbox">
                <input
                  type="radio"
                  name="category"
                  checked={category === cat.slug}
                  onChange={() => { setCategory(category === cat.slug ? '' : cat.slug); setPage(1); }}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                className="form-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="products-grid-container">
          {loading ? (
            <div className="spinner-container"><div className="spinner" /></div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-3 products-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="pagination">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span className="page-info">Page {page}</span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={products.length < 12}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>No products found</p>
              {hasFilters && (
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

