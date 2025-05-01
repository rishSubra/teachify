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
    {
      from: "bot",
      text: "Welcome to Teachify AI! Ask me anything.",
      id: uuid(),
    },
  ]);

  // 2) one sessionId per browser session
  const sessionId = useRef(uuid());

  // 3) locate your API Gateway endpoint
  const restApis = awsExports.aws_cloud_logic_custom || [];
  const endpoint = restApis[0]?.endpoint;

  const handleSend = async (text) => {
  if (!text.trim()) return;

  // show your question immediately
  setMessages((msgs) => [
    ...msgs,
    { from: "you", text, id: uuid() },
  ]);

  if (!endpoint) {
    console.error("⚠️ No endpoint found in aws-exports:", awsExports.aws_cloud_logic_custom);
    return;
  }

  const url = `${endpoint}/chat`;
  const payload = {
    sessionId: sessionId.current,
    userId:    "anon-user",
    text,
  };

  console.group("📡 Sending chat");
  console.log("URL:", url);
  console.log("Payload:", payload);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    console.log("Response status:", res.status, res.statusText);

    // Try to parse JSON or text
    let data;
    try {
      data = await res.json();
      console.log("Response JSON:", data);
    } catch (e) {
      const txt = await res.text();
      console.warn("Response not JSON, raw text:", txt);
      throw new Error("Non-JSON response");
    }

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${data.message || JSON.stringify(data)}`);
    }

    // append the bot’s reply
    setMessages((msgs) => [
      ...msgs,
      { from: "bot", text: data.message, id: uuid() },
    ]);
  } catch (err) {
    console.error("❌ Fetch/chat error:", err);
    setMessages((msgs) => [
      ...msgs,
      {
        from: "bot",
        text: "⚠️ Oops, something went wrong.",
        id: uuid(),
      },
    ]);
  } finally {
    console.groupEnd();
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
