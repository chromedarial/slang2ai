
import { useState } from 'react';

export default function SpeakingPage() {
  const [mode, setMode] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const MODES = {
    interview: 'Job Interview',
    meeting: 'Business Meeting',
    casual: 'Casual Speaking',
    resume: 'Continue where we left off',
  };

  async function handleModeSelect(selected: string) {
    setMode(selected);
    setLoading(true);
    const res = await fetch('/api/speaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: selected }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, `🧠: ${data.reply}`]);
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🗣️ Speaking with AI</h1>
      {!mode && (
        <>
          <p>Select a speaking mode:</p>
          {Object.entries(MODES).map(([key, label]) => (
            <button key={key} onClick={() => handleModeSelect(key)} style={{ marginRight: 10 }}>
              {label}
            </button>
          ))}
        </>
      )}
      {mode && (
        <div style={{ marginTop: '2rem' }}>
          <p><strong>Mode:</strong> {MODES[mode]}</p>
          {loading ? <p>AI is thinking...</p> : null}
          <div style={{ marginTop: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>{msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
