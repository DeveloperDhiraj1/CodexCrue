import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const starters = [
    "What should I learn next based on my goal?",
    "Explain my skill gap and how to close it",
    "Create a study plan for this week",
    "Quiz me on my current course topic",
    "What courses do you recommend for me?"
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      const history = res.data?.data;
      if (history && Array.isArray(history.messages)) {
        setMessages(history.messages);
      } else if (Array.isArray(history)) {
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMsg = { role: 'user', content: messageText, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/ai/chat', { message: messageText });
      const reply = res.data?.data?.reply || res.data?.reply || res.data?.content || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply, sender: 'ai' }]);
    } catch (err) {
      const backendMsg = err.response?.data?.message || '';
      // Detect quota/rate-limit errors
      if (backendMsg.toLowerCase().includes('rate limit') || backendMsg.toLowerCase().includes('quota') || backendMsg.includes('1,500')) {
        setError('__quota__');
      } else {
        setError(backendMsg || 'Failed to get a response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.delete('/ai/history');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell>
      <div className="page-wrap ai-page" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div className="page-eyebrow">AI Mentor</div>
            <h1 className="page-title">Your Learning Assistant</h1>
            <p className="page-subtitle">Ask about your path, get explanations, or generate a quiz.</p>
          </div>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            Clear chat
          </button>
        </div>

        <div className="chat-container card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="chat-messages card-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {initialLoad ? (
              <div style={{ textAlign: 'center', color: '#6B7280' }}>Loading history...</div>
            ) : messages.length === 0 ? (
              <div className="chat-starters" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                <p style={{ color: '#6B7280', marginBottom: '1rem' }}>How can I help you today?</p>
                {starters.map((starter, idx) => (
                  <button 
                    key={idx} 
                    className="starter-btn btn btn-ghost"
                    style={{ width: '80%', maxWidth: '400px', textAlign: 'left', padding: '0.75rem 1rem', border: '1px solid #E5E7EB' }}
                    onClick={() => handleSend(starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user' || msg.sender === 'user';
                return (
                  <div key={idx} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div className={`bubble ${isUser ? 'user' : 'ai'}`} style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: isUser ? '#16A34A' : '#F3F4F6',
                      color: isUser ? '#FFFFFF' : '#1F2937',
                      borderBottomRightRadius: isUser ? '2px' : '12px',
                      borderBottomLeftRadius: !isUser ? '2px' : '12px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div className="bubble bubble-typing" style={{ padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                  <span className="bubble-dot" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#9CA3AF', borderRadius: '50%', marginRight: '4px' }}></span>
                  <span className="bubble-dot" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#9CA3AF', borderRadius: '50%', marginRight: '4px' }}></span>
                  <span className="bubble-dot" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            error === '__quota__' ? (
              <div style={{ margin: '0 16px 12px', padding: '14px 16px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, fontSize: 13, color: '#92400E' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
                  <span>⏳</span> Daily AI quota reached
                </div>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  The free Gemini API tier allows <strong>50 requests/day</strong> for gemini-2.5-flash.
                  Quota resets at <strong>midnight Pacific Time</strong> (12:30 PM IST).
                  Try again after the reset, or{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#16A34A', fontWeight: 600 }}>
                    upgrade to a paid plan →
                  </a>
                </p>
              </div>
            ) : error.includes('API key') || error.includes('aistudio') ? (
              <div style={{ margin: '0 16px 12px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
                <span>🔑</span>
                <span>
                  {error}{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#16A34A', fontWeight: 600 }}>
                    Get a free Gemini key →
                  </a>
                </span>
              </div>
            ) : (
              <div style={{ margin: '0 16px 12px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
                <span>⚠️</span> {error}
              </div>
            )
          )}

          <div className="chat-input-row" style={{ padding: '1rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="chat-input" 
              style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
            <button 
              className="chat-send btn btn-primary" 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AIAssistant;
