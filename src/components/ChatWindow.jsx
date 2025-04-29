import React, { useEffect, useRef } from 'react';
import Message from './Message';
import './ChatWindow.css';

export default function ChatWindow({ messages }) {
  const endRef = useRef(null);

  // scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button>☀️</button>
        <button>🌙</button>
        <button>⚙️</button>
      </header>
      <ul className="messages">
        {messages.map((msg, i) => (
          <Message key={i} from={msg.from} text={msg.text} />
        ))}
        <div ref={endRef} />
      </ul>
    </section>
  );
}