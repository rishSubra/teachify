import React from 'react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Teachify AI</h2>
      <nav>
        <ul>
          <li>Your Classes</li>
          <li>Resources</li>
          <li>New Chat</li>
        </ul>
      </nav>
      <div className="recent-chats">
        <h3>Recent Chats for This Class</h3>
        <ul>
          <li>Types of Real Numbers</li>
          <li>What numbers are integers?</li>
          <li>Summarize this presentation</li>
          <li>Algebra problem explanation</li>
          <li>PEMDAS steps</li>
        </ul>
      </div>
    </aside>
  );
}