import { useState } from 'react';

function OllamaHome() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response || data.message || 'No response.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ color: '#5A5750', marginTop: 0 }}>AI Chat</h2>
      <div style={{
        background: 'rgba(255,255,255,0.45)',
        borderRadius: '10px',
        border: '1px solid rgba(212,175,55,0.2)',
        minHeight: '300px',
        maxHeight: '450px',
        overflowY: 'auto',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#8B8680', textAlign: 'center', marginTop: '4rem' }}>Start a conversation with the AI assistant.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            margin: '0.5rem 0'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: msg.role === 'user' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.7)',
              color: '#3E3B34',
              maxWidth: '80%',
              textAlign: 'left',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: '#8B8680', fontStyle: 'italic' }}>Thinking...</p>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '6px',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.6)'
          }}
        />
        <button type="submit" disabled={loading} style={{
          padding: '0.75rem 1.25rem',
          background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default OllamaHome;
