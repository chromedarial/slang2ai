import { useEffect, useState } from 'react';

export default function SpeakingPage() {
  const [mode, setMode] = useState('');
  const [conversation, setConversation] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.interimResults = false;
        recog.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setConversation((prev) => [...prev, `🧑 You: ${transcript}`]);
          const res = await fetch('/api/speaking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, message: transcript }),
          });
          const data = await res.json();
          setConversation((prev) => [...prev, `🤖 AI: ${data.reply}`]);
        };
        setRecognition(recog);
      }
    }
  }, [mode]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      setIsListening(false);
      recognition.stop();
    }
  };

  const handleMode = async (selectedMode: string) => {
    setMode(selectedMode);
    setConversation([]);
    const res = await fetch('/api/speaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: selectedMode }),
    });
    const data = await res.json();
    setConversation([`🤖 AI: ${data.reply}`]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🗣️ Speaking with AI</h1>
      {!mode ? (
        <>
          <p>Select a speaking mode:</p>
          <button onClick={() => handleMode('interview')}>Job Interview</button>
          <button onClick={() => handleMode('meeting')}>Business Meeting</button>
          <button onClick={() => handleMode('casual')}>Casual Speaking</button>
          <button onClick={() => handleMode('resume')}>Continue where we left off</button>
        </>
      ) : (
        <>
          <p>Mode: {mode}</p>
          <button onClick={startListening} disabled={isListening}>🎤 Start</button>
          <button onClick={stopListening} disabled={!isListening}>⏹️ Stop</button>
          <div style={{ marginTop: '1rem' }}>
            {conversation.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
