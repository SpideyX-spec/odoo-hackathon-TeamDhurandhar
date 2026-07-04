import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the Odoo X AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: data.reply,
        action: data.action
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server right now.' }]);
    }
    setLoading(false);
  };

  const handleAction = (action) => {
    if (action.type === 'navigate') {
      navigate(action.payload);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#875A7B',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <i className="fa fa-magic" style={{ fontSize: '24px' }}></i>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '350px',
            height: '500px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.8)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px', backgroundColor: '#875A7B', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-magic"></i>
              <strong style={{ fontSize: '15px' }}>Odoo X AI</strong>
            </div>
            <i 
              className="fa fa-times" 
              style={{ cursor: 'pointer', fontSize: '16px' }}
              onClick={() => setIsOpen(false)}
            ></i>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(255,255,255,0.5)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  backgroundColor: msg.sender === 'user' ? '#875A7B' : '#FFFFFF',
                  color: msg.sender === 'user' ? 'white' : '#374151',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)'
                }}>
                  {msg.text}
                </div>
                {msg.action && (
                  <button 
                    onClick={() => handleAction(msg.action)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(135, 90, 123, 0.1)',
                      color: '#875A7B',
                      border: '1px solid #875A7B',
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {msg.action.label}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#9CA3AF', fontSize: '12px', padding: '0 4px' }}>
                <i className="fa fa-circle-o-notch fa-spin"></i> AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '12px', backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: '#F9FAFB'
              }}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: input.trim() ? '#875A7B' : '#E5E7EB',
                color: 'white',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fa fa-paper-plane" style={{ fontSize: '14px', marginLeft: '-2px' }}></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
