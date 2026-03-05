import React, { useEffect, useRef } from 'react'
import './MessageDisplay.css'

function MessageDisplay({ messages, isTyping }) {
  const messagesEndRef = useRef(null)
  const messageDisplayRef = useRef(null)

  // Debug: Log when messages prop changes
  useEffect(() => {
    console.log('[MessageDisplay] Received messages:', messages.length)
    if (messages.length > 0) {
      console.log('[MessageDisplay] Last message:', messages[messages.length - 1])
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll whenever messages change or typing status changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Format message content with line breaks
  const formatMessageContent = (content) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="message-display" ref={messageDisplayRef}>
      {(() => {
        console.log('[MessageDisplay RENDER] messages.length:', messages.length)
        console.log('[MessageDisplay RENDER] Full messages array:', JSON.stringify(messages, null, 2))
        return null
      })()}
      {messages.length === 0 ? (
        <div className="welcome-message">
          <h2>👋 Welcome to Hotel Front Desk Assistant</h2>
          <p>How can I help you today? Feel free to ask about:</p>
          <ul>
            <li>Room availability and bookings</li>
            <li>Hotel amenities and services</li>
            <li>Check-in and check-out procedures</li>
            <li>Local attractions and recommendations</li>
          </ul>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((msg, idx) => {
            console.log('[MessageDisplay RENDER] Rendering message:', msg.id, msg.role, msg.content.substring(0, 50))
            const isLastMessage = idx === messages.length - 1;
            return (
            <div 
              key={msg.id} 
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🏨'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {formatMessageContent(msg.content)}
                  {msg.streaming && isTyping && isLastMessage && (
                    <span className="streaming-cursor"></span>
                  )}
                </div>
                {msg.timestamp && (
                  <div className="message-timestamp">{msg.timestamp}</div>
                )}
              </div>
            </div>
          )
          })}
          
          {/* Typing indicator when assistant is responding */}
          {isTyping && (
            <div className="message assistant-message typing-indicator-message">
              <div className="message-avatar">🏨</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

export default MessageDisplay
