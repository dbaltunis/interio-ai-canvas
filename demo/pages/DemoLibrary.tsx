import React, { useState } from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoLibrary = () => {
  const { products } = useDemoData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'curtains', label: 'Curtains' },
    { value: 'blinds', label: 'Blinds' },
    { value: 'panels', label: 'Panels' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'fabrics', label: 'Fabrics' }
  ];

  // Extended product catalog for demo
  const extendedProducts = [
    ...products,
    {
      id: '4',
      name: 'Venetian Blinds',
      category: 'blinds',
      price: 180,
      image: '/demo-venetian.jpg',
      description: 'Classic aluminum venetian blinds with precise light control',
      inStock: true
    },
    {
      id: '5',
      name: 'Sheer Curtains',
      category: 'curtains',
      price: 95,
      image: '/demo-sheer.jpg',
      description: 'Elegant sheer curtains for soft natural light',
      inStock: true
    },
    {
      id: '6',
      name: 'Curtain Rods',
      category: 'hardware',
      price: 45,
      image: '/demo-rods.jpg',
      description: 'Premium quality curtain rods and brackets',
      inStock: true
    },
    {
      id: '7',
      name: 'Linen Fabric',
      category: 'fabrics',
      price: 35,
      image: '/demo-linen.jpg',
      description: 'Natural linen fabric per meter',
      inStock: false
    },
    {
      id: '8',
      name: 'Roman Blinds',
      category: 'blinds',
      price: 220,
      image: '/demo-roman.jpg',
      description: 'Custom roman blinds with cord-free operation',
      inStock: true
    }
  ];

  const filteredProducts = extendedProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Product Library</h1>
          <p className="demo-page-subtitle">
            Browse and manage your window treatment product catalog
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="demo-library-controls">
        <div className="demo-search-box">
          <input
            type="text"
            placeholder="Search products..."
            className="demo-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="demo-category-filters">
          {categories.map(category => (
            <button
              key={category.value}
              className={`demo-filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Stats */}
      <div className="demo-library-stats">
        <div className="demo-stat-item">
          <div className="demo-stat-value">{extendedProducts.length}</div>
          <div className="demo-stat-label">Total Products</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            {extendedProducts.filter(p => p.inStock).length}
          </div>
          <div className="demo-stat-label">In Stock</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            {new Set(extendedProducts.map(p => p.category)).size}
          </div>
          <div className="demo-stat-label">Categories</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            ${Math.round(extendedProducts.reduce((sum, p) => sum + p.price, 0) / extendedProducts.length)}
          </div>
          <div className="demo-stat-label">Avg. Price</div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="demo-products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="demo-product-card">
            <div className="demo-product-image">
              <div className="demo-product-placeholder">
                {product.category === 'curtains' && '🪟'}
                {product.category === 'blinds' && '📋'}
                {product.category === 'panels' && '🎭'}
                {product.category === 'hardware' && '🔧'}
                {product.category === 'fabrics' && '🧵'}
              </div>
              {!product.inStock && (
                <div className="demo-out-of-stock-badge">Out of Stock</div>
              )}
            </div>
            
            <div className="demo-product-info">
              <div className="demo-product-category">{product.category}</div>
              <div className="demo-product-name">{product.name}</div>
              <div className="demo-product-description">{product.description}</div>
              
              <div className="demo-product-footer">
                <div className="demo-product-price">${product.price}</div>
                <div className="demo-product-actions">
                  <button className="demo-btn demo-btn-secondary demo-btn-sm">
                    View Details
                  </button>
                  <button 
                    className="demo-btn demo-btn-primary demo-btn-sm"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Quote' : 'Notify Me'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Overview */}
      <div className="demo-category-overview">
        <h3 className="demo-section-title">Category Overview</h3>
        <div className="demo-category-grid">
          {categories.slice(1).map(category => {
            const categoryProducts = extendedProducts.filter(p => p.category === category.value);
            const avgPrice = categoryProducts.length > 0 
              ? Math.round(categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length)
              : 0;
            
            return (
              <div key={category.value} className="demo-category-card">
                <div className="demo-category-icon">
                  {category.value === 'curtains' && '🪟'}
                  {category.value === 'blinds' && '📋'}
                  {category.value === 'panels' && '🎭'}
                  {category.value === 'hardware' && '🔧'}
                  {category.value === 'fabrics' && '🧵'}
                </div>
                <div className="demo-category-name">{category.label}</div>
                <div className="demo-category-stats">
                  <div className="demo-category-stat">
                    <span className="demo-stat-value">{categoryProducts.length}</span>
                    <span className="demo-stat-label">Products</span>
                  </div>
                  <div className="demo-category-stat">
                    <span className="demo-stat-value">${avgPrice}</span>
                    <span className="demo-stat-label">Avg. Price</span>
                  </div>
                </div>
                <button 
                  className="demo-btn demo-btn-link demo-btn-sm"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  View All →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};