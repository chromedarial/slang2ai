import { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function SpeakingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const predefinedPrompts: { [key: string]: string } = {
    interview: 'Act as an English job interviewer for the position described. Ask typical questions and wait for answers.',
    meeting: 'Simulate a real business meeting about reports, decisions or sales. Ask naturally and wait for answers.',
    casual: 'Start a light casual conversation about hobbies, travel, or culture. Help the user get comfortable.',
    continue: 'Continue the last conversation we were having with the user, naturally.',
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const startMode = (selectedMode: string) => {
    const systemMessage: Message = {
      role: 'system',
      content: predefinedPrompts[selectedMode],
    };
    setMessages([systemMessage]);
    setMode(selectedMode);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/speaking', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const reader = res.body?.getReader();
    if (!reader) {
      setLoading(false);
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let result = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = result;
        return updated;
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>🗣️ lang2ai – Speaking Practice</h1>

      {!mode && (
        <div style={{ marginTop: 20 }}>
          <p>Choose a conversation type to start:</p>
          <button onClick={() => startMode('interview')}>Job Interview</button>{' '}
          <button onClick={() => startMode('meeting')}>Business Meeting</button>{' '}
          <button onClick={() => startMode('casual')}>Casual Speaking</button>{' '}
          <button onClick={() => startMode('continue')}>Continue Last Session</button>
        </div>
      )}

      {mode && (
        <>
          <div
            style={{
              border: '1px solid #ccc',
              padding: 16,
              height: '400px',
              overflowY: 'auto',
              marginTop: 20,
              borderRadius: 8,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 12,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                <strong>{msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : 'System'}</strong>
                <div>{msg.content}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: '80%', padding: 8 }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ marginLeft: 8 }}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
