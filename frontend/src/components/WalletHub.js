import { useState } from 'react';
import './WalletHub.css';

function WalletCard({ type, title, icon, connected, details, onConnect }) {
  return (
    <div className={`wallet-card ${connected ? 'wallet-connected' : 'wallet-dim'}`}>
      <div className="wallet-status-dot-container">
        <span className={`wallet-status-dot ${connected ? 'dot-green' : 'dot-grey'}`} />
        <span className="wallet-status-text">{connected ? 'Connected' : 'Not Connected'}</span>
      </div>
      <div className="wallet-icon">{icon}</div>
      <h3 className="wallet-title">{title}</h3>
      {connected && details && (
        <div className="wallet-details">
          {details.map((d, i) => (
            <div key={i} className="wallet-detail-row">
              <span className="wallet-detail-label">{d.label}</span>
              <span className="wallet-detail-value">{d.value}</span>
            </div>
          ))}
        </div>
      )}
      {!connected && (
        <button className="wallet-connect-btn" onClick={() => onConnect(type)}>
          Connect {title}
        </button>
      )}
    </div>
  );
}

function WalletHub() {
  const [wallets, setWallets] = useState({
    crypto: { connected: false },
    bank: { connected: false },
    card: { connected: false }
  });

  const handleConnect = (type) => {
    setWallets((prev) => ({
      ...prev,
      [type]: { connected: true }
    }));
  };

  return (
    <div className="wallet-hub">
      <h2>Wallets</h2>
      <div className="wallet-grid">
        <WalletCard
          type="crypto"
          title="Crypto Wallet"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
              <text x="16" y="21" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">S</text>
            </svg>
          }
          connected={wallets.crypto.connected}
          details={[
            { label: 'Address', value: '0x7a3b...f42d' },
            { label: 'SLDRT', value: '1,250.00' },
            { label: 'ETH', value: '0.842' }
          ]}
          onConnect={handleConnect}
        />
        <WalletCard
          type="bank"
          title="Connected Banks"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="12" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 4L28 12H4L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <line x1="10" y1="16" x2="10" y2="24" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="16" x2="16" y2="24" stroke="currentColor" strokeWidth="2" />
              <line x1="22" y1="16" x2="22" y2="24" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
          connected={wallets.bank.connected}
          details={[
            { label: 'Bank', value: 'Chase ****4821' },
            { label: 'Status', value: 'Verified' }
          ]}
          onConnect={handleConnect}
        />
        <WalletCard
          type="card"
          title="Payment Cards"
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="8" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <line x1="3" y1="14" x2="29" y2="14" stroke="currentColor" strokeWidth="2" />
              <rect x="6" y="18" width="8" height="2" rx="1" fill="currentColor" />
            </svg>
          }
          connected={wallets.card.connected}
          details={[
            { label: 'Card', value: 'Visa ****7193' },
            { label: 'Expires', value: '08/28' }
          ]}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
}

export default WalletHub;
