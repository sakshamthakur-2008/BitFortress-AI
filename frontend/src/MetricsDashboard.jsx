import React from 'react';
import './MetricsDashboard.css';
import {
  ActivityIcon,
  ShieldCheckIcon,
  ServerIcon,
  ServerCrashIcon,
  LayersIcon,
  PackageIcon,
  HardDriveIcon,
  Edit3Icon,
  BookOpenIcon,
  DatabaseIcon,
  AlertTriangleIcon
} from './components/Icons';

function MetricsDashboard({ status }) {
  const durability = status.durability_percentage || 100;
  const getDurabilityColor = (val) => {
    if (val >= 99.5) return '#10b981';
    if (val >= 95) return '#38bdf8';
    if (val >= 90) return '#f59e0b';
    return '#ef4444';
  };

  const MetricCard = ({ title, value, unit = '', color = '#10b981', icon = null }) => (
    <div className="metric-card">
      <div className="metric-header-row">
        <span className="metric-title">{title}</span>
        {icon && <div className="metric-icon-wrap">{icon}</div>}
      </div>
      <div className="metric-value" style={{ color }}>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="metrics-dashboard">
      <div className="dashboard-title-row">
        <ActivityIcon size={18} color="#38bdf8" />
        <h2>Cluster Telemetry & Metrics</h2>
      </div>
      
      <div className="metrics-grid">
        <MetricCard
          title="Parity Durability"
          value={durability.toFixed(1)}
          unit="%"
          color={getDurabilityColor(durability)}
          icon={<ShieldCheckIcon size={18} color={getDurabilityColor(durability)} />}
        />
        
        <MetricCard
          title="Active Storage Nodes"
          value={status.alive_nodes}
          unit={`/${status.total_nodes}`}
          color={status.failed_nodes > 0 ? '#f59e0b' : '#10b981'}
          icon={<ServerIcon size={18} color="#10b981" />}
        />
        
        <MetricCard
          title="Offline Nodes"
          value={status.failed_nodes}
          color={status.failed_nodes > 0 ? '#ef4444' : '#10b981'}
          icon={<ServerCrashIcon size={18} color={status.failed_nodes > 0 ? '#ef4444' : '#64748b'} />}
        />
        
        <MetricCard
          title="Replication Factor"
          value={status.replication_factor}
          unit="x"
          color="#818cf8"
          icon={<LayersIcon size={18} color="#818cf8" />}
        />
        
        <MetricCard
          title="Stored Objects"
          value={status.total_objects}
          color="#38bdf8"
          icon={<PackageIcon size={18} color="#38bdf8" />}
        />
        
        <MetricCard
          title="Storage Allocated"
          value={status.total_data_mb.toFixed(2)}
          unit=" MB"
          color="#c084fc"
          icon={<HardDriveIcon size={18} color="#c084fc" />}
        />
        
        <MetricCard
          title="Total Writes"
          value={status.total_writes}
          color="#34d399"
          icon={<Edit3Icon size={18} color="#34d399" />}
        />
        
        <MetricCard
          title="Total Reads"
          value={status.total_reads}
          color="#60a5fa"
          icon={<BookOpenIcon size={18} color="#60a5fa" />}
        />
      </div>

      {/* Durability Bar */}
      <div className="durability-section">
        <div className="durability-header">
          <div className="durability-title-wrap">
            <ShieldCheckIcon size={16} color={getDurabilityColor(durability)} />
            <h3>System Parity Durability Target</h3>
          </div>
          <span className="durability-percentage" style={{ color: getDurabilityColor(durability) }}>
            {durability.toFixed(2)}%
          </span>
        </div>
        <div className="durability-bar-container">
          <div
            className="durability-bar-fill"
            style={{
              width: `${Math.min(durability, 100)}%`,
              backgroundColor: getDurabilityColor(durability),
              boxShadow: `0 0 12px ${getDurabilityColor(durability)}`
            }}
          />
        </div>
        <div className="durability-threshold-line" style={{ left: '99.5%' }}>
          <span className="threshold-label">99.5% SLA Threshold</span>
        </div>
      </div>

      {/* Replica Distribution */}
      <div className="replica-section">
        <div className="section-title-wrap">
          <LayersIcon size={16} color="#818cf8" />
          <h3>Multi-Rack Replica Distribution</h3>
        </div>
        <div className="replica-grid">
          {status.nodes && status.nodes.map((node) => (
            <div
              key={node.node_id}
              className={`replica-card ${node.is_alive ? 'alive' : 'dead'}`}
            >
              <div className="replica-node-id">{node.node_id}</div>
              <div className="replica-count">{node.total_replicas}</div>
              <div className="replica-label">replicas</div>
              {node.failed_replicas > 0 && (
                <div className="replica-failed">
                  <AlertTriangleIcon size={11} color="#f59e0b" />
                  <span>{node.failed_replicas} corrupted</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Storage per Node */}
      <div className="storage-section">
        <div className="section-title-wrap">
          <DatabaseIcon size={16} color="#818cf8" />
          <h3>Storage Allocation per Node</h3>
        </div>
        <div className="storage-bars">
          {status.nodes && status.nodes.map((node) => (
            <div key={node.node_id} className="storage-bar-item">
              <div className="storage-label">{node.node_id}</div>
              <div className="storage-bar-wrapper">
                <div
                  className={`storage-bar ${node.is_alive ? 'active' : 'inactive'}`}
                  style={{ width: `${Math.min(100, Math.max(8, (node.storage_used_mb / 6) * 100))}%` }}
                />
              </div>
              <div className="storage-size">{node.storage_used_mb.toFixed(1)} MB</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboard;
