import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppStore } from '../hooks/useAppStore';
import { answerQuestion, EXAMPLE_QUESTIONS } from '../services/coach';

interface Message {
  id: number;
  from: 'you' | 'coach';
  paragraphs: string[];
}

export function CoachPage() {
  const { meals, profile, today } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const answer = answerQuestion(question, { meals, profile, today });
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: 'you', paragraphs: [question] },
      { id: Date.now() + 1, from: 'coach', paragraphs: answer.paragraphs },
    ]);
    setText('');
  };

  return (
    <div className="page page--coach">
      <header className="page__header">
        <h1 className="page__title">Nutrition coach</h1>
        <p className="notice notice--info">
          <Icon name="info" size={18} />
          <span>
            This coach answers from your saved diary using fixed rules. It is not an AI chatbot and does not give
            medical advice.
          </span>
        </p>
      </header>

      <div className="chat" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat__intro">
            <p>Ask about your calories, protein, carbs, fat or fibre, today or this week.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bubble bubble--${m.from}`}>
              <span className="sr-only">{m.from === 'you' ? 'You asked:' : 'Coach:'}</span>
              {m.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="chips chips--examples" aria-label="Example questions">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button key={q} type="button" className="chip" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="ask">
        <label htmlFor="coach-input" className="sr-only">
          Your question
        </label>
        <input
          id="coach-input"
          type="text"
          value={text}
          placeholder="How much protein have I eaten today?"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') ask(text);
          }}
        />
        <button type="button" className="btn btn--primary" onClick={() => ask(text)} disabled={!text.trim()}>
          Ask
        </button>
      </div>
    </div>
  );
}
