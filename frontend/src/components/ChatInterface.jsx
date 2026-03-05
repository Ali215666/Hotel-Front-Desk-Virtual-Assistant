import React from 'react'
import MessageDisplay from './MessageDisplay'
import InputBox from './InputBox'
import './ChatInterface.css'

function ChatInterface({ 
  messages, 
  onSendMessage, 
  onResetSession, 
  onReconnect,
  isConnected, 
  isTyping, 
  sessionId,
  connectionError 
}) {
  return (
    <div className="chat-interface">
      {connectionError && (
        <div className="connection-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{connectionError}</span>
          <button className="reconnect-button" onClick={onReconnect}>
            🔄 Reconnect
          </button>
        </div>
      )}
      
      <div className="chat-container">
        <MessageDisplay 
          messages={messages} 
          isTyping={isTyping}
        />
        <InputBox 
          onSendMessage={onSendMessage} 
          isConnected={isConnected}
          isTyping={isTyping}
          sessionId={sessionId}
        />
      </div>
    </div>
  )
}

export default ChatInterface
