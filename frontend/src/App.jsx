import React, { useState, useEffect } from 'react';
import './App.css';
import ClusterVisualization from './ClusterVisualization';
import MetricsDashboard from './MetricsDashboard';
import ControlPanel from './ControlPanel';
import EventLog from './EventLog';
import AICopilot from './AICopilot';
import clusterEngine from './services/aiClusterEngine';
import { 
  FortressShieldLogo,
  ShieldCheckIcon,
  CheckCircleIcon,
  ServerCrashIcon,
  CpuIcon,
  DatabaseIcon,
  RefreshCwIcon,
  SparklesIcon
} from './components/Icons';

function App() {
  const [clusterStatus, setClusterStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useLocalEngine, setUseLocalEngine] = useState(true);
  const [notification, setNotification] = useState('');

  const API_BASE = 'http://localhost:8000/api';

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Subscribe to Combined AI Cluster Engine
  useEffect(() => {
    if (useLocalEngine) {
      const unsubscribe = clusterEngine.subscribe((status, newEvents) => {
        setClusterStatus(status);
        setEvents(newEvents);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Polling from external API if user selected external backend
      const fetchStatus = async () => {
        try {
          const res = await fetch(`${API_BASE}/cluster/status`);
          if (res.ok) {
            const data = await res.json();
            setClusterStatus(data);
          } else {
            showNotification('Local backend not responding. Falling back to AI Combined Engine.');
            setUseLocalEngine(true);
          }
        } catch (err) {
          showNotification('Backend offline. Switched to AI Combined Engine.');
          setUseLocalEngine(true);
        }
      };

      const fetchEvents = async () => {
        try {
          const res = await fetch(`${API_BASE}/cluster/events`);
          if (res.ok) {
            const data = await res.json();
            setEvents(data.events || []);
          }
        } catch (err) {
          // ignore
        }
      };

      fetchStatus();
      fetchEvents();
      const interval = setInterval(() => {
        fetchStatus();
        fetchEvents();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [useLocalEngine]);

  return (
    <div className="app">
      {/* Top Banner Notification */}
      {notification && (
        <div className="top-notification">
          <SparklesIcon size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-brand">
            <div className="brand-logo-container">
              <FortressShieldLogo size={44} />
            </div>
            <div>
              <div className="brand-title-wrap">
                <h1 className="brand-title">BitFortress</h1>
                <span className="brand-version">v2.4 Enterprise</span>
              </div>
              <p className="brand-subtitle">Distributed Object Storage • AI Autonomous Parity Guard</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Engine Mode Toggle */}
          <div className="engine-mode-pill">
            <span className="mode-dot live"></span>
            <span className="mode-icon">
              {useLocalEngine ? <CpuIcon size={14} color="#38bdf8" /> : <DatabaseIcon size={14} color="#a855f7" />}
            </span>
            <span className="mode-label">
              {useLocalEngine ? 'AI Combined Engine (Zero-Latency)' : 'Local Backend (Port 8000)'}
            </span>
            <button 
              className="mode-toggle-btn" 
              onClick={() => {
                const nextMode = !useLocalEngine;
                setUseLocalEngine(nextMode);
                showNotification(`Switched mode to ${nextMode ? 'AI Combined Engine' : 'External Backend (port 8000)'}`);
              }}
              title="Toggle between in-app AI engine and external API"
            >
              <RefreshCwIcon size={12} />
              <span>Switch</span>
            </button>
          </div>

          {clusterStatus && (
            <div className="header-status">
              <span className="status-badge alive">
                <CheckCircleIcon size={14} />
                <span>{clusterStatus.alive_nodes} / {clusterStatus.total_nodes} Online</span>
              </span>
              {clusterStatus.failed_nodes > 0 && (
                <span className="status-badge failed">
                  <ServerCrashIcon size={14} />
                  <span>{clusterStatus.failed_nodes} Failed</span>
                </span>
              )}
              <span className="status-badge durability">
                <ShieldCheckIcon size={14} />
                <span>{clusterStatus.durability_percentage?.toFixed(1)}% Durability</span>
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="app-content">
        {/* AI Resilience Copilot Section */}
        {clusterStatus && (
          <AICopilot 
            engine={clusterEngine} 
            status={clusterStatus} 
            onActionTriggered={showNotification}
          />
        )}

        {/* Top Section: Metrics + Control Panel */}
        <div className="top-section">
          <div className="metrics-wrapper">
            {clusterStatus && <MetricsDashboard status={clusterStatus} />}
          </div>
          <div className="control-wrapper">
            <ControlPanel 
              API_BASE={API_BASE} 
              engine={useLocalEngine ? clusterEngine : null}
              onActionTriggered={showNotification}
            />
          </div>
        </div>

        {/* Middle Section: Interactive Topology Fortress */}
        <div className="visualization-wrapper">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Initializing AI storage cluster...</p>
            </div>
          ) : clusterStatus ? (
            <ClusterVisualization 
              status={clusterStatus} 
              engine={useLocalEngine ? clusterEngine : null}
            />
          ) : null}
        </div>

        {/* Bottom Section: Real-Time Event Log */}
        <div className="bottom-section">
          <EventLog events={events} />
        </div>
      </div>
    </div>
  );
}

export default App;
