import React, { useState } from 'react';
import './ClusterVisualization.css';
import {
  FortressShieldLogo,
  SparklesIcon,
  ServerCrashIcon,
  BugIcon,
  CheckCircleIcon
} from './components/Icons';
import { diagnoseNodeWithGroq } from './services/groqService';

function ClusterVisualization({ status, engine }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [groqLoading, setGroqLoading] = useState(false);
  const nodes = status.nodes || [];
  const numNodes = nodes.length;

  const handleGroqAnalyze = async (node) => {
    setGroqLoading(true);
    setGroqAnalysis('');
    try {
      const result = await diagnoseNodeWithGroq(node, status);
      setGroqAnalysis(result);
    } catch (err) {
      setGroqAnalysis(`Analysis error: ${err.message}`);
    } finally {
      setGroqLoading(false);
    }
  };
  
  // Arrange nodes in a circle
  const angles = nodes.map((_, i) => (i * 360) / numNodes);
  
  const getNodeColor = (node) => {
    if (!node.is_alive) return '#ef4444'; // Red for dead
    if (node.failed_replicas > 0) return '#f59e0b'; // Amber for damaged/corrupted
    return '#10b981'; // Green for healthy
  };

  const getNodeStatus = (node) => {
    if (!node.is_alive) return 'DEAD';
    if (node.failed_replicas > 0) return 'DAMAGED';
    return 'HEALTHY';
  };

  const activeNode = nodes.find(n => n.node_id === selectedNodeId);

  return (
    <div className="visualization">
      <div className="viz-header">
        <div className="viz-title-row">
          <FortressShieldLogo size={22} />
          <h2>Topology Fortress & Multi-Rack Mesh</h2>
        </div>
        <span className="viz-hint">
          <SparklesIcon size={13} color="#818cf8" />
          <span>Click any node to inspect replicas and AI failure probability</span>
        </span>
      </div>
      
      <div className="viz-canvas-container">
        <svg className="cluster-svg" viewBox="0 0 1000 800">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
            
            {/* Glow effect */}
            <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="vaultGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="1000" height="800" fill="url(#grid)" />
          
          {/* Concentric Parity Rings */}
          <circle cx="500" cy="400" r="250" fill="none" stroke="rgba(99, 102, 241, 0.18)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="500" cy="400" r="170" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" />
          
          {/* Central fortress / Vault */}
          <circle cx="500" cy="400" r="115" fill="#0d1424" stroke="url(#shieldGrad)" strokeWidth="3" filter="url(#vaultGlow)"/>
          <circle cx="500" cy="400" r="80" fill="none" stroke="rgba(0, 247, 255, 0.35)" strokeWidth="1.5" strokeDasharray="5 5" />

          {/* Central Logo Emblem */}
          <foreignObject x="476" y="330" width="48" height="48">
            <FortressShieldLogo size={48} />
          </foreignObject>

          <text x="500" y="398" textAnchor="middle" className="fortress-label" fill="#00f7ff" fontSize="16" fontWeight="800" letterSpacing="3">
            BITFORTRESS
          </text>
          <text x="500" y="416" textAnchor="middle" fill="#9d4edd" fontSize="11" fontWeight="700" letterSpacing="1.5">
            PARITY VAULT
          </text>
          <text x="500" y="436" textAnchor="middle" fill="#00f59b" fontSize="11" fontWeight="800" letterSpacing="1">
            {status.durability_percentage?.toFixed(1)}% DURABILITY
          </text>
          
          {/* Connection lines from vault to nodes */}
          {nodes.map((node, i) => {
            const angle = angles[i];
            const rad = (angle * Math.PI) / 180;
            const x = 500 + Math.cos(rad) * 250;
            const y = 400 + Math.sin(rad) * 250;
            const isSelected = node.node_id === selectedNodeId;
            
            return (
              <line
                key={`line-${i}`}
                x1="500"
                y1="400"
                x2={x}
                y2={y}
                stroke={node.is_alive ? (isSelected ? '#a855f7' : '#10b981') : '#ef4444'}
                strokeWidth={isSelected ? '3' : '1.5'}
                opacity={node.is_alive ? '0.6' : '0.2'}
                strokeDasharray={node.is_alive ? 'none' : '4 4'}
                className={node.is_alive ? 'line-active' : 'line-dead'}
              />
            );
          })}
          
          {/* Node elements */}
          {nodes.map((node, i) => {
            const angle = angles[i];
            const rad = (angle * Math.PI) / 180;
            const x = 500 + Math.cos(rad) * 250;
            const y = 400 + Math.sin(rad) * 250;
            const color = getNodeColor(node);
            const nodeStatus = getNodeStatus(node);
            const isSelected = node.node_id === selectedNodeId;
            
            return (
              <g 
                key={node.node_id} 
                className="node-group"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedNodeId(node.node_id === selectedNodeId ? null : node.node_id)}
              >
                {/* Selection indicator halo */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="44"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Node outer glow shadow */}
                <circle
                  cx={x}
                  cy={y}
                  r="36"
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  opacity={node.is_alive ? '0.25' : '0.1'}
                  className={!node.is_alive ? 'pulse-dead' : ''}
                />
                
                {/* Main node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="28"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                  className={node.is_alive && nodeStatus !== 'DAMAGED' ? 'pulse-healthy' : ''}
                />
                
                {/* Node ID label */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="node-label"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  {node.node_id.split('-')[1]}
                </text>
                
                {/* Status indicator below node */}
                <text
                  x={x}
                  y={y + 48}
                  textAnchor="middle"
                  className={`node-status-text status-${nodeStatus.toLowerCase()}`}
                  fontSize="11"
                  fontWeight="700"
                >
                  {nodeStatus}
                </text>
                
                {/* Replica metric */}
                <text
                  x={x}
                  y={y + 64}
                  textAnchor="middle"
                  className="node-metric"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {node.objects_stored} rep • {node.rack || 'rack-1'}
                </text>
                
                {/* Vector Damage Badge */}
                {node.failed_replicas > 0 && (
                  <g transform={`translate(${x + 16}, ${y - 20})`}>
                    <circle cx="0" cy="0" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="0" y1="-4" x2="0" y2="1" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="0" cy="4" r="1" fill="#0f172a" />
                  </g>
                )}
                
                {/* Vector Dead Badge */}
                {!node.is_alive && (
                  <g transform={`translate(${x + 16}, ${y - 20})`}>
                    <circle cx="0" cy="0" r="9" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="-3" y1="-3" x2="3" y2="3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="-3" x2="-3" y2="3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Node Inspector Drawer/Popup */}
        {activeNode && (
          <div className="node-inspector-drawer">
            <div className="inspector-header">
              <div className="inspector-title">
                <h4>Node Inspector: {activeNode.node_id}</h4>
                <span className={`inspector-badge ${activeNode.is_alive ? (activeNode.failed_replicas > 0 ? 'damaged' : 'alive') : 'dead'}`}>
                  {getNodeStatus(activeNode)}
                </span>
              </div>
              <button className="inspector-close" onClick={() => setSelectedNodeId(null)}>✕</button>
            </div>

            <div className="inspector-metrics">
              <div className="ins-metric">
                <span className="ins-label">Rack Placement:</span>
                <span className="ins-val">{activeNode.rack || 'rack-1'}</span>
              </div>
              <div className="ins-metric">
                <span className="ins-label">Replicas Stored:</span>
                <span className="ins-val">{activeNode.objects_stored}</span>
              </div>
              <div className="ins-metric">
                <span className="ins-label">Bit-Rot Corruptions:</span>
                <span className={`ins-val ${activeNode.failed_replicas > 0 ? 'alert' : ''}`}>
                  {activeNode.failed_replicas}
                </span>
              </div>
              <div className="ins-metric">
                <span className="ins-label">AI Failure Probability:</span>
                <span className={`ins-val ${activeNode.anomaly_score > 0.4 ? 'alert' : ''}`}>
                  {((activeNode.anomaly_score || 0.05) * 100).toFixed(0)}% ({activeNode.risk_level || 'LOW'})
                </span>
              </div>
              <div className="ins-metric">
                <span className="ins-label">Simulated Port:</span>
                <span className="ins-val">{activeNode.port}</span>
              </div>
            </div>

            {/* Groq AI Diagnostics Section */}
            <div className="inspector-groq-section">
              <button 
                className="btn btn-sm btn-groq-analyze"
                onClick={() => handleGroqAnalyze(activeNode)}
                disabled={groqLoading}
              >
                <SparklesIcon size={13} color="#00f2fe" />
                <span>{groqLoading ? 'Diagnosing with Groq LLM...' : 'Groq AI Node Diagnosis'}</span>
              </button>

              {groqAnalysis && (
                <div className="groq-analysis-box">
                  <div className="groq-analysis-header">
                    <SparklesIcon size={12} color="#38bdf8" />
                    <span>GROQ LLM TELEMETRY ASSESSMENT</span>
                  </div>
                  <div className="groq-analysis-text">
                    {groqAnalysis}
                  </div>
                </div>
              )}
            </div>

            {engine && (
              <div className="inspector-actions">
                {activeNode.is_alive ? (
                  <>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => engine.failNode(activeNode.node_id)}
                    >
                      <ServerCrashIcon size={12} />
                      <span>Force Outage</span>
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => engine.corruptData(activeNode.node_id)}
                    >
                      <BugIcon size={12} />
                      <span>Inject Bit-Rot</span>
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => engine.recoverNode(activeNode.node_id)}
                  >
                    <CheckCircleIcon size={12} />
                    <span>Restore Node</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="visualization-legend">
        <div className="legend-item">
          <span className="legend-color healthy"></span>
          <span>Healthy Node</span>
        </div>
        <div className="legend-item">
          <span className="legend-color damaged"></span>
          <span>Bit-Rot Corrupted</span>
        </div>
        <div className="legend-item">
          <span className="legend-color dead"></span>
          <span>Offline / Failed</span>
        </div>
        <div className="legend-item">
          <span className="legend-color rack"></span>
          <span>AI Multi-Rack Parity Guard</span>
        </div>
      </div>
    </div>
  );
}

export default ClusterVisualization;
