import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const DemoHeader = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Jobs', href: '/jobs', icon: '🏠' },
    { name: 'Clients', href: '/clients', icon: '👥' },
    { name: 'Emails', href: '/emails', icon: '📧' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Library', href: '/library', icon: '📚' },
    { name: 'Team Hub', href: '/team', icon: '🤝' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <header className="demo-header">
      <div className="demo-header-content">
        {/* Logo and Demo Badge */}
        <div className="demo-logo-section">
          <div className="demo-logo">
            <span className="demo-logo-text">InterioApp</span>
            <span className="demo-badge">DEMO</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="demo-navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`demo-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="demo-nav-icon">{item.icon}</span>
              <span className="demo-nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="demo-cta-section">
          <button className="demo-btn demo-btn-secondary">
            View Pricing
          </button>
          <button className="demo-btn demo-btn-primary">
            Start Free Trial
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="demo-banner">
        <div className="demo-banner-content">
          <span className="demo-banner-text">
            🎉 You're viewing a live demo of InterioApp. All data is simulated.
          </span>
          <button className="demo-banner-cta">
            Get Started for Real →
          </button>
        </div>
      </div>
    </header>
  );
};