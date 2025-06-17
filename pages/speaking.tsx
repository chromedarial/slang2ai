import { useState, useEffect } from 'react';

const modes = {
  interview: 'Job Interview',
  meeting: 'Business Meeting',
  casual: 'Casual Speaking',
  resume: 'Continue where we left off',
};

export default function SpeakingPage() {
  const [mode, setMode] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [conversation, setConversation] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.interimResults = false;
        recog.maxAlternatives = 1;

        recog.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setConversation((prev) => [...prev, `🧑‍💼 You: ${transcript}`]);

          const res = await fetch('/api/speaking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, message: transcript }),
          });

          const data = await res.json();
          setConversation((prev) => [...prev, `🤖 AI: ${data.reply}`]);
        };

        recog.onerror = (event: any) => {
          setConversation((prev) => [...prev, `⚠️ Error: ${event.error}`]);
        };

        setRecognition(recog);
      }
    }
  }, [mode]);

  const handleStart = () => {
    if (!recognition) return;
    setIsListening(true);
    recognition.start();
  };

  const handleStop = () => {
    if (!recognition) return;
    setIsListening(false);
    recognition.stop();
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
      {!mode && (
        <>
          <p>Select a speaking mode:</p>
          {Object.entries(modes).map(([key, label]) => (
            <button key={key} onClick={() => handleMode(key)} style={{ margin: '0.25rem' }}>
              {label}
            </button>
          ))}
        </>
      )}

      {mode && (
        <>
          <p>Mode: <strong>{modes[mode as keyof typeof modes]}</strong></p>
          <button onClick={handleStart} disabled={isListening} style={{ marginRight: '0.5rem' }}>
            🎤 Start
          </button>
          <button onClick={handleStop} disabled={!isListening}>
            ⏹️ Stop
          </button>

          <div style={{ marginTop: '1rem' }}>
            {conversation.map((msg, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>{msg}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
