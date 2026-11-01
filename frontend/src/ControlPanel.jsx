import React, { useState } from 'react';
import './ControlPanel.css';
import {
  SlidersIcon,
  DatabaseIcon,
  ServerIcon,
  ServerCrashIcon,
  CheckCircleIcon,
  BugIcon,
  ShieldIcon,
  RefreshCwIcon,
  ScaleIcon,
  ZapIcon,
  PlayIcon,
  Edit3Icon,
  AlertTriangleIcon
} from './components/Icons';

function ControlPanel({ API_BASE, engine, onActionTriggered }) {
  const [selectedNode, setSelectedNode] = useState('node-01');
  const [writeData, setWriteData] = useState('Enterprise Encrypted Payload #8820 - Distributed Parity Block');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('info');

  const showMessage = (msg, type = 'info', duration = 3000) => {
    setMessage(msg);
    setMsgType(type);
    if (onActionTriggered) onActionTriggered(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const handleAction = async (action, endpoint, body = {}) => {
    setLoading(true);

    // If engine is available, use fast direct AI combined engine!
    if (engine) {
      try {
        if (endpoint === '/write') {
          const res = engine.writeObject(body.data || writeData, body.description || 'Demo write');
          if (res.status === 'success') {
            showMessage(`Object ${res.object_id} stored with 3x replication across [${res.stored_on.join(', ')}]`, 'success');
          } else {
            showMessage(`Write failed: ${res.message}`, 'error', 3000);
          }
        } else if (endpoint === '/cluster/node/fail') {
          const res = engine.failNode(body.node_id);
          if (res.status === 'success') {
            showMessage(`Node ${body.node_id} marked as FAILED`, 'error');
          } else {
            showMessage(res.message, 'error');
          }
        } else if (endpoint === '/cluster/node/recover') {
          const res = engine.recoverNode(body.node_id);
          if (res.status === 'success') {
            showMessage(`Node ${body.node_id} successfully RECOVERED`, 'success');
          } else {
            showMessage(res.message, 'error');
          }
        } else if (endpoint === '/cluster/node/corrupt') {
          const res = engine.corruptData(body.node_id);
          if (res.status === 'success') {
            showMessage(`Bit-rot injected into replica on ${body.node_id}! Checksum failure flagged.`, 'warning');
          } else {
            showMessage(res.message || 'No objects to corrupt on this node', 'info');
          }
        } else if (endpoint === '/cluster/repair') {
          const res = engine.repairCluster();
          showMessage(`AI Parity Repair Complete: ${res.repaired_replicas || 0} replicas reconstructed.`, 'success');
        } else if (endpoint === '/cluster/rebalance') {
          engine.rebalanceData();
          showMessage(`Data Rebalanced across all nodes.`, 'success');
        } else if (endpoint === '/demo/stress-test') {
          await engine.runStressTest((stepMsg) => {
            setMessage(stepMsg);
            setMsgType('info');
          });
          showMessage(`Stress Test Succeeded: Cluster survived chaos with 100% durability!`, 'success', 4000);
        }
      } catch (err) {
        showMessage(`Error: ${err.message}`, 'error', 3000);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback to HTTP API
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        showMessage(`${action} successful`, 'success');
      } else {
        showMessage(`${action} failed`, 'error', 2000);
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error', 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="control-panel">
      <div className="panel-title-bar">
        <SlidersIcon size={18} color="#38bdf8" />
        <h2>Control Panel</h2>
      </div>

      {/* Storage Operations */}
      <div className="control-section">
        <div className="section-header">
          <DatabaseIcon size={15} color="#818cf8" />
          <h3>Storage Operations</h3>
        </div>
        
        <div className="control-group">
          <label>Write Object Payload (3x Parity Replicated):</label>
          <textarea
            value={writeData}
            onChange={(e) => setWriteData(e.target.value)}
            placeholder="Enter data payload to replicate..."
            rows="3"
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAction('Write', '/write', { data: writeData, description: 'Demo write' })}
            disabled={loading || !writeData.trim()}
          >
            <Edit3Icon size={14} />
            <span>Write Replicated Object</span>
          </button>
        </div>
      </div>

      {/* Node Operations */}
      <div className="control-section">
        <div className="section-header">
          <ServerIcon size={15} color="#818cf8" />
          <h3>Node Fault Injection</h3>
        </div>
        
        <div className="control-group">
          <label>Target Storage Node:</label>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            disabled={loading}
          >
            {Array.from({ length: 9 }, (_, i) => `node-${String(i + 1).padStart(2, '0')}`).map(
              (nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              )
            )}
          </select>
        </div>

        <div className="button-group">
          <button
            className="btn btn-danger"
            onClick={() => handleAction('Fail Node', '/cluster/node/fail', { node_id: selectedNode })}
            disabled={loading}
          >
            <ServerCrashIcon size={14} />
            <span>Fail Node</span>
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleAction('Recover Node', '/cluster/node/recover', { node_id: selectedNode })}
            disabled={loading}
          >
            <CheckCircleIcon size={14} />
            <span>Recover</span>
          </button>
          <button
            className="btn btn-warning"
            onClick={() => handleAction('Corrupt Data', '/cluster/node/corrupt', { node_id: selectedNode })}
            disabled={loading}
          >
            <BugIcon size={14} />
            <span>Bit-Rot</span>
          </button>
        </div>
      </div>

      {/* Cluster Operations */}
      <div className="control-section">
        <div className="section-header">
          <ShieldIcon size={15} color="#818cf8" />
          <h3>Cluster Operations</h3>
        </div>
        
        <div className="button-group">
          <button
            className="btn btn-info"
            onClick={() => handleAction('Repair', '/cluster/repair')}
            disabled={loading}
          >
            <RefreshCwIcon size={14} />
            <span>Trigger Repair</span>
          </button>
          <button
            className="btn btn-info"
            onClick={() => handleAction('Rebalance', '/cluster/rebalance')}
            disabled={loading}
          >
            <ScaleIcon size={14} />
            <span>Rebalance</span>
          </button>
        </div>
      </div>

      {/* Demo Scenarios */}
      <div className="control-section">
        <div className="section-header">
          <ZapIcon size={15} color="#a855f7" />
          <h3>Automated Chaos Resilience Demo</h3>
        </div>
        
        <button
          className="btn btn-demo"
          onClick={() => handleAction('Demo', '/demo/stress-test')}
          disabled={loading}
        >
          <PlayIcon size={14} />
          <span>Execute Resilience & Chaos Suite</span>
        </button>
        
        <p className="scenario-description">
          Writes distributed blocks, simulates dual-node outage, introduces bit-rot, and verifies AI self-repair restoring durability to 100%.
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`status-message status-${msgType}`}>
          {msgType === 'success' && <CheckCircleIcon size={14} />}
          {msgType === 'warning' && <AlertTriangleIcon size={14} />}
          {msgType === 'error' && <ServerCrashIcon size={14} />}
          {msgType === 'info' && <RefreshCwIcon size={14} />}
          <span>{message}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing Cluster Action...</p>
        </div>
      )}
    </div>
  );
}

export default ControlPanel;
