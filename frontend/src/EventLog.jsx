import React from 'react';
import './EventLog.css';
import {
  TerminalIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ServerCrashIcon,
  ActivityIcon,
  ClockIcon
} from './components/Icons';

function EventLog({ events }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon size={15} color="#10b981" />;
      case 'info':
        return <ActivityIcon size={15} color="#38bdf8" />;
      case 'warning':
        return <AlertTriangleIcon size={15} color="#f59e0b" />;
      case 'critical':
      case 'error':
        return <ServerCrashIcon size={15} color="#ef4444" />;
      default:
        return <ActivityIcon size={15} color="#818cf8" />;
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <div className="event-log">
      <div className="event-log-header">
        <div className="header-title-wrap">
          <TerminalIcon size={18} color="#38bdf8" />
          <h2>Cluster Telemetry & Event Audit Log</h2>
        </div>
        <span className="log-counter">{events.length} Events Logged</span>
      </div>
      
      <div className="event-log-container">
        {events.length === 0 ? (
          <div className="no-events">
            <ActivityIcon size={24} color="#64748b" />
            <p>Awaiting cluster activity and telemetry streams...</p>
          </div>
        ) : (
          <div className="events-list">
            {[...events].map((event, index) => (
              <div
                key={index}
                className={`event-item severity-${getSeverityLabel(event.severity)}`}
              >
                <div className="event-icon-wrapper">
                  {renderSeverityIcon(event.severity)}
                </div>
                <div className="event-content">
                  <div className="event-message">{event.message}</div>
                  <div className="event-meta">
                    <span className="event-type">{event.type}</span>
                    <span className="event-time">
                      <ClockIcon size={11} />
                      <span>{formatTime(event.timestamp)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="event-legend">
        <div className="legend-item">
          <CheckCircleIcon size={14} color="#10b981" />
          <span>Success</span>
        </div>
        <div className="legend-item">
          <ActivityIcon size={14} color="#38bdf8" />
          <span>Telemetry Info</span>
        </div>
        <div className="legend-item">
          <AlertTriangleIcon size={14} color="#f59e0b" />
          <span>Degraded / Warning</span>
        </div>
        <div className="legend-item">
          <ServerCrashIcon size={14} color="#ef4444" />
          <span>Node Loss / Fault</span>
        </div>
      </div>
    </div>
  );
}

export default EventLog;
