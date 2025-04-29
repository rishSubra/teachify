import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to Teachify AI! How can I help today?' }
  ]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    // append user message
    setMessages((msgs) => [...msgs, { from: 'you', text }]);

    // TODO: call your backend (Amplify) with `text` and await reply
    // const reply = await API.post('chatApi', '/messages', { body: { message: text } });
    // setMessages((msgs) => [...msgs, { from: 'bot', text: reply }]);

    // For now, echo stub:
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: 'bot', text: '🤖 This is a stubbed response.' }]);
    }, 500);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-chat">
        <ChatWindow messages={messages} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}