import React, { useState, useRef, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '../css/chat.css';

const BACKEND_URL = 'https://cs11-book-api.vercel.app';
const HISTORY_KEY = 'robo_history';
const HISTORY_MAX = 5;
const HISTORY_TTL = 24 * 60 * 60 * 1000;

function headingToAnchor(heading) {
  const text = heading.replace(/^#+\s*/, '').trim();
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sectionUrl(docsBase, source, heading) {
  const base = `${docsBase}/${source}`;
  if (!heading || !heading.startsWith('#')) return base;
  return `${base}#${headingToAnchor(heading)}`;
}

function sectionLabel(heading, source) {
  if (!heading || !heading.startsWith('#')) return source;
  return heading.replace(/^#+\s*/, '').trim();
}

function getSelectedText() {
  if (typeof window === 'undefined') return '';
  return window.getSelection()?.toString().trim() || '';
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter(item => now - item.timestamp < HISTORY_TTL);
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return '1d ago';
}

export default function ChatWidget() {
  const { siteConfig } = useDocusaurusContext();
  const docsBase = `${siteConfig.baseUrl}docs/computer-science-11`;

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Robo 🤖, your CS11 book assistant.\nAsk me anything from the textbook. Tip: highlight text on the page first to give me context!",
      sources: [],
      sections: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!showHistory) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, showHistory]);

  const addToHistory = (question, answer, sources, sections) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.question.toLowerCase() !== question.toLowerCase());
      const entry = { question, answer, sources, sections, timestamp: Date.now() };
      const updated = [entry, ...filtered].slice(0, HISTORY_MAX);
      saveHistory(updated);
      return updated;
    });
  };

  const removeFromHistory = (index) => {
    setHistory(prev => {
      const updated = prev.filter((_, i) => i !== index);
      saveHistory(updated);
      return updated;
    });
  };

  const loadFromHistory = (item) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', text: item.question, sources: [], sections: [] },
      { role: 'assistant', text: item.answer, sources: item.sources, sections: item.sections },
    ]);
    setShowHistory(false);
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const selectedText = getSelectedText();
    setMessages(prev => [...prev, { role: 'user', text: question, sources: [], sections: [] }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, selected_text: selectedText }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      const answer = data.answer;
      const sources = data.sources || [];
      const sections = data.sections || [];

      setMessages(prev => [...prev, { role: 'assistant', text: answer, sources, sections }]);
      addToHistory(question, answer, sources, sections);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I couldn't reach the server. Make sure the backend is running.",
        sources: [],
        sections: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        className="robo-fab"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Toggle Robo AI Assistant"
        title="Ask Robo"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="robo-panel">
          <div className="robo-header">
            <span className="robo-title">🤖 Robo — CS11 Assistant</span>
            <div className="robo-header-actions">
              <button
                className="robo-history-btn"
                onClick={() => setShowHistory(h => !h)}
                aria-label={showHistory ? 'Back to chat' : 'Question history'}
                title={showHistory ? 'Back to chat' : 'Question history'}
              >
                {showHistory ? '💬' : '🕐'}
              </button>
              <button className="robo-close" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
            </div>
          </div>

          {showHistory ? (
            <div className="robo-history-panel">
              <div className="robo-history-header">
                <span>Recent Questions</span>
                <span className="robo-history-sub">Clears after 24 h · max 5</span>
              </div>
              {history.length === 0 ? (
                <div className="robo-history-empty">
                  <span>🕐</span>
                  <p>No questions yet.</p>
                  <p>Ask Robo something and it will appear here!</p>
                </div>
              ) : (
                <ul className="robo-history-list">
                  {history.map((item, i) => (
                    <li key={i} className="robo-history-item">
                      <button
                        className="robo-history-q"
                        onClick={() => loadFromHistory(item)}
                        title="Load this Q&A into chat"
                      >
                        <span className="robo-history-text">{item.question}</span>
                        <span className="robo-history-time">{timeAgo(item.timestamp)}</span>
                      </button>
                      <button
                        className="robo-history-del"
                        onClick={() => removeFromHistory(i)}
                        aria-label="Remove from history"
                        title="Remove"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              <div className="robo-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`robo-msg robo-msg--${msg.role}`}>
                    <div className="robo-msg-text">{msg.text}</div>
                    {msg.sections && msg.sections.length > 0 && (
                      <div className="robo-sections">
                        <span className="robo-sections-label">📖 Read in book:</span>
                        {msg.sections.map((sec, j) => (
                          <a
                            key={j}
                            href={sectionUrl(docsBase, sec.source, sec.heading)}
                            className="robo-section-link"
                            title={`Go to: ${sectionLabel(sec.heading, sec.source)}`}
                          >
                            {sectionLabel(sec.heading, sec.source)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="robo-msg robo-msg--assistant">
                    <div className="robo-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="robo-input-area">
                <textarea
                  className="robo-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask from the book… highlight text first for context!"
                  rows={2}
                  disabled={loading}
                />
                <button
                  className="robo-send"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  title="Send"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
