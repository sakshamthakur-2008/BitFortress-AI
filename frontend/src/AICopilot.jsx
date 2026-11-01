import React, { useState, useEffect, useRef } from 'react';
import './AICopilot.css';
import {
  FortressShieldLogo,
  SparklesIcon,
  ZapIcon,
  ShieldCheckIcon,
  BugIcon,
  ScaleIcon,
  BarChartIcon,
  BookOpenIcon,
  ActivityIcon,
  SearchIcon,
  TriangleDangerIcon,
  TrendUpIcon,
  PieChartIcon,
  NetworkIcon
} from './components/Icons';
import { queryGroqCopilot } from './services/groqService';

// ─── Advanced SVG Analytics Graph Component ───────────────────────────────────
function AdvancedDiagnosticsGraph({ status, auditResult }) {
  const [animStep, setAnimStep] = useState(0);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSparkIdx, setHoveredSparkIdx] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const total = 40;
    animRef.current = setInterval(() => {
      frame++;
      setAnimStep(Math.min(frame / total, 1));
      if (frame >= total) clearInterval(animRef.current);
    }, 18);
    return () => clearInterval(animRef.current);
  }, []);

  const nodes = status?.nodes || [];
  const durability = status?.durability_percentage || 100;

  const sparkPoints = Array.from({ length: 20 }, (_, i) => {
    const jitter = Math.sin(i * 0.7) * 4 + Math.cos(i * 1.2) * 3;
    return Math.min(100, Math.max(75, durability + jitter - 2));
  });
  sparkPoints[sparkPoints.length - 1] = durability;

  const sparkW = 360, sparkH = 60;
  const sparkXStep = sparkW / (sparkPoints.length - 1);
  const sparkMin = Math.min(...sparkPoints) - 2;
  const sparkMax = Math.max(...sparkPoints) + 2;
  const toY = (v) => sparkH - ((v - sparkMin) / (sparkMax - sparkMin)) * sparkH;
  const sparkPath = sparkPoints
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * sparkXStep).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(' ');
  const sparkFill = sparkPath + ` L${sparkW},${sparkH} L0,${sparkH} Z`;

  const getHealthScore = (node) => {
    if (!node.is_alive) return 0;
    if (node.failed_replicas > 0) return Math.max(30, 80 - node.failed_replicas * 20);
    return Math.round(100 - (node.anomaly_score || 0.05) * 60);
  };

  const barW = nodes.length > 0 ? Math.min(44, Math.floor(320 / nodes.length) - 6) : 32;
  const barGap = nodes.length > 0 ? Math.floor(320 / nodes.length) : 40;
  const barColors = (node) => {
    if (!node.is_alive) return { bar: '#ef4444', glow: 'rgba(239,68,68,0.4)' };
    if (node.failed_replicas > 0) return { bar: '#f59e0b', glow: 'rgba(245,158,11,0.4)' };
    return { bar: '#10b981', glow: 'rgba(16,185,129,0.4)' };
  };

  const maxStorage = Math.max(...nodes.map(n => n.storage_used_mb || 0), 1);

  // Gauge arc math
  const rad = (d) => (d * Math.PI) / 180;
  const gaugeCx = 60, gaugeCy = 60, gaugeR = 48;
  const gaugeStartAngle = -210;
  const gaugeEndAngle = 30;
  const gaugeArcEnd = gaugeStartAngle + ((durability / 100) * (gaugeEndAngle - gaugeStartAngle) * animStep);
  const arcX1 = gaugeCx + gaugeR * Math.cos(rad(gaugeStartAngle));
  const arcY1 = gaugeCy + gaugeR * Math.sin(rad(gaugeStartAngle));
  const arcX2 = gaugeCx + gaugeR * Math.cos(rad(gaugeArcEnd));
  const arcY2 = gaugeCy + gaugeR * Math.sin(rad(gaugeArcEnd));
  const largeArc = Math.abs(gaugeArcEnd - gaugeStartAngle) > 180 ? 1 : 0;
  const gaugeTrackX2 = gaugeCx + gaugeR * Math.cos(rad(gaugeEndAngle));
  const gaugeTrackY2 = gaugeCy + gaugeR * Math.sin(rad(gaugeEndAngle));
  const durColor = durability >= 99.5 ? '#10b981' : durability >= 95 ? '#38bdf8' : durability >= 90 ? '#f59e0b' : '#ef4444';

  return (
    <div className="adv-graph-container">
      <div className="adv-row adv-row-top">
        {/* Durability Gauge */}
        <div className="adv-panel gauge-panel">
          <div className="adv-panel-title">
            <PieChartIcon size={14} color={durColor} />
            <span>Durability Gauge</span>
          </div>
          <svg viewBox="0 0 120 80" className="gauge-svg">
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path
              d={`M${arcX1.toFixed(2)},${arcY1.toFixed(2)} A${gaugeR},${gaugeR} 0 1,1 ${gaugeTrackX2.toFixed(2)},${gaugeTrackY2.toFixed(2)}`}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"
            />
            {animStep > 0 && (
              <path
                d={`M${arcX1.toFixed(2)},${arcY1.toFixed(2)} A${gaugeR},${gaugeR} 0 ${largeArc},1 ${arcX2.toFixed(2)},${arcY2.toFixed(2)}`}
                fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round"
              />
            )}
            <circle cx={arcX2.toFixed(2)} cy={arcY2.toFixed(2)} r="5" fill={durColor} />
            <text x="60" y="60" textAnchor="middle" fill={durColor} fontSize="14" fontWeight="800">
              {(durability * animStep).toFixed(animStep >= 1 ? 1 : 0)}%
            </text>
            <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="600" letterSpacing="1">
              DURABILITY
            </text>
          </svg>
        </div>

        {/* Sparkline */}
        <div className="adv-panel sparkline-panel">
          <div className="adv-panel-title">
            <TrendUpIcon size={14} color="#38bdf8" />
            <span>Durability Trend (Live Telemetry)</span>
          </div>
          <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="sparkline-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={sparkFill} fill="url(#sparkFillGrad)" />
            <path d={sparkPath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {sparkPoints.map((v, i) => (
              <circle
                key={i}
                cx={(i * sparkXStep).toFixed(1)}
                cy={toY(v).toFixed(1)}
                r={hoveredSparkIdx === i ? 4 : 2}
                fill={hoveredSparkIdx === i ? '#fff' : '#38bdf8'}
                opacity={hoveredSparkIdx === i ? 1 : 0.5}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredSparkIdx(i)}
                onMouseLeave={() => setHoveredSparkIdx(null)}
              />
            ))}
            {hoveredSparkIdx !== null && (
              <text
                x={(hoveredSparkIdx * sparkXStep).toFixed(1)}
                y={Math.max(12, toY(sparkPoints[hoveredSparkIdx]) - 6)}
                textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700"
              >
                {sparkPoints[hoveredSparkIdx].toFixed(1)}%
              </text>
            )}
          </svg>
          <div className="sparkline-labels"><span>-20s</span><span>Now</span></div>
        </div>
      </div>

      {/* Node Health Bar Chart */}
      <div className="adv-panel bar-chart-panel">
        <div className="adv-panel-title">
          <BarChartIcon size={14} color="#818cf8" />
          <span>Node Health Score (AI Anomaly Model)</span>
        </div>
        <div className="bar-chart-scroll">
          <svg viewBox={`0 0 ${Math.max(350, nodes.length * barGap + 20)} 120`} className="bar-chart-svg">
            <defs>
              {nodes.map((node, i) => {
                const { bar } = barColors(node);
                return (
                  <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bar} stopOpacity="1" />
                    <stop offset="100%" stopColor={bar} stopOpacity="0.4" />
                  </linearGradient>
                );
              })}
            </defs>
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1="0" y1={(100 - v) * 0.85 + 10} x2={Math.max(350, nodes.length * barGap + 20)} y2={(100 - v) * 0.85 + 10} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="2" y={(100 - v) * 0.85 + 9} fill="#334155" fontSize="7">{v}</text>
              </g>
            ))}
            {nodes.map((node, i) => {
              const score = getHealthScore(node);
              const barH = score * 0.85 * animStep;
              const barX = i * barGap + 20;
              const barY = 95 - barH;
              const { glow } = barColors(node);
              const isHovered = hoveredBar === i;
              return (
                <g key={node.node_id} onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} style={{ cursor: 'pointer' }}>
                  {isHovered && <rect x={barX - 3} y={barY - 3} width={barW + 6} height={barH + 6} rx="5" fill={glow} />}
                  <rect x={barX} y={barY} width={barW} height={Math.max(2, barH)} rx="4" fill={`url(#barGrad${i})`} />
                  {animStep > 0.8 && <text x={barX + barW / 2} y={barY - 3} textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="700">{score}</text>}
                  <text x={barX + barW / 2} y={108} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="600">{node.node_id.split('-')[1] || node.node_id}</text>
                  {isHovered && (
                    <g>
                      <rect x={Math.max(2, barX - 20)} y={barY - 30} width="68" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                      <text x={Math.max(36, barX + 14)} y={barY - 15} textAnchor="middle" fill="#e2e8f0" fontSize="8">{node.node_id}: {score}/100</text>
                    </g>
                  )}
                </g>
              );
            })}
            <line x1="0" y1="95" x2={Math.max(350, nodes.length * barGap + 20)} y2="95" stroke="#1e293b" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Storage Distribution */}
      <div className="adv-panel storage-chart-panel">
        <div className="adv-panel-title">
          <NetworkIcon size={14} color="#c084fc" />
          <span>Storage Distribution per Node (MB)</span>
        </div>
        <div className="storage-chart-rows">
          {nodes.map((node) => {
            const pct = ((node.storage_used_mb || 0) / maxStorage) * 100 * animStep;
            const col = node.is_alive ? (node.failed_replicas > 0 ? '#f59e0b' : '#818cf8') : '#ef4444';
            return (
              <div key={node.node_id} className="storage-chart-row">
                <span className="scr-label">{node.node_id}</span>
                <div className="scr-bar-track">
                  <div className="scr-bar-fill" style={{ width: `${pct}%`, background: col, boxShadow: `0 0 8px ${col}60` }} />
                </div>
                <span className="scr-value" style={{ color: col }}>{(node.storage_used_mb || 0).toFixed(1)} MB</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="adv-panel recs-panel">
        <div className="adv-panel-title">
          <SparklesIcon size={14} color="#f59e0b" />
          <span>AI Cluster Recommendations</span>
        </div>
        <ul className="recs-list">
          {auditResult?.recommendations?.map((rec, i) => (
            <li key={i} className="recs-item">
              <span className="recs-dot" style={{ background: i === 0 ? '#10b981' : i === 1 ? '#38bdf8' : '#a855f7' }} />
              {rec}
            </li>
          )) || (
            <>
              <li className="recs-item"><span className="recs-dot" style={{ background: '#10b981' }} />All {nodes.length} nodes reporting nominal checksums — 3x replication active.</li>
              <li className="recs-item"><span className="recs-dot" style={{ background: '#38bdf8' }} />System durability at {durability.toFixed(1)}% — within SLA thresholds.</li>
              <li className="recs-item"><span className="recs-dot" style={{ background: '#818cf8' }} />Auto-healing daemon is continuously monitoring for bit-rot corruption.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

function AICopilot({ engine, status, onActionTriggered }) {
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('copilot'); // 'copilot' | 'audit' | 'groq'
  
  // Groq Interactive Chat State
  const [groqQuestion, setGroqQuestion] = useState('');
  const [groqAnswer, setGroqAnswer] = useState(
    'Welcome! I am BitFortress AI connected via Groq Cloud. Ask me anything about node health, replication policies, quorum, or disaster recovery!'
  );
  const [groqAsking, setGroqAsking] = useState(false);

  const handleAutoHeal = () => {
    setLoading(true);
    const res = engine.repairCluster();
    if (onActionTriggered) onActionTriggered(`AI Autonomous Repair Executed: Healed ${res.repaired_replicas || 0} replicas`);
    setLoading(false);
  };

  const handleSimulateOutage = () => {
    setLoading(true);
    const alive = status.nodes.filter(n => n.is_alive);
    if (alive.length > 2) {
      const shuffled = [...alive].sort(() => 0.5 - Math.random());
      engine.failNode(shuffled[0].node_id);
      engine.failNode(shuffled[1].node_id);
      if (onActionTriggered) onActionTriggered(`AI Chaos Injected: Took down ${shuffled[0].node_id} & ${shuffled[1].node_id}`);
    }
    setLoading(false);
  };

  const handleInjectBitRot = () => {
    setLoading(true);
    const alive = status.nodes.filter(n => n.is_alive);
    if (alive.length > 0) {
      const target = alive[Math.floor(Math.random() * alive.length)];
      engine.corruptData(target.node_id);
      if (onActionTriggered) onActionTriggered(`Bit-rot injected into ${target.node_id}. Checksum flagged.`);
    }
    setLoading(false);
  };

  const handleRunAudit = () => {
    const audit = engine.getAIAudit();
    setAuditResult(audit);
    setActiveTab('audit');
  };

  const handleToggleAutoHeal = () => {
    const newState = engine.toggleAutoHealing();
    if (onActionTriggered) onActionTriggered(`AI Auto-Healing continuous guard: ${newState ? 'ENABLED' : 'PAUSED'}`);
  };

  const handleAskGroq = async (prompt) => {
    const query = prompt || groqQuestion;
    if (!query.trim()) return;
    setGroqAsking(true);
    try {
      const response = await queryGroqCopilot(query, status);
      setGroqAnswer(response);
    } catch (err) {
      setGroqAnswer(`Groq AI query error: ${err.message}`);
    } finally {
      setGroqAsking(false);
    }
  };

  const durability = status.durability_percentage || 100;
  const isOptimal = durability >= 99.5 && status.failed_nodes === 0;

  return (
    <div className="ai-copilot-card">
      <div className="ai-header">
        <div className="ai-brand">
          <div className="ai-assistant-logo-orb">
            <FortressShieldLogo size={36} className="ai-core-logo" />
            <span className="logo-orb-ping"></span>
          </div>
          <div className="ai-title-block">
            <h3>BitFortress AI Resilience Copilot</h3>
            <span className="ai-subtitle">Autonomous Parity Intelligence • Powered by Groq Cloud LLM</span>
          </div>
        </div>
        <div className="ai-header-controls">
          <button 
            className={`ai-pill-btn ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <ZapIcon size={13} />
            <span>Copilot</span>
          </button>
          <button 
            className={`ai-pill-btn ${activeTab === 'groq' ? 'active' : ''}`}
            onClick={() => setActiveTab('groq')}
          >
            <SparklesIcon size={13} color="#38bdf8" />
            <span>Groq AI Chat</span>
          </button>
          <button 
            className={`ai-pill-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={handleRunAudit}
          >
            <BarChartIcon size={13} />
            <span>Diagnostics</span>
          </button>
        </div>
      </div>

      {activeTab === 'copilot' ? (
        <div className="ai-body">
          {/* Real-time Health Radar */}
          <div className="ai-radar-section">
            <div className={`ai-status-indicator ${isOptimal ? 'optimal' : 'action-needed'}`}>
              <div className="status-pulse-ring"></div>
              <ActivityIcon size={14} className="radar-icon" />
              <span className="status-text">
                {isOptimal ? 'SYSTEM HEALTH: OPTIMAL (100% DURABILITY)' : 'SYSTEM HEALTH: ATTENTION REQUIRED'}
              </span>
            </div>
            <div className="ai-guard-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={status.auto_healing !== false} 
                  onChange={handleToggleAutoHeal} 
                />
                <span className="toggle-slider round"></span>
              </label>
              <span className="toggle-label">Auto-Healing Guard</span>
            </div>
          </div>

          {/* Quick AI Scenario Action Buttons */}
          <div className="ai-actions-grid">
            <button 
              className="ai-btn ai-btn-heal" 
              onClick={handleAutoHeal} 
              disabled={loading}
              title="Detect degraded replicas and synthesize fresh copies"
            >
              <div className="btn-icon">
                <ShieldCheckIcon size={22} color="#10b981" />
              </div>
              <div className="btn-text">
                <strong>Autonomous Self-Heal</strong>
                <small>Restore degraded replicas to 100%</small>
              </div>
            </button>

            <button 
              className="ai-btn ai-btn-chaos" 
              onClick={handleSimulateOutage} 
              disabled={loading}
              title="Test fault tolerance by dropping 2 nodes simultaneously"
            >
              <div className="btn-icon">
                <ZapIcon size={22} color="#ef4444" />
              </div>
              <div className="btn-text">
                <strong>Simulate Chaos Outage</strong>
                <small>Drop 2 random nodes at once</small>
              </div>
            </button>

            <button 
              className="ai-btn ai-btn-bitrot" 
              onClick={handleInjectBitRot} 
              disabled={loading}
              title="Flip bytes silently to test checksum detection"
            >
              <div className="btn-icon">
                <BugIcon size={22} color="#f59e0b" />
              </div>
              <div className="btn-text">
                <strong>Inject Silent Bit-Rot</strong>
                <small>Test checksum & integrity verification</small>
              </div>
            </button>

            <button 
              className="ai-btn ai-btn-rebalance" 
              onClick={() => {
                engine.rebalanceData();
                if (onActionTriggered) onActionTriggered('AI Load Balancer re-distributed replicas evenly');
              }} 
              disabled={loading}
            >
              <div className="btn-icon">
                <ScaleIcon size={22} color="#38bdf8" />
              </div>
              <div className="btn-text">
                <strong>Optimal Rebalance</strong>
                <small>Uniform replica spread across racks</small>
              </div>
            </button>
          </div>

          {/* Live AI Insight */}
          <div className="ai-insight-box">
            <span className="insight-badge">
              <SparklesIcon size={11} color="#818cf8" />
              <span>AI INSIGHT</span>
            </span>
            <p>
              {status.failed_nodes > 0 
                ? `Detection: ${status.failed_nodes} storage node(s) down. Multi-rack replication is protecting data integrity. Trigger Self-Heal to redistribute missing copies.`
                : durability < 100
                ? 'Detection: Corrupted checksum found in node replica. Bit-rot parity repair recommended immediately.'
                : 'All 9 nodes report nominal checksums. 3x replication factor provides N-2 survivability with zero data loss.'}
            </p>
          </div>
        </div>
      ) : activeTab === 'groq' ? (
        <div className="ai-groq-view">
          <div className="groq-banner">
            <div className="groq-badge">
              <SparklesIcon size={13} color="#00f2fe" />
              <span>GROQ CLOUD LLM ACTIVE (QWEN-3.8-27B)</span>
            </div>
            <span className="groq-meta">Live Cluster Telemetry Connected</span>
          </div>

          {/* Quick Questions Chips — SVG icons, no emojis */}
          <div className="groq-chips">
            <span className="chips-label">Quick Prompts:</span>
            <button 
              className="chip-btn"
              onClick={() => {
                setGroqQuestion('Analyze current cluster health, node failure count, and durability SLA status.');
                handleAskGroq('Analyze current cluster health, node failure count, and durability SLA status.');
              }}
            >
              <SearchIcon size={13} color="#38bdf8" />
              <span>Cluster Health Audit</span>
            </button>
            <button 
              className="chip-btn"
              onClick={() => {
                setGroqQuestion('What are the risks if 2 nodes fail simultaneously in this 3x replication cluster?');
                handleAskGroq('What are the risks if 2 nodes fail simultaneously in this 3x replication cluster?');
              }}
            >
              <TriangleDangerIcon size={13} color="#f59e0b" />
              <span>Dual-Node Failure Risk</span>
            </button>
            <button 
              className="chip-btn"
              onClick={() => {
                setGroqQuestion('How does BitFortress autonomous parity self-healing prevent data loss?');
                handleAskGroq('How does BitFortress autonomous parity self-healing prevent data loss?');
              }}
            >
              <ShieldCheckIcon size={13} color="#10b981" />
              <span>Self-Healing Mechanism</span>
            </button>
          </div>

          {/* Response Box */}
          <div className="groq-chat-box">
            <div className="groq-chat-header">
              <div className="chat-avatar">
                <FortressShieldLogo size={24} className={`assistant-avatar-logo ${groqAsking ? 'pulsing-assistant' : ''}`} />
                <span className="assistant-name">BitFortress AI Assistant (Groq Cloud)</span>
              </div>
              {groqAsking && <span className="groq-thinking">Groq is generating response...</span>}
            </div>
            <div className="groq-chat-content">
              {groqAnswer}
            </div>
          </div>

          {/* Prompt Bar Form */}
          <form 
            className="groq-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAskGroq();
            }}
          >
            <input 
              type="text"
              value={groqQuestion}
              onChange={(e) => setGroqQuestion(e.target.value)}
              placeholder="Ask Groq AI about storage nodes, parity calculations, or fault recovery..."
              disabled={groqAsking}
              className="groq-input"
            />
            <button 
              type="submit" 
              className="btn btn-primary groq-send-btn"
              disabled={groqAsking || !groqQuestion.trim()}
            >
              <SparklesIcon size={14} />
              <span>{groqAsking ? 'Querying...' : 'Ask Groq'}</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="ai-audit-view">
          <div className="audit-header">
            <div className="audit-header-title">
              <BarChartIcon size={18} color="#818cf8" />
              <h4>Advanced Cluster Diagnostics &amp; Analytics</h4>
            </div>
            <span className="audit-timestamp">{auditResult?.timestamp || new Date().toLocaleTimeString()}</span>
          </div>

          <AdvancedDiagnosticsGraph status={status} auditResult={auditResult} />

          <div className="audit-actions">
            <button className="btn btn-primary" onClick={handleAutoHeal}>
              <ShieldCheckIcon size={16} />
              <span>Apply AI Recommended Repairs</span>
            </button>
            <button className="btn btn-outline" onClick={() => setActiveTab('copilot')}>
              Back to Copilot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AICopilot;
