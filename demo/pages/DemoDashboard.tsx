import React from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoDashboard = () => {
  const { dashboardStats, projects, clients } = useDemoData();

  const recentProjects = projects.slice(0, 3);
  const recentClients = clients.slice(0, 3);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h1 className="demo-page-title">Dashboard Overview</h1>
        <p className="demo-page-subtitle">
          Monitor your business performance and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="demo-stats-grid">
        <div className="demo-stat-card">
          <div className="demo-stat-icon">💰</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">${dashboardStats.totalRevenue.toLocaleString()}</div>
            <div className="demo-stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">🏗️</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">{dashboardStats.activeProjects}</div>
            <div className="demo-stat-label">Active Projects</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">👥</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">{dashboardStats.totalClients}</div>
            <div className="demo-stat-label">Total Clients</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">✅</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">{dashboardStats.completedProjects}</div>
            <div className="demo-stat-label">Completed Projects</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="demo-content-grid">
        {/* Recent Projects */}
        <div className="demo-card">
          <div className="demo-card-header">
            <h3 className="demo-card-title">Recent Projects</h3>
            <button className="demo-btn demo-btn-link">View All</button>
          </div>
          <div className="demo-card-content">
            {recentProjects.map((project) => (
              <div key={project.id} className="demo-list-item">
                <div className="demo-list-item-content">
                  <div className="demo-list-item-title">{project.title}</div>
                  <div className="demo-list-item-subtitle">{project.clientName}</div>
                </div>
                <div className="demo-list-item-meta">
                  <div className={`demo-status demo-status-${project.status}`}>
                    {project.status}
                  </div>
                  <div className="demo-list-item-value">${project.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="demo-card">
          <div className="demo-card-header">
            <h3 className="demo-card-title">Recent Clients</h3>
            <button className="demo-btn demo-btn-link">View All</button>
          </div>
          <div className="demo-card-content">
            {recentClients.map((client) => (
              <div key={client.id} className="demo-list-item">
                <div className="demo-list-item-content">
                  <div className="demo-list-item-title">{client.name}</div>
                  <div className="demo-list-item-subtitle">{client.email}</div>
                </div>
                <div className="demo-list-item-meta">
                  <div className="demo-list-item-value">${client.totalValue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="demo-card">
        <div className="demo-card-header">
          <h3 className="demo-card-title">Revenue Trends</h3>
        </div>
        <div className="demo-card-content">
          <div className="demo-chart-placeholder">
            <div className="demo-chart-bars">
              <div className="demo-chart-bar" style={{ height: '60%' }}></div>
              <div className="demo-chart-bar" style={{ height: '80%' }}></div>
              <div className="demo-chart-bar" style={{ height: '45%' }}></div>
              <div className="demo-chart-bar" style={{ height: '90%' }}></div>
              <div className="demo-chart-bar" style={{ height: '70%' }}></div>
              <div className="demo-chart-bar" style={{ height: '95%' }}></div>
            </div>
            <div className="demo-chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};