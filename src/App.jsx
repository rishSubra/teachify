import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import './App.css';
import { API } from "aws-amplify";
import { v4 as uuid } from "uuid";  // npm install uuid


export default function App() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to Teachify AI! How can I help today?' }
  ]);

  const handleSend = async (text) => {
  if (!text.trim()) return;

  // 1️⃣ Push the user’s message into state immediately
  setMessages((msgs) => [
    ...msgs,
    { from: "you", text, id: uuid() }
  ]);

  // 2️⃣ Prepare your payload
  const payload = {
    userId:    "currentUser",        // swap in real userId (e.g. from Auth)
    sessionId: sessionIdRef.current, // could be a ref or state you generated at chat start
    text
  };

  try {
    // 3️⃣ Call your backend
    const resp = await API.post("ChatAPI", "/chat", { body: payload });
    const botReply = resp.message; // { message: "…" }

    // 4️⃣ Append the bot’s reply
    setMessages((msgs) => [
      ...msgs,
      { from: "bot", text: botReply, id: uuid() }
    ]);
  } catch (err) {
    console.error("Error sending message:", err);
    setMessages((msgs) => [
      ...msgs,
      { from: "bot", text: "❌ Sorry, something went wrong." }
    ]);
  }
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