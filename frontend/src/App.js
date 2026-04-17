import { useState, useEffect, useCallback } from 'react';
import './App.css';
import apiClient from './api/client';
import LoginRegister from './components/LoginRegister';
import News from './components/News';
import Markets from './components/Markets';
import About from './components/About';
import UserProfile from './components/UserProfile';
import OllamaHome from './components/OllamaHome';
import WalletHub from './components/WalletHub';
import HankoStamps from './components/HankoStamps';
import DevicesTab from './components/DevicesTab';
import Calculator from './components/Calculator';

const BROWSE_TABS = [
  { id: 'login', label: 'Login' },
  { id: 'news', label: 'News' },
  { id: 'markets', label: 'Markets' },
  { id: 'about', label: 'About' },
];

const AUTH_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'news', label: 'News' },
  { id: 'markets', label: 'Markets' },
  { id: 'about', label: 'About' },
  { id: 'ai-chat', label: 'AI Chat' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'hanko', label: 'Hanko Stamps' },
  { id: 'devices', label: 'Devices' },
  { id: 'calculator', label: 'Calculator' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await apiClient.client.get('/auth/me');
      setUser(response.data.user || response.data);
      setIsAuthenticated(true);
      setActiveTab('profile');
    } catch (err) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setActiveTab('profile');
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  const tabs = isAuthenticated ? AUTH_TABS : BROWSE_TABS;

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <h1 className="app-title">Solidarity</h1>
        </div>
        <nav className="App-nav desktop-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="header-right">
          {isAuthenticated && user && (
            <span className="user-pill">{user.email || 'User'}</span>
          )}
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <main className="App-content">
        {activeTab === 'login' && !isAuthenticated && (
          <LoginRegister onLogin={handleLogin} />
        )}
        {activeTab === 'profile' && isAuthenticated && (
          <UserProfile user={user} onLogout={handleLogout} />
        )}
        {activeTab === 'news' && <News />}
        {activeTab === 'markets' && <Markets />}
        {activeTab === 'about' && <About />}
        {activeTab === 'ai-chat' && isAuthenticated && <OllamaHome />}
        {activeTab === 'wallets' && isAuthenticated && <WalletHub />}
        {activeTab === 'hanko' && isAuthenticated && <HankoStamps />}
        {activeTab === 'devices' && isAuthenticated && <DevicesTab />}
        {activeTab === 'calculator' && isAuthenticated && <Calculator />}
      </main>
    </div>
  );
}

export default App;
