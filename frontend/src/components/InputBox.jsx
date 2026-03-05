import React, { useState, useRef, useEffect } from 'react'
import './InputBox.css'

function InputBox({ onSendMessage, isConnected, isTyping, sessionId }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Clear input when session changes (New Chat clicked)
  useEffect(() => {
    setMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'
    }
  }, [sessionId])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate message and connection status
    if (!message.trim()) {
      console.log('Cannot send empty message')
      return
    }
    
    if (!isConnected) {
      console.log('Cannot send message: not connected')
      return
    }
    
    if (isTyping) {
      console.log('Cannot send message: assistant is typing')
      return
    }
    
    // Send message to backend
    console.log('Sending message from input box:', {
      session_id: sessionId,
      message: message.trim()
    })
    
    onSendMessage(message.trim())
    
    // Clear input after sending
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea as user types
  const handleChange = (e) => {
    setMessage(e.target.value)
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  return (
    <form className="input-box" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder={isConnected ? "Type your message here..." : "Connecting..."}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || isTyping}
          rows={1}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || !isConnected || isTyping}
          title="Send message"
        >
          <span className="send-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-white dark:text-black">
              <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </span>
        </button>
      </div>
      {isTyping && (
        <div className="input-hint">Assistant is typing...</div>
      )}
    </form>
  )
}

export default InputBox
