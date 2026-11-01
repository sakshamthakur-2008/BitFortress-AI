/**
 * BitFortress - Groq Cloud LLM Integration
 * Provides real-time AI node diagnostics, failure risk analysis,
 * and conversational storage reliability assistant powered by Groq.
 */

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
if (!GROQ_API_KEY) {
  console.warn('[BitFortress] REACT_APP_GROQ_API_KEY is not set. Copy frontend/.env.example to frontend/.env and add your key.');
}
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Primary high-speed model with fallback
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL = 'openai/gpt-oss-120b';

async function callGroqAPI(messages, maxTokens = 250, temperature = 0.4) {
  const tryModel = async (model) => {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API (${model}) failed [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  };

  try {
    return await tryModel(PRIMARY_MODEL);
  } catch (err) {
    console.warn(`Primary Groq model failed, trying fallback: ${err.message}`);
    return await tryModel(FALLBACK_MODEL);
  }
}

/**
 * Perform deep AI diagnosis on an individual storage node using Groq LLM
 */
export async function diagnoseNodeWithGroq(node, clusterStatus = {}) {
  const nodeContext = `
Node ID: ${node.node_id}
Status: ${node.is_alive ? 'ONLINE (ALIVE)' : 'CRITICAL (OFFLINE/DEAD)'}
Rack Domain: ${node.rack || 'Rack-1'}
Port: ${node.port}
Stored Replicas: ${node.objects_stored}
Corrupted/Bit-Rot Replicas: ${node.failed_replicas}
Storage Allocated: ${node.storage_used_mb} MB
AI Anomaly Score: ${(node.anomaly_score * 100).toFixed(0)}%
Risk Level: ${node.risk_level || 'LOW'}
Cluster Durability: ${clusterStatus.durability_percentage?.toFixed(1) || 100}%
Total Offline Nodes in Cluster: ${clusterStatus.failed_nodes || 0}
`;

  const messages = [
    {
      role: 'system',
      content: `You are BitFortress Groq AI, an expert systems architect for fault-tolerant distributed object storage.
Analyze the provided node telemetry and return a concise, high-impact assessment (max 3 bullet points):
1. Node Health & Parity Status
2. Risk Assessment (data loss risk, quorum exposure, bit-rot impact)
3. Immediate Action Recommendation (e.g. Rebalance, Parity Rebuild, Quarantine, or Nominal operation)
Keep it concise, professional, and clear.`
    },
    {
      role: 'user',
      content: `Diagnose this storage node now:\n${nodeContext}`
    }
  ];

  try {
    return await callGroqAPI(messages, 200, 0.3);
  } catch (error) {
    console.error('Groq node diagnosis error:', error);
    return `Analysis unavailable: ${error.message}`;
  }
}

/**
 * Ask the BitFortress AI Copilot any question using Groq LLM with live cluster context
 */
export async function queryGroqCopilot(userQuery, clusterStatus) {
  const statusSummary = `
- Total Nodes: ${clusterStatus.total_nodes} (${clusterStatus.alive_nodes} online, ${clusterStatus.failed_nodes} failed)
- System Durability: ${clusterStatus.durability_percentage?.toFixed(2)}%
- Replication Factor: ${clusterStatus.replication_factor}x
- Total Objects: ${clusterStatus.total_objects}
- Total Storage Used: ${clusterStatus.total_data_mb?.toFixed(2)} MB
- Nodes Breakdown:
${(clusterStatus.nodes || []).map(n => `  * ${n.node_id}: ${n.is_alive ? 'ONLINE' : 'DEAD'}, ${n.objects_stored} replicas, ${n.failed_replicas} corrupted, risk ${n.risk_level}`).join('\n')}
`;

  const messages = [
    {
      role: 'system',
      content: `You are BitFortress Groq AI Copilot. You monitor a real-time fault-tolerant distributed storage cluster.
Here is the current live cluster state:
${statusSummary}

Answer the user's inquiry concisely, technically accurate, and formatted with clean bullet points. Focus on data safety, replication policies, and remediation.`
    },
    {
      role: 'user',
      content: userQuery
    }
  ];

  try {
    return await callGroqAPI(messages, 300, 0.4);
  } catch (error) {
    console.error('Groq Copilot query error:', error);
    return `AI Assistant query error: ${error.message}`;
  }
}

const groqService = {
  diagnoseNodeWithGroq,
  queryGroqCopilot
};

export default groqService;
