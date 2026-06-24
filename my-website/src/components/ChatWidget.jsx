import React, { useState, useRef, useEffect } from 'react';
import '../css/chat.css';

const BACKEND_URL = 'http://localhost:8000';
const DOCS_BASE = '/docs/computer-science-11';

function headingToAnchor(heading) {
  // Strip leading # chars (markdown heading prefix)
  const text = heading.replace(/^#+\s*/, '').trim();
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove non-alphanumeric except spaces/hyphens
    .replace(/\s+/g, '-')       // spaces → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-|-$/g, '');     // strip leading/trailing hyphens
}

function sectionUrl(source, heading) {
  const base = `${DOCS_BASE}/${source}`;
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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        sources: data.sources || [],
        sections: data.sections || [],
      }]);
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
            <button className="robo-close" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
          </div>

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
                        href={sectionUrl(sec.source, sec.heading)}
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
        </div>
      )}
    </>
  );
}
