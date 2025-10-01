import React, { useState, useEffect } from 'react';
import client from '../api/client';

const AudioTab = () => {
  const [audioCommands, setAudioCommands] = useState({});
  const [loadingCommands, setLoadingCommands] = useState(true);
  const [commandResult, setCommandResult] = useState(null);
  const [executingCommand, setExecutingCommand] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCommand, setSelectedCommand] = useState('');

  useEffect(() => {
    fetchAudioCommands();
  }, []);

  const fetchAudioCommands = async () => {
    setLoadingCommands(true);
    setError(null);
    
    try {
      const commands = await client.getAudioCommands();
      setAudioCommands(commands);
    } catch (err) {
      setError('Failed to load audio commands: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoadingCommands(false);
    }
  };

  const executeCommand = async (commandKey) => {
    setExecutingCommand(true);
    setCommandResult(null);
    setError(null);
    
    try {
      const result = await client.executeAudioCommand(commandKey);
      setCommandResult(result);
      setSelectedCommand(commandKey);
    } catch (err) {
      setError('Failed to execute command: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setExecutingCommand(false);
    }
  };

  const renderCommandVisual = () => {
    if (!commandResult || !commandResult.coordinates) return null;

    const { x, y, z } = commandResult.coordinates;
    
    // Calculate position for visualization (simplified for demo)
    const posX = x * 100;
    const posY = y * 100;
    const size = (z * 50) + 20;
    
    const visualStyle = {
      position: 'absolute',
      left: `${posX}%`,
      top: `${posY}%`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: `radial-gradient(circle at 40% 40%, rgba(64, 196, 255, 0.8), rgba(30, 144, 255, 0.5))`,
      boxShadow: `0 0 20px 5px rgba(30, 144, 255, 0.3)`,
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.5s ease-out'
    };

    return <div style={visualStyle}></div>;
  };

  return (
    <div className="audio-tab">
      <div className="audio-header">
        <h2>Audio Command Interface</h2>
        <p>Execute audio processing commands on the Solidarity system.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="audio-content">
        <div className="command-list">
          <h3>Available Commands</h3>
          
          {loadingCommands ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading commands...</p>
            </div>
          ) : (
            <div className="command-buttons">
              {Object.keys(audioCommands).map((key) => (
                <button
                  key={key}
                  className={`command-button ${selectedCommand === key ? 'selected' : ''}`}
                  onClick={() => executeCommand(key)}
                  disabled={executingCommand}
                >
                  <div className="command-name">{key}</div>
                  <div className="command-desc">{audioCommands[key].correction}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="command-output">
          <h3>Command Output</h3>
          
          <div className="output-visual">
            {executingCommand ? (
              <div className="processing-animation">
                <div className="pulse-ring"></div>
                <p>Processing audio command...</p>
              </div>
            ) : (
              <>
                {renderCommandVisual()}
                <div className="visualization-grid"></div>
              </>
            )}
          </div>

          {commandResult && (
            <div className="command-details">
              <h4>{audioCommands[selectedCommand]?.correction || 'Command Output'}</h4>
              
              <div className="detail-item">
                <span>Command:</span>
                <span>{commandResult.command}</span>
              </div>
              
              <div className="detail-item">
                <span>Node:</span>
                <span>{commandResult.node}</span>
              </div>
              
              <div className="detail-item">
                <span>Processing Time:</span>
                <span>{commandResult.timeBuyer.toFixed(3)}s</span>
              </div>
              
              <div className="detail-item">
                <span>Description:</span>
                <span>{commandResult.description}</span>
              </div>
              
              <div className="detail-item">
                <span>Timestamp:</span>
                <span>{new Date(commandResult.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="detail-item">
                <span>Status:</span>
                <span className={`status ${commandResult.status}`}>{commandResult.status}</span>
              </div>
            </div>
          )}

          {!commandResult && !executingCommand && (
            <div className="empty-output">
              <p>Select a command to see its output</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioTab;
