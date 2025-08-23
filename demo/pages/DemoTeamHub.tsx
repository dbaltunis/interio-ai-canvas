import React from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoTeamHub = () => {
  const { teamMembers, projects } = useDemoData();

  const recentActivities = [
    {
      id: '1',
      user: 'Alex Thompson',
      action: 'completed measurement',
      target: 'Modern Living Room Transformation',
      time: '2 hours ago',
      type: 'measurement'
    },
    {
      id: '2',
      user: 'Maria Garcia',
      action: 'updated project status',
      target: 'Executive Office Blinds',
      time: '4 hours ago',
      type: 'update'
    },
    {
      id: '3',
      user: 'Alex Thompson',
      action: 'uploaded design mockup',
      target: 'Bedroom Window Treatments',
      time: '6 hours ago',
      type: 'upload'
    },
    {
      id: '4',
      user: 'Maria Garcia',
      action: 'scheduled client meeting',
      target: 'Sarah Johnson consultation',
      time: '1 day ago',
      type: 'schedule'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'measurement': return '📏';
      case 'update': return '✏️';
      case 'upload': return '📎';
      case 'schedule': return '📅';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Team Collaboration Hub</h1>
          <p className="demo-page-subtitle">
            Coordinate with your team and track project progress
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + Invite Team Member
        </button>
      </div>

      {/* Team Overview */}
      <div className="demo-team-overview">
        <div className="demo-team-stats">
          <div className="demo-stat-card">
            <div className="demo-stat-icon">👥</div>
            <div className="demo-stat-content">
              <div className="demo-stat-value">{teamMembers.length}</div>
              <div className="demo-stat-label">Team Members</div>
            </div>
          </div>
          <div className="demo-stat-card">
            <div className="demo-stat-icon">🟢</div>
            <div className="demo-stat-content">
              <div className="demo-stat-value">
                {teamMembers.filter(m => m.status === 'online').length}
              </div>
              <div className="demo-stat-label">Online Now</div>
            </div>
          </div>
          <div className="demo-stat-card">
            <div className="demo-stat-icon">🏗️</div>
            <div className="demo-stat-content">
              <div className="demo-stat-value">{projects.length}</div>
              <div className="demo-stat-label">Active Projects</div>
            </div>
          </div>
          <div className="demo-stat-card">
            <div className="demo-stat-icon">📈</div>
            <div className="demo-stat-content">
              <div className="demo-stat-value">94%</div>
              <div className="demo-stat-label">Team Efficiency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-team-layout">
        {/* Team Members */}
        <div className="demo-team-sidebar">
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Team Members</h3>
            </div>
            <div className="demo-team-list">
              {teamMembers.map((member) => (
                <div key={member.id} className="demo-team-member">
                  <div className="demo-member-avatar">
                    <div className="demo-avatar-placeholder">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div 
                      className="demo-status-indicator"
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    ></div>
                  </div>
                  <div className="demo-member-info">
                    <div className="demo-member-name">{member.name}</div>
                    <div className="demo-member-role">{member.role}</div>
                    <div className="demo-member-status">{member.status}</div>
                  </div>
                  <div className="demo-member-actions">
                    <button className="demo-btn demo-btn-link demo-btn-sm">
                      💬
                    </button>
                    <button className="demo-btn demo-btn-link demo-btn-sm">
                      📞
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Projects */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Project Assignments</h3>
            </div>
            <div className="demo-project-assignments">
              {teamMembers.map((member) => (
                <div key={member.id} className="demo-assignment-item">
                  <div className="demo-assignment-member">{member.name}</div>
                  <div className="demo-assignment-project">{member.currentProject}</div>
                  <div className="demo-assignment-progress">
                    <div className="demo-progress-bar">
                      <div 
                        className="demo-progress-fill" 
                        style={{ width: `${Math.random() * 40 + 30}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="demo-team-main">
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Recent Activity</h3>
              <button className="demo-btn demo-btn-secondary demo-btn-sm">
                View All
              </button>
            </div>
            <div className="demo-activity-feed">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="demo-activity-item">
                  <div className="demo-activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="demo-activity-content">
                    <div className="demo-activity-text">
                      <strong>{activity.user}</strong> {activity.action} for{' '}
                      <span className="demo-activity-target">{activity.target}</span>
                    </div>
                    <div className="demo-activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Team Performance</h3>
            </div>
            <div className="demo-performance-metrics">
              <div className="demo-metric-row">
                <div className="demo-metric-label">Projects Completed This Month</div>
                <div className="demo-metric-value">12</div>
                <div className="demo-metric-change positive">+20%</div>
              </div>
              <div className="demo-metric-row">
                <div className="demo-metric-label">Average Project Duration</div>
                <div className="demo-metric-value">18 days</div>
                <div className="demo-metric-change negative">-2 days</div>
              </div>
              <div className="demo-metric-row">
                <div className="demo-metric-label">Client Satisfaction</div>
                <div className="demo-metric-value">4.8/5</div>
                <div className="demo-metric-change positive">+0.2</div>
              </div>
              <div className="demo-metric-row">
                <div className="demo-metric-label">Team Utilization</div>
                <div className="demo-metric-value">94%</div>
                <div className="demo-metric-change positive">+5%</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Quick Actions</h3>
            </div>
            <div className="demo-quick-actions-grid">
              <button className="demo-action-card">
                <div className="demo-action-icon">📝</div>
                <div className="demo-action-text">Create Task</div>
              </button>
              <button className="demo-action-card">
                <div className="demo-action-icon">📋</div>
                <div className="demo-action-text">Assign Project</div>
              </button>
              <button className="demo-action-card">
                <div className="demo-action-icon">💬</div>
                <div className="demo-action-text">Team Chat</div>
              </button>
              <button className="demo-action-card">
                <div className="demo-action-icon">📊</div>
                <div className="demo-action-text">View Reports</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};