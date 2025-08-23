import React, { useState } from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoJobs = () => {
  const { projects } = useDemoData();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  const filteredProjects = selectedStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === selectedStatus);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Projects & Jobs</h1>
          <p className="demo-page-subtitle">
            Manage your window treatment projects and track progress
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="demo-filters">
        <div className="demo-filter-group">
          <label className="demo-filter-label">Status:</label>
          <select 
            className="demo-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="demo-filter-stats">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects Grid */}
      <div className="demo-projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="demo-project-card">
            <div className="demo-project-header">
              <div className="demo-project-title">{project.title}</div>
              <div className={`demo-status demo-status-${project.status}`}>
                {project.status}
              </div>
            </div>
            
            <div className="demo-project-meta">
              <div className="demo-project-client">
                <span className="demo-meta-label">Client:</span>
                <span className="demo-meta-value">{project.clientName}</span>
              </div>
              <div className="demo-project-value">
                <span className="demo-meta-label">Value:</span>
                <span className="demo-meta-value">${project.value.toLocaleString()}</span>
              </div>
            </div>

            <div className="demo-project-description">
              {project.description}
            </div>

            <div className="demo-project-dates">
              <div className="demo-date-item">
                <span className="demo-date-label">Start:</span>
                <span className="demo-date-value">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="demo-date-item">
                <span className="demo-date-label">End:</span>
                <span className="demo-date-value">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="demo-project-rooms">
              <div className="demo-rooms-header">Rooms ({project.rooms.length})</div>
              {project.rooms.map((room) => (
                <div key={room.id} className="demo-room-item">
                  <span className="demo-room-name">{room.name}</span>
                  <span className="demo-room-size">
                    {room.measurements.width}m × {room.measurements.height}m
                  </span>
                </div>
              ))}
            </div>

            <div className="demo-project-actions">
              <button className="demo-btn demo-btn-secondary demo-btn-sm">
                View Details
              </button>
              <button className="demo-btn demo-btn-primary demo-btn-sm">
                Edit Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project CTA */}
      <div className="demo-cta-card">
        <div className="demo-cta-content">
          <h3 className="demo-cta-title">Ready to create your first project?</h3>
          <p className="demo-cta-description">
            Start by adding client details, room measurements, and selecting your window treatments.
          </p>
          <button className="demo-btn demo-btn-primary">
            Create Project Now
          </button>
        </div>
      </div>
    </div>
  );
};