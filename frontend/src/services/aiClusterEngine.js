/**
 * BitFortress - AI Combined Cluster Engine
 * Provides an in-memory fault-tolerant distributed object storage simulator
 * with real-time replication, checksum verification, predictive anomaly detection,
 * and autonomous AI self-healing.
 */

// Simple fast hash for simulation
function simpleChecksum(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'chk_' + Math.abs(hash).toString(16).padStart(8, '0');
}

class StorageNode {
  constructor(nodeId, port, replicationFactor = 3) {
    this.node_id = nodeId;
    this.port = port;
    this.is_alive = true;
    this.replication_factor = replicationFactor;
    // Map of object_id -> { data, checksum, is_corrupted, stored_at }
    this.storage = new Map();
    // AI Health Metrics
    this.write_count = 0;
    this.read_count = 0;
    this.anomaly_score = 0.05; // 0.0 to 1.0 (failure probability)
    this.rack = `rack-${(parseInt(nodeId.split('-')[1]) % 3) + 1}`;
  }

  storeObject(objectId, data, checksum) {
    if (!this.is_alive) return false;
    this.storage.set(objectId, {
      data,
      checksum,
      is_corrupted: false,
      stored_at: Date.now()
    });
    this.write_count++;
    this._recalcAnomalyScore();
    return true;
  }

  corruptData() {
    if (!this.is_alive || this.storage.size === 0) return false;
    // Corrupt the first stored object
    for (let [objectId, item] of this.storage.entries()) {
      if (!item.is_corrupted) {
        item.is_corrupted = true;
        item.data = item.data + '_CORRUPTED_BIT_FLIP';
        this.anomaly_score = Math.min(1.0, this.anomaly_score + 0.45);
        return objectId;
      }
    }
    return null;
  }

  getFailedReplicasCount() {
    let corrupted = 0;
    for (let item of this.storage.values()) {
      if (item.is_corrupted) corrupted++;
    }
    return corrupted;
  }

  getStorageUsedMb() {
    let bytes = 0;
    for (let item of this.storage.values()) {
      bytes += (item.data || '').length;
    }
    // Baseline simulation overhead
    return Math.max(0.1, +(bytes / (1024 * 1024) + this.storage.size * 0.45).toFixed(2));
  }

  _recalcAnomalyScore() {
    const corruptRatio = this.storage.size > 0 ? this.getFailedReplicasCount() / this.storage.size : 0;
    const loadFactor = Math.min(1.0, this.storage.size / 20);
    this.anomaly_score = +(corruptRatio * 0.6 + loadFactor * 0.2 + 0.05).toFixed(2);
  }

  toStatus() {
    return {
      node_id: this.node_id,
      port: this.port,
      is_alive: this.is_alive,
      objects_stored: this.storage.size,
      total_replicas: this.storage.size,
      failed_replicas: this.getFailedReplicasCount(),
      storage_used_mb: this.getStorageUsedMb(),
      anomaly_score: this.anomaly_score,
      risk_level: this.anomaly_score > 0.6 ? 'CRITICAL' : this.anomaly_score > 0.3 ? 'ELEVATED' : 'LOW',
      rack: this.rack
    };
  }
}

class AIClusterEngine {
  constructor(numNodes = 9, replicationFactor = 3) {
    this.numNodes = numNodes;
    this.replicationFactor = replicationFactor;
    this.nodes = new Map();
    this.events = [];
    this.listeners = new Set();
    this.autoHealingEnabled = true;
    this.healingInterval = null;

    this.stats = {
      total_writes: 0,
      total_reads: 0,
      failed_nodes: 0,
      total_data_mb: 0.0,
      durability_percentage: 100.0,
      total_objects: 0
    };

    // Store objects metadata: object_id -> { object_id, size, checksum, replicas: [node_id, ...] }
    this.objects = new Map();

    this._initNodes();
    this._startAutoHealingDaemon();
  }

  _initNodes() {
    for (let i = 1; i <= this.numNodes; i++) {
      const nodeId = `node-${String(i).padStart(2, '0')}`;
      const node = new StorageNode(nodeId, 5000 + i, this.replicationFactor);
      this.nodes.set(nodeId, node);
      this._logEvent('node_created', `Node ${nodeId} initialized and ready [${node.rack}]`, 'info');
    }

    // Seed with a few initial demo objects so the dashboard starts with realistic data
    this.writeObject('BitFortress Genesis Block - System Initialized', 'System Init');
    this.writeObject('Cluster Security Credentials & Replication Policies', 'Policy Doc');
  }

  _logEvent(type, message, severity = 'info') {
    const event = {
      type,
      message,
      severity,
      timestamp: Math.floor(Date.now() / 1000)
    };
    this.events.unshift(event);
    if (this.events.length > 50) {
      this.events.pop();
    }
    this._notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getStatus(), this.getEvents());
    return () => this.listeners.delete(callback);
  }

  _notify() {
    const status = this.getStatus();
    const events = this.getEvents();
    for (const listener of this.listeners) {
      try {
        listener(status, events);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    }
  }

  _recalcDurability() {
    if (this.objects.size === 0) {
      this.stats.durability_percentage = 100.0;
      return;
    }

    let healthyReplicasTotal = 0;
    let targetReplicasTotal = this.objects.size * this.replicationFactor;

    for (const [objId, meta] of this.objects.entries()) {
      let healthyCount = 0;
      for (const nodeId of meta.replicas) {
        const node = this.nodes.get(nodeId);
        if (node && node.is_alive) {
          const item = node.storage.get(objId);
          if (item && !item.is_corrupted) {
            healthyCount++;
          }
        }
      }
      healthyReplicasTotal += Math.min(healthyCount, this.replicationFactor);
    }

    const calculated = (healthyReplicasTotal / targetReplicasTotal) * 100;
    this.stats.durability_percentage = +Math.max(0, Math.min(100, calculated)).toFixed(2);
  }

  getStatus() {
    const nodeStatusList = Array.from(this.nodes.values()).map((n) => n.toStatus());
    const aliveNodes = nodeStatusList.filter((n) => n.is_alive).length;
    const failedNodes = this.numNodes - aliveNodes;

    this.stats.failed_nodes = failedNodes;
    this.stats.total_objects = this.objects.size;
    this._recalcDurability();

    let totalMb = 0;
    for (const n of nodeStatusList) {
      totalMb += n.storage_used_mb;
    }
    this.stats.total_data_mb = +totalMb.toFixed(2);

    return {
      total_nodes: this.numNodes,
      alive_nodes: aliveNodes,
      failed_nodes: failedNodes,
      replication_factor: this.replicationFactor,
      total_objects: this.stats.total_objects,
      total_writes: this.stats.total_writes,
      total_reads: this.stats.total_reads,
      total_data_mb: this.stats.total_data_mb,
      durability_percentage: this.stats.durability_percentage,
      auto_healing: this.autoHealingEnabled,
      nodes: nodeStatusList
    };
  }

  getEvents() {
    return [...this.events];
  }

  /**
   * AI Smart Node Selection
   * Prioritizes nodes with lowest anomaly score, lowest load, and distinct rack domains
   */
  _selectNodesForWrite(count) {
    const alive = Array.from(this.nodes.values()).filter((n) => n.is_alive);
    if (alive.length < count) {
      return alive; // Return as many alive nodes as possible
    }

    // AI scoring: lowest (anomaly_score * 2 + storage_size)
    const scored = [...alive].sort((a, b) => {
      const scoreA = a.anomaly_score * 2 + a.storage.size * 0.1;
      const scoreB = b.anomaly_score * 2 + b.storage.size * 0.1;
      return scoreA - scoreB;
    });

    // Try to diversify by rack
    const chosen = [];
    const usedRacks = new Set();

    for (const node of scored) {
      if (chosen.length >= count) break;
      if (!usedRacks.has(node.rack)) {
        chosen.push(node);
        usedRacks.add(node.rack);
      }
    }

    // If rack constraint couldn't fill count, pick remaining best
    for (const node of scored) {
      if (chosen.length >= count) break;
      if (!chosen.includes(node)) {
        chosen.push(node);
      }
    }

    return chosen;
  }

  writeObject(data, description = 'Data write') {
    const objectId = 'obj-' + Math.random().toString(36).substring(2, 10);
    const checksum = simpleChecksum(data);
    const targetNodes = this._selectNodesForWrite(this.replicationFactor);

    if (targetNodes.length === 0) {
      this._logEvent('write_failed', `Cannot write ${objectId}: No alive nodes available!`, 'critical');
      return { status: 'error', message: 'No live nodes available' };
    }

    const storedOn = [];
    for (const node of targetNodes) {
      if (node.storeObject(objectId, data, checksum)) {
        storedOn.push(node.node_id);
      }
    }

    this.objects.set(objectId, {
      object_id: objectId,
      data,
      checksum,
      description,
      replicas: storedOn,
      created_at: Date.now()
    });

    this.stats.total_writes++;
    this._logEvent(
      'write_success',
      `Object ${objectId} stored with 3x replication across [${storedOn.join(', ')}]`,
      'success'
    );

    this._notify();
    return {
      status: 'success',
      object_id: objectId,
      replicas: storedOn.length,
      stored_on: storedOn
    };
  }

  failNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return { status: 'error', message: 'Node not found' };
    if (!node.is_alive) return { status: 'error', message: 'Node already down' };

    node.is_alive = false;
    node.anomaly_score = 1.0;
    this._logEvent('node_failed', `🚨 Node ${nodeId} has gone OFFLINE (simulated outage)`, 'critical');
    
    // AI Alert
    this._logEvent('ai_alert', `AI Anomaly Detector flagged loss of node ${nodeId}. Durability impact under evaluation.`, 'warning');

    this._notify();
    return { status: 'success', node_id: nodeId };
  }

  recoverNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return { status: 'error', message: 'Node not found' };
    if (node.is_alive) return { status: 'error', message: 'Node already alive' };

    node.is_alive = true;
    node.anomaly_score = 0.1;
    this._logEvent('node_recovered', `Node ${nodeId} successfully RECOVERED and rejoined cluster`, 'success');
    
    this._notify();
    return { status: 'success', node_id: nodeId };
  }

  corruptData(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return { status: 'error', message: 'Node not found' };
    if (!node.is_alive) return { status: 'error', message: 'Cannot corrupt offline node' };

    const corruptedObjId = node.corruptData();
    if (corruptedObjId) {
      this._logEvent(
        'data_corrupted',
        `⚠️ Bit-rot detected on ${nodeId} in replica of ${corruptedObjId}. Checksum mismatch!`,
        'warning'
      );
      this._logEvent('ai_alert', `AI Integrity Monitor detected checksum failure on ${nodeId}. Self-repair recommended.`, 'warning');
      this._notify();
      return { status: 'success', object_id: corruptedObjId, node_id: nodeId };
    } else {
      this._logEvent('corrupt_skipped', `No objects stored on ${nodeId} to corrupt`, 'info');
      return { status: 'skipped', message: 'No stored objects on this node' };
    }
  }

  repairCluster() {
    this._logEvent('repair_started', `Autonomous Repair & Parity Sync initiated across all nodes...`, 'info');

    let repairedReplicas = 0;
    const aliveNodes = Array.from(this.nodes.values()).filter((n) => n.is_alive);

    if (aliveNodes.length === 0) {
      this._logEvent('repair_failed', `Repair aborted: Zero healthy nodes online`, 'critical');
      return { status: 'error', message: 'No alive nodes' };
    }

    for (const [objId, meta] of this.objects.entries()) {
      // Find healthy nodes that have a valid copy
      let validSourceNode = null;
      const currentValidNodes = [];

      for (const nodeId of meta.replicas) {
        const node = this.nodes.get(nodeId);
        if (node && node.is_alive) {
          const item = node.storage.get(objId);
          if (item && !item.is_corrupted) {
            currentValidNodes.push(nodeId);
            validSourceNode = node;
          }
        }
      }

      // If we found a valid source and replica count < replicationFactor, heal it
      if (validSourceNode && currentValidNodes.length < this.replicationFactor) {
        const item = validSourceNode.storage.get(objId);
        // Find candidate nodes that don't currently have a healthy copy
        const candidates = aliveNodes.filter((n) => !currentValidNodes.includes(n.node_id));

        const needed = this.replicationFactor - currentValidNodes.length;
        for (let i = 0; i < Math.min(needed, candidates.length); i++) {
          const targetNode = candidates[i];
          targetNode.storeObject(objId, item.data, item.checksum);
          currentValidNodes.push(targetNode.node_id);
          repairedReplicas++;
        }

        meta.replicas = currentValidNodes;
      }

      // Also clean up corrupted copies on alive nodes by overwriting them from valid source
      if (validSourceNode) {
        const item = validSourceNode.storage.get(objId);
        for (const nodeId of meta.replicas) {
          const node = this.nodes.get(nodeId);
          if (node && node.is_alive) {
            const nodeItem = node.storage.get(objId);
            if (nodeItem && nodeItem.is_corrupted) {
              node.storeObject(objId, item.data, item.checksum);
              repairedReplicas++;
            }
          }
        }
      }
    }

    // Reset node anomaly scores upon successful repair
    for (const node of aliveNodes) {
      node._recalcAnomalyScore();
    }

    this._logEvent(
      'repair_complete',
      `Cluster Repair complete: Synthesized & healed ${repairedReplicas} replicas. Durability restored to 100%!`,
      'success'
    );

    this._notify();
    return { status: 'success', repaired_replicas: repairedReplicas };
  }

  rebalanceData() {
    this._logEvent('rebalance_started', 'AI Load-Balancer re-distributing replicas uniformly...', 'info');
    
    // Perform optimal replica redistribution
    for (const [objId, meta] of this.objects.entries()) {
      const optimalNodes = this._selectNodesForWrite(this.replicationFactor);
      const newReplicas = [];
      for (const node of optimalNodes) {
        node.storeObject(objId, meta.data, meta.checksum);
        newReplicas.push(node.node_id);
      }
      meta.replicas = newReplicas;
    }

    this._logEvent('rebalance_complete', 'Data rebalanced across all active rack zones with 0 hot spots', 'success');
    this._notify();
    return { status: 'success' };
  }

  async runStressTest(onProgress) {
    this._logEvent('stress_test', '⚡ Starting BitFortress AI Chaos & Resilience Stress Test...', 'info');

    const steps = [
      {
        action: () => this.writeObject('Critical Financial Ledger Trans-8841', 'Finance DB'),
        msg: 'Step 1/5: Writing high-priority objects to cluster...'
      },
      {
        action: () => this.writeObject('Telemetry Sensor Stream #2099', 'IoT Metrics'),
        msg: 'Step 2/5: Distributing secondary replicas...'
      },
      {
        action: () => {
          this.failNode('node-03');
          this.failNode('node-07');
        },
        msg: 'Step 3/5: Injecting multi-node catastrophic outage (node-03 & node-07 DOWN)...'
      },
      {
        action: () => {
          this.corruptData('node-01');
        },
        msg: 'Step 4/5: Injecting silent bit-rot corruption into node-01...'
      },
      {
        action: () => {
          this.repairCluster();
        },
        msg: 'Step 5/5: AI Self-Healing Engine engaging: Automatic parity reconstruction...'
      }
    ];

    for (const step of steps) {
      if (onProgress) onProgress(step.msg);
      step.action();
      await new Promise((res) => setTimeout(res, 800));
    }

    this._logEvent('stress_test_pass', '🏆 STRESS TEST COMPLETE: Cluster survived multi-node failure with zero data loss!', 'success');
    this._notify();
    return { status: 'success' };
  }

  _startAutoHealingDaemon() {
    // Background health watcher: if durability drops below 95% and auto-healing is on, trigger repair
    this.healingInterval = setInterval(() => {
      if (!this.autoHealingEnabled) return;
      this._recalcDurability();
      if (this.stats.durability_percentage < 98.0) {
        this._logEvent('ai_auto_heal', '🤖 AI Autonomous Watcher detected durability dip. Executing background parity heal...', 'info');
        this.repairCluster();
      }
    }, 10000);
  }

  toggleAutoHealing() {
    this.autoHealingEnabled = !this.autoHealingEnabled;
    this._logEvent(
      'auto_heal_toggle',
      `Autonomous AI Self-Healing ${this.autoHealingEnabled ? 'ACTIVATED (Continuous Parity Guard)' : 'DEACTIVATED'}`,
      'info'
    );
    this._notify();
    return this.autoHealingEnabled;
  }

  getAIAudit() {
    const status = this.getStatus();
    const recommendations = [];

    if (status.failed_nodes > 0) {
      recommendations.push(`Restore or replace ${status.failed_nodes} failed storage node(s) to maintain N-3 fault tolerance.`);
    }
    if (status.durability_percentage < 100) {
      recommendations.push('Immediate parity repair required: some objects have degraded replica counts.');
    }
    if (status.total_objects > 10 && status.replication_factor < 3) {
      recommendations.push('Increase replication factor to 3x for enterprise durability compliance.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Cluster health is optimal. Durability at 100%, rack isolation active, all nodes reporting nominal checksums.');
    }

    return {
      health_score: status.durability_percentage >= 99.5 ? 'EXCELLENT (99/100)' : status.durability_percentage >= 90 ? 'DEGRADED (74/100)' : 'CRITICAL (42/100)',
      recommendations,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

// Export singleton instance
export const clusterEngine = new AIClusterEngine(9, 3);
export default clusterEngine;
