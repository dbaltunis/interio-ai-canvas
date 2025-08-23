import React, { useState } from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoClients = () => {
  const { clients } = useDemoData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Client Management</h1>
          <p className="demo-page-subtitle">
            Manage your client relationships and project history
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + Add Client
        </button>
      </div>

      {/* Search and Filters */}
      <div className="demo-search-filters">
        <div className="demo-search-box">
          <input
            type="text"
            placeholder="Search clients by name or email..."
            className="demo-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="demo-filter-group">
          <label className="demo-filter-label">Status:</label>
          <select 
            className="demo-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="demo-card">
        <div className="demo-table-container">
          <table className="demo-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Projects</th>
                <th>Total Value</th>
                <th>Last Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="demo-client-info">
                      <div className="demo-client-avatar">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="demo-client-name">{client.name}</div>
                        <div className="demo-client-address">{client.address}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="demo-contact-info">
                      <div className="demo-contact-email">{client.email}</div>
                      <div className="demo-contact-phone">{client.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="demo-projects-count">
                      {client.projectsCount} projects
                    </div>
                  </td>
                  <td>
                    <div className="demo-value">
                      ${client.totalValue.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="demo-date">
                      {new Date(client.lastContact).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className={`demo-status demo-status-${client.status}`}>
                      {client.status}
                    </div>
                  </td>
                  <td>
                    <div className="demo-table-actions">
                      <button className="demo-btn demo-btn-link demo-btn-sm">
                        View
                      </button>
                      <button className="demo-btn demo-btn-link demo-btn-sm">
                        Edit
                      </button>
                      <button className="demo-btn demo-btn-link demo-btn-sm">
                        Contact
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Stats */}
      <div className="demo-stats-row">
        <div className="demo-stat-item">
          <div className="demo-stat-value">{clients.length}</div>
          <div className="demo-stat-label">Total Clients</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            {clients.filter(c => c.status === 'active').length}
          </div>
          <div className="demo-stat-label">Active Clients</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            ${clients.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}
          </div>
          <div className="demo-stat-label">Total Value</div>
        </div>
        <div className="demo-stat-item">
          <div className="demo-stat-value">
            {(clients.reduce((sum, c) => sum + c.totalValue, 0) / clients.length).toFixed(0)}
          </div>
          <div className="demo-stat-label">Avg. Value</div>
        </div>
      </div>
    </div>
  );
};