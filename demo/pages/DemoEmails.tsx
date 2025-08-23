import React, { useState } from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoEmails = () => {
  const { emails } = useDemoData();
  const [selectedType, setSelectedType] = useState('all');

  const emailTypes = [
    { value: 'all', label: 'All Emails' },
    { value: 'quote', label: 'Quotes' },
    { value: 'follow-up', label: 'Follow-ups' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'support', label: 'Support' }
  ];

  const filteredEmails = selectedType === 'all' 
    ? emails 
    : emails.filter(e => e.type === selectedType);

  const emailTemplates = [
    {
      id: 'quote-template',
      name: 'Quote Follow-up',
      description: 'Professional follow-up for pending quotes',
      category: 'Sales'
    },
    {
      id: 'welcome-template',
      name: 'Welcome New Client',
      description: 'Welcome message for new clients',
      category: 'Onboarding'
    },
    {
      id: 'completion-template',
      name: 'Project Completion',
      description: 'Project completion and satisfaction survey',
      category: 'Project Management'
    }
  ];

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Email Management</h1>
          <p className="demo-page-subtitle">
            Manage client communications and email campaigns
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + Compose Email
        </button>
      </div>

      {/* Email Stats */}
      <div className="demo-email-stats">
        <div className="demo-stat-card">
          <div className="demo-stat-icon">📧</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">156</div>
            <div className="demo-stat-label">Emails Sent</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">📈</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">68%</div>
            <div className="demo-stat-label">Open Rate</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">💬</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">23</div>
            <div className="demo-stat-label">Replies</div>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="demo-stat-icon">⏰</div>
          <div className="demo-stat-content">
            <div className="demo-stat-value">3</div>
            <div className="demo-stat-label">Scheduled</div>
          </div>
        </div>
      </div>

      <div className="demo-email-layout">
        {/* Email List */}
        <div className="demo-email-sidebar">
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Recent Emails</h3>
              <select 
                className="demo-select demo-select-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {emailTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="demo-email-list">
              {filteredEmails.map((email) => (
                <div key={email.id} className="demo-email-item">
                  <div className="demo-email-header">
                    <div className="demo-email-subject">{email.subject}</div>
                    <div className={`demo-status demo-status-${email.status}`}>
                      {email.status}
                    </div>
                  </div>
                  <div className="demo-email-meta">
                    <div className="demo-email-recipient">To: {email.to}</div>
                    <div className="demo-email-date">{email.date}</div>
                  </div>
                  <div className={`demo-email-type demo-email-type-${email.type}`}>
                    {email.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="demo-email-main">
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Email Templates</h3>
              <button className="demo-btn demo-btn-secondary demo-btn-sm">
                + New Template
              </button>
            </div>
            <div className="demo-templates-grid">
              {emailTemplates.map((template) => (
                <div key={template.id} className="demo-template-card">
                  <div className="demo-template-header">
                    <div className="demo-template-name">{template.name}</div>
                    <div className="demo-template-category">{template.category}</div>
                  </div>
                  <div className="demo-template-description">
                    {template.description}
                  </div>
                  <div className="demo-template-actions">
                    <button className="demo-btn demo-btn-link demo-btn-sm">
                      Preview
                    </button>
                    <button className="demo-btn demo-btn-primary demo-btn-sm">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Campaign Performance</h3>
            </div>
            <div className="demo-campaign-metrics">
              <div className="demo-metric-item">
                <div className="demo-metric-label">Welcome Series</div>
                <div className="demo-metric-bar">
                  <div className="demo-metric-fill" style={{ width: '85%' }}></div>
                </div>
                <div className="demo-metric-value">85% open rate</div>
              </div>
              <div className="demo-metric-item">
                <div className="demo-metric-label">Quote Follow-ups</div>
                <div className="demo-metric-bar">
                  <div className="demo-metric-fill" style={{ width: '72%' }}></div>
                </div>
                <div className="demo-metric-value">72% open rate</div>
              </div>
              <div className="demo-metric-item">
                <div className="demo-metric-label">Monthly Newsletter</div>
                <div className="demo-metric-bar">
                  <div className="demo-metric-fill" style={{ width: '64%' }}></div>
                </div>
                <div className="demo-metric-value">64% open rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};