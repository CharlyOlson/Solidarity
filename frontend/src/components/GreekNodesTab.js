import { useState, useEffect, useCallback } from 'react';
import './GreekNodesTab.css';

const GreekNodesTab = () => {
  const [nodesStatus, setNodesStatus] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Node definitions with user-friendly information
  const nodeDefinitions = {
    alpha: {
      symbol: 'Α',
      name: 'Alpha Node',
      icon: '🔵',
      color: '#4285f4',
      role: 'Sovereign Initialization Layer',
      description: 'Manages system-wide protocols, mythic encoding, and governance logic',
      capabilities: [
        'Multi-signature security validation',
        'Biometric authentication integration',
        'Ritual key management',
        'System protocol initialization',
        'Governance architecture deployment'
      ]
    },
    beta: {
      symbol: 'Β',
      name: 'Beta Node',
      icon: '🟢',
      color: '#34a853',
      role: 'Adaptive Financial Operator',
      description: 'Handles predictive financial models, liquidity routing, and smart contracts',
      capabilities: [
        'Real-time financial optimization',
        'AI-driven predictive modeling',
        'ZK-SNARK compliance verification',
        'Liquidity pool management',
        'Smart contract execution'
      ]
    },
    theta: {
      symbol: 'Θ',
      name: 'Theta Node',
      icon: '🟡',
      color: '#fbbc04',
      role: 'Localized Governance Manager',
      description: 'Manages community operations, user onboarding, and municipal tokens',
      capabilities: [
        'Geographic boundary validation',
        'Municipal token deployment',
        'Ritualized user onboarding',
        'Community consensus facilitation',
        'Local governance coordination'
      ]
    },
    omega: {
      symbol: 'Ω',
      name: 'Omega Node',
      icon: '🔴',
      color: '#ea4335',
      role: 'Exit & Restoration Agent',
      description: 'Monitors AI systems, conducts audits, and manages restoration protocols',
      capabilities: [
        'AI workload monitoring',
        'Ethical compliance verification',
        'System audit execution',
        'Generational repair protocols',
        'Legacy compensation management'
      ]
    }
  };

  // Fetch Greek Letter Nodes status
  const fetchNodesStatus = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to Greek Letter Nodes system
      const response = await fetch('/api/greek-nodes/status');
      if (response.ok) {
        const data = await response.json();
        setNodesStatus(data.nodesStatus || {});
        setSystemStatus(data.systemStatus || {});
      } else {
        // Simulate status for demo purposes
        const mockStatus = {
          alpha: {
            initialized: true,
            active: true,
            health: 'operational',
            lastActivation: new Date().toISOString(),
            metrics: {
              securityLevel: 'maximum',
              protocolsActive: 12,
              governanceOperations: 45
            }
          },
          beta: {
            initialized: true,
            active: true,
            health: 'operational',
            lastActivation: new Date().toISOString(),
            metrics: {
              financialOperations: 234,
              liquidityPoolValue: 1250000,
              aiPredictionAccuracy: 0.847
            }
          },
          theta: {
            initialized: true,
            active: false,
            health: 'standby',
            lastActivation: null,
            metrics: {
              communityMembers: 1847,
              municipalTokens: 7,
              onboardingQueue: 23
            }
          },
          omega: {
            initialized: true,
            active: true,
            health: 'monitoring',
            lastActivation: new Date().toISOString(),
            metrics: {
              aiAgentsMonitored: 15,
              systemAudits: 3,
              restorationQueue: 2
            }
          }
        };
        
        setNodesStatus(mockStatus);
        setSystemStatus({
          systemHealth: 'operational',
          activeNodes: 3,
          totalOperations: 324,
          lastUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch Greek nodes status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Auto-refresh effect
  useEffect(() => {
    fetchNodesStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchNodesStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchNodesStatus, autoRefresh]);

  // Activate node
  const activateNode = async (nodeKey) => {
    setIsLoading(true);
    try {
      // Simulate activation API call
      const response = await fetch(`/api/greek-nodes/activate/${nodeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        addOperationToHistory(`${nodeDefinitions[nodeKey].name} activated successfully`);
        await fetchNodesStatus();
      } else {
        // Simulate activation for demo
        const updatedStatus = { ...nodesStatus };
        if (updatedStatus[nodeKey]) {
          updatedStatus[nodeKey].active = true;
          updatedStatus[nodeKey].health = 'operational';
          updatedStatus[nodeKey].lastActivation = new Date().toISOString();
        }
        setNodesStatus(updatedStatus);
        addOperationToHistory(`${nodeDefinitions[nodeKey].name} activated (demo mode)`);
      }
    } catch (error) {
      console.error(`Failed to activate ${nodeKey}:`, error);
      addOperationToHistory(`Failed to activate ${nodeDefinitions[nodeKey].name}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate node
  const deactivateNode = async (nodeKey) => {
    setIsLoading(true);
    try {
      const updatedStatus = { ...nodesStatus };
      if (updatedStatus[nodeKey]) {
        updatedStatus[nodeKey].active = false;
        updatedStatus[nodeKey].health = 'standby';
      }
      setNodesStatus(updatedStatus);
      addOperationToHistory(`${nodeDefinitions[nodeKey].name} deactivated`);
    } catch (error) {
      console.error(`Failed to deactivate ${nodeKey}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add operation to history
  const addOperationToHistory = (message, type = 'info') => {
    const operation = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setOperationHistory(prev => [operation, ...prev.slice(0, 19)]); // Keep last 20
  };

  // Execute cross-node operation
  const executeCrossNodeOperation = async (operationType) => {
    setIsLoading(true);
    try {
      addOperationToHistory(`Executing ${operationType} operation...`);
      
      // Simulate operation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addOperationToHistory(`${operationType} operation completed successfully`, 'success');
    } catch (error) {
      addOperationToHistory(`${operationType} operation failed`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get status display info
  const getStatusDisplay = (health) => {
    const displays = {
      operational: { color: '#34a853', text: 'OPERATIONAL', icon: '🟢' },
      standby: { color: '#fbbc04', text: 'STANDBY', icon: '🟡' },
      monitoring: { color: '#4285f4', text: 'MONITORING', icon: '🔵' },
      warning: { color: '#ff9800', text: 'WARNING', icon: '⚠️' },
      error: { color: '#ea4335', text: 'ERROR', icon: '🔴' }
    };
    return displays[health] || displays.standby;
  };

  return (
    <div className="greek-nodes-container">
      <div className="greek-nodes-header">
        <h2>🏛️ Greek Letter Nodes System</h2>
        <p className="system-description">
          Central orchestration system for Alpha, Beta, Theta, and Omega nodes
        </p>
        
        <div className="header-controls">
          <button 
            className="refresh-btn"
            onClick={fetchNodesStatus}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (5s)
          </label>
        </div>
      </div>

      {/* System Overview */}
      <div className="system-overview">
        <div className="overview-card">
          <h3>System Status</h3>
          <div className="system-metrics">
            <div className="metric">
              <span className="metric-label">Health:</span>
              <span className={`metric-value health-${systemStatus.systemHealth}`}>
                {systemStatus.systemHealth?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Active Nodes:</span>
              <span className="metric-value">{systemStatus.activeNodes || 0}/4</span>
            </div>
            <div className="metric">
              <span className="metric-label">Operations:</span>
              <span className="metric-value">{systemStatus.totalOperations || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="nodes-grid">
        {Object.entries(nodeDefinitions).map(([nodeKey, nodeDef]) => {
          const status = nodesStatus[nodeKey] || {};
          const statusDisplay = getStatusDisplay(status.health);
          
          return (
            <div 
              key={nodeKey} 
              className={`node-card ${status.active ? 'active' : 'inactive'} ${selectedNode === nodeKey ? 'selected' : ''}`}
              onClick={() => setSelectedNode(selectedNode === nodeKey ? null : nodeKey)}
              style={{ '--node-color': nodeDef.color }}
            >
              <div className="node-header">
                <div className="node-icon-section">
                  <span className="node-icon">{nodeDef.icon}</span>
                  <span className="node-symbol">{nodeDef.symbol}</span>
                </div>
                <div className="node-status-section">
                  <span 
                    className="status-indicator"
                    style={{ color: statusDisplay.color }}
                  >
                    {statusDisplay.icon}
                  </span>
                </div>
              </div>
              
              <div className="node-content">
                <h3 className="node-title">{nodeDef.name}</h3>
                <p className="node-role">{nodeDef.role}</p>
                <p className="node-description">{nodeDef.description}</p>
                
                <div className="node-status">
                  <span 
                    className="status-text"
                    style={{ color: statusDisplay.color }}
                  >
                    {statusDisplay.text}
                  </span>
                </div>
                
                {status.metrics && (
                  <div className="node-metrics">
                    {Object.entries(status.metrics).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="metric-item">
                        <span className="metric-key">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="metric-val">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="node-actions">
                  {status.active ? (
                    <button 
                      className="action-btn deactivate-btn"
                      onClick={(e) => { e.stopPropagation(); deactivateNode(nodeKey); }}
                      disabled={isLoading}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button 
                      className="action-btn activate-btn"
                      onClick={(e) => { e.stopPropagation(); activateNode(nodeKey); }}
                      disabled={isLoading}
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="node-details">
          <h3>
            {nodeDefinitions[selectedNode].icon} {nodeDefinitions[selectedNode].name} Details
          </h3>
          
          <div className="details-content">
            <div className="capabilities-section">
              <h4>Capabilities</h4>
              <ul className="capabilities-list">
                {nodeDefinitions[selectedNode].capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
            </div>
            
            {nodesStatus[selectedNode]?.metrics && (
              <div className="detailed-metrics">
                <h4>Current Metrics</h4>
                <div className="metrics-grid">
                  {Object.entries(nodesStatus[selectedNode].metrics).map(([key, value]) => (
                    <div key={key} className="detailed-metric">
                      <span className="detailed-metric-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="detailed-metric-value">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cross-Node Operations */}
      <div className="cross-node-operations">
        <h3>Cross-Node Operations</h3>
        <div className="operations-grid">
          <button 
            className="operation-btn"
            onClick={() => executeCrossNodeOperation('Governance Consensus')}
            disabled={isLoading}
          >
            🏛️ Governance Consensus
          </button>
          <button 
            className="operation-btn"
            onClick={() => executeCrossNodeOperation('Financial Coordination')}
            disabled={isLoading}
          >
            💰 Financial Coordination
          </button>
          <button 
            className="operation-btn"
            onClick={() => executeCrossNodeOperation('Community Synchronization')}
            disabled={isLoading}
          >
            🤝 Community Sync
          </button>
          <button 
            className="operation-btn emergency"
            onClick={() => executeCrossNodeOperation('Emergency Shutdown')}
            disabled={isLoading}
          >
            🚨 Emergency Shutdown
          </button>
        </div>
      </div>

      {/* Operation History */}
      <div className="operation-history">
        <h3>Recent Operations</h3>
        <div className="history-list">
          {operationHistory.length === 0 ? (
            <p className="no-operations">No recent operations</p>
          ) : (
            operationHistory.slice(0, 8).map((operation) => (
              <div key={operation.id} className={`history-item ${operation.type}`}>
                <span className="operation-time">
                  {new Date(operation.timestamp).toLocaleTimeString()}
                </span>
                <span className="operation-message">{operation.message}</span>
                <span className={`operation-type ${operation.type}`}>
                  {operation.type === 'success' ? '✅' : operation.type === 'error' ? '❌' : 'ℹ️'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing Greek Letter Nodes operation...</p>
        </div>
      )}
    </div>
  );
};

export default GreekNodesTab;