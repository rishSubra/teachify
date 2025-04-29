import React from 'react';
import './Message.css';

export default function Message({ from, text }) {
  const isUser = from === 'you';
  return (
    <li className={`message ${isUser ? 'you' : 'bot'}`}>
      <div className="sender">{isUser ? 'You' : 'Teachify AI'}</div>
      <div className="bubble">{text}</div>
    </li>
  );
}