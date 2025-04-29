import React, { useState } from 'react';
import './ChatInput.css';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const submit = e => {
    e.preventDefault();
    onSend(text);
    setText('');
  };

  return (
    <form className="chat-input" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ask Teachify AI…"
      />
      <button type="submit">➤</button>
    </form>
  );
}