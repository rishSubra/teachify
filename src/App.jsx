// src/App.jsx
import React, { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import awsExports from "./aws-exports";

// UI Components
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

import "./App.css";

export default function App() {
  // 1) chat messages state
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome to Teachify AI! Ask me anything.", id: uuid() },
  ]);

  // 2) one sessionId per browser session
  const sessionId = useRef(uuid());

  // 3) discover your API Gateway endpoint from aws-exports.js
  const chatApi = awsExports.aws_cloud_logic_custom?.find(
    (api) => api.name === "ChatAPI"
  );
  const endpoint = chatApi?.endpoint;

  const handleSend = async (text) => {
    if (!text.trim() || !endpoint) return;

    // add user bubble immediately
    setMessages((msgs) => [
      ...msgs,
      { from: "you", text, id: uuid() },
    ]);

    // prepare payload
    const payload = {
      sessionId: sessionId.current,
      userId:    "anon-user", // or pull from your auth provider
      text,
    };

    try {
      const res = await fetch(`${endpoint}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const { message } = await res.json();

      // add bot bubble
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: message, id: uuid() },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "⚠️ Oops, something went wrong." , id: uuid()},
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
