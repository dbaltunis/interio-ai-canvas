import React, { useState } from 'react';
import { useDemoData } from '../DemoDataProvider';

export const DemoCalendar = () => {
  const { events } = useDemoData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('week');

  const eventTypes = {
    consultation: { color: '#3B82F6', icon: '🤝' },
    installation: { color: '#10B981', icon: '🔧' },
    'follow-up': { color: '#F59E0B', icon: '📞' },
    meeting: { color: '#8B5CF6', icon: '📋' }
  };

  // Generate sample week days
  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <h1 className="demo-page-title">Calendar & Scheduling</h1>
          <p className="demo-page-subtitle">
            Manage appointments, deadlines, and team scheduling
          </p>
        </div>
        <button className="demo-btn demo-btn-primary">
          + Schedule Appointment
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="demo-calendar-controls">
        <div className="demo-view-switcher">
          <button 
            className={`demo-btn demo-btn-sm ${viewMode === 'day' ? 'demo-btn-primary' : 'demo-btn-secondary'}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`demo-btn demo-btn-sm ${viewMode === 'week' ? 'demo-btn-primary' : 'demo-btn-secondary'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`demo-btn demo-btn-sm ${viewMode === 'month' ? 'demo-btn-primary' : 'demo-btn-secondary'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>

        <div className="demo-date-navigation">
          <button className="demo-btn demo-btn-secondary demo-btn-sm">‹ Previous</button>
          <span className="demo-current-period">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="demo-btn demo-btn-secondary demo-btn-sm">Next ›</button>
        </div>
      </div>

      <div className="demo-calendar-layout">
        {/* Calendar Grid */}
        <div className="demo-calendar-main">
          <div className="demo-calendar-grid">
            {/* Week View */}
            <div className="demo-week-header">
              {weekDays.map((day, index) => (
                <div key={index} className="demo-day-header">
                  <div className="demo-day-name">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="demo-day-number">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="demo-time-grid">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i + 8; // Start from 8 AM
                return (
                  <div key={hour} className="demo-time-row">
                    <div className="demo-time-label">
                      {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                    </div>
                    <div className="demo-time-slots">
                      {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="demo-time-slot">
                          {events
                            .filter(event => {
                              const eventHour = parseInt(event.time.split(':')[0]);
                              return eventHour === hour && dayIndex < 2; // Show events only on first 2 days
                            })
                            .map(event => (
                              <div 
                                key={event.id}
                                className="demo-event-block"
                                style={{ backgroundColor: eventTypes[event.type]?.color }}
                              >
                                <div className="demo-event-time">{event.time}</div>
                                <div className="demo-event-title">{event.title}</div>
                                <div className="demo-event-client">{event.clientName}</div>
                              </div>
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="demo-calendar-sidebar">
          {/* Upcoming Events */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Upcoming Events</h3>
            </div>
            <div className="demo-events-list">
              {events.map((event) => (
                <div key={event.id} className="demo-event-item">
                  <div className="demo-event-icon" style={{ backgroundColor: eventTypes[event.type]?.color }}>
                    {eventTypes[event.type]?.icon}
                  </div>
                  <div className="demo-event-details">
                    <div className="demo-event-title">{event.title}</div>
                    <div className="demo-event-meta">
                      <span className="demo-event-date">{event.date}</span>
                      <span className="demo-event-time">{event.time}</span>
                    </div>
                    <div className="demo-event-client">{event.clientName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Quick Actions</h3>
            </div>
            <div className="demo-quick-actions">
              <button className="demo-action-btn">
                <span className="demo-action-icon">📅</span>
                <span className="demo-action-text">Book Consultation</span>
              </button>
              <button className="demo-action-btn">
                <span className="demo-action-icon">🔧</span>
                <span className="demo-action-text">Schedule Installation</span>
              </button>
              <button className="demo-action-btn">
                <span className="demo-action-icon">📞</span>
                <span className="demo-action-text">Follow-up Call</span>
              </button>
              <button className="demo-action-btn">
                <span className="demo-action-icon">📋</span>
                <span className="demo-action-text">Team Meeting</span>
              </button>
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">This Week</h3>
            </div>
            <div className="demo-calendar-stats">
              <div className="demo-stat-row">
                <span className="demo-stat-label">Appointments</span>
                <span className="demo-stat-value">12</span>
              </div>
              <div className="demo-stat-row">
                <span className="demo-stat-label">Consultations</span>
                <span className="demo-stat-value">5</span>
              </div>
              <div className="demo-stat-row">
                <span className="demo-stat-label">Installations</span>
                <span className="demo-stat-value">3</span>
              </div>
              <div className="demo-stat-row">
                <span className="demo-stat-label">Follow-ups</span>
                <span className="demo-stat-value">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};