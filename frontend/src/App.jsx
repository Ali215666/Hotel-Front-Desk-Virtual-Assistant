import React, { useState, useEffect, useRef } from 'react'
import ChatInterface from './components/ChatInterface'
import { generateSessionId } from './utils/messageService'
import websocketService from './utils/websocketService'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(() => generateSessionId())
  const [connectionError, setConnectionError] = useState(null)
  const streamingMessageRef = useRef(null)
  const messageIdCounter = useRef(0)
  const wsUrl = 'ws://localhost:8000/ws/chat'
  
  // Generate unique message ID
  const generateMessageId = () => {
    messageIdCounter.current += 1
    return `msg_${Date.now()}_${messageIdCounter.current}`
  }

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection...')
    console.log('Session ID:', sessionId)
    
    // Set up WebSocket callbacks
    websocketService.onConnect(() => {
      console.log('WebSocket connected successfully')
      setIsConnected(true)
      setConnectionError(null)
      
      // Send initial handshake to register session with backend
      // Small delay to ensure WebSocket is fully ready (OPEN state)
      setTimeout(() => {
        const sent = websocketService.send({
          session_id: sessionId,
          message: "__INIT__", // Special init message that backend can ignore
          type: "init"
        })
        console.log('Init handshake sent:', sent)
      }, 100)
      
      // Add welcome message from assistant
      const welcomeMsg = {
        role: 'assistant',
        content: `Hello! I'm your Hotel Front Desk Assistant. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        id: generateMessageId()
      }
      setMessages([welcomeMsg])
    })
    
    websocketService.onDisconnect((event) => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      
      // Only show error if it wasn't a clean disconnect and we previously had messages
      if (event.code !== 1000 && messages.length > 0) {
        setConnectionError('Connection lost. Attempting to reconnect...')
      }
    })
    
    websocketService.onStreamToken((token) => {
      // Handle streaming tokens from assistant
      console.log('Received token:', token)
      
      setMessages(prev => {
        console.log('Current messages count:', prev.length)
        console.log('Streaming message ref:', streamingMessageRef.current)
        
        // Find or create streaming message
        if (streamingMessageRef.current) {
          const msgIndex = prev.findIndex(m => m.id === streamingMessageRef.current)
          console.log('Found streaming message at index:', msgIndex)
          if (msgIndex !== -1) {
            // Message found - update it
            const newMessages = prev.map((msg, idx) => 
              idx === msgIndex 
                ? { ...msg, content: msg.content + token }
                : msg
            )
            console.log('Updated message content length:', newMessages[msgIndex].content.length)
            return newMessages
          } else {
            // Message not found - ref is stale, clear it and create new message
            console.warn('Streaming message ref points to non-existent message! Clearing ref and creating new message.')
            streamingMessageRef.current = null
          }
        }
        
        // Create new assistant message for streaming (either ref was null or message not found)
        console.log('Creating new streaming message')
        const newMsg = {
          role: 'assistant',
          content: token,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          id: generateMessageId(),
          streaming: true
        }
        streamingMessageRef.current = newMsg.id
        setIsTyping(false)
        console.log('New message created with id:', newMsg.id)
        return [...prev, newMsg]
      })
    })
    
    websocketService.onMessage(({ type, data }) => {
      if (type === 'end') {
        console.log('Streaming ended')
        
        // Mark streaming message as complete
        setMessages(prev => {
          if (streamingMessageRef.current) {
            const msgIndex = prev.findIndex(m => m.id === streamingMessageRef.current)
            if (msgIndex !== -1) {
              // Create new array with updated message (proper immutability)
              return prev.map((msg, idx) => 
                idx === msgIndex 
                  ? { ...msg, streaming: false }
                  : msg
              )
            }
          }
          return prev
        })
        
        streamingMessageRef.current = null
        setIsTyping(false)
      }
    })
    
    websocketService.onError((error) => {
      console.error('WebSocket error:', error)
      
      // Check if it's an Ollama connection error
      if (error.includes('Ollama') || error.includes('Could not connect')) {
        setConnectionError('⚠️ Ollama is not running. Please start Ollama and ensure the hotel-qwen model is loaded.')
      } else if (messages.length > 0) {
        // Only show error if we're not in initial connection state
        setConnectionError(error)
      }
      setIsTyping(false)
    })
    
    // Try to connect to WebSocket (skip if already connected to handle React StrictMode)
    if (!websocketService.isConnected()) {
      console.log('Initiating WebSocket connection...')
      websocketService.connect(wsUrl)
    } else {
      console.log('WebSocket already connected, skipping connect()')
    }
    
    // Check connection status after a delay
    const connectionCheckTimeout = setTimeout(() => {
      if (!websocketService.isConnected()) {
        console.log('Starting in offline demo mode - backend not connected')
        setIsConnected(false)
        const welcomeMsg = {
          role: 'assistant',
          content: `Hello! I'm your Hotel Front Desk Assistant.\n\n⚠️ Backend server is not connected.\n\nTo start the backend:\n1. Open terminal\n2. cd backend\n3. python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n\nNote: Make sure Ollama is running with the hotel-qwen model loaded.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          id: generateMessageId()
        }
        setMessages([welcomeMsg])
      }
    }, 3000) // Increased to 3 seconds to give more time
    
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection')
      clearTimeout(connectionCheckTimeout)
      websocketService.disconnect()
    }
  }, [])

  // WebSocket connection function (for manual reconnect)
  const connectWebSocket = () => {
    setConnectionError(null)
    websocketService.connect(wsUrl)
  }

  const handleSendMessage = (message) => {
    // Add user message to conversation history immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: generateMessageId()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Prepare JSON payload with session_id and message
    const payload = {
      session_id: sessionId,
      message: message
    }
    
    console.log('Sending message payload:', JSON.stringify(payload, null, 2))
    
    // Send message via WebSocket
    if (websocketService.isConnected()) {
      const success = websocketService.send(payload)
      
      if (success) {
        console.log('Message sent successfully via WebSocket')
        setIsTyping(true)
        streamingMessageRef.current = null // Reset for new message
      } else {
        console.error('Failed to send message via WebSocket')
        setConnectionError('Failed to send message')
      }
    } else {
      console.error('WebSocket is not connected')
      setConnectionError('Not connected to server. Please reconnect.')
    }
  }

  const handleResetSession = () => {
    // Confirm reset if there are messages (excluding welcome message)
    const hasConversation = messages.length > 1 || 
                           (messages.length === 1 && messages[0].role === 'user')
    
    if (hasConversation) {
      const confirmed = window.confirm(
        'Are you sure you want to start a new session? This will clear the current conversation.'
      )
      
      if (!confirmed) {
        return
      }
    }
    
    // Generate new session ID (no need to send reset - backend tracks per session)
    const newSessionId = generateSessionId()
    const oldSessionId = sessionId
    setSessionId(newSessionId)
    
    // Clear all messages and state
    setMessages([])
    setIsTyping(false)
    setConnectionError(null)
    streamingMessageRef.current = null
    
    console.log('Session reset completed')
    console.log('Old session ID:', oldSessionId)
    console.log('New session ID:', newSessionId)
    
    // Add welcome message for new session
    setTimeout(() => {
      const welcomeMsg = {
        role: 'assistant',
        content: websocketService.isConnected() 
          ? `Hello! I'm your Hotel Front Desk Assistant. How can I help you today?`
          : `Hello! I'm your Hotel Front Desk Assistant.\n\n⚠️ Running in offline mode. Start the backend server to enable live chat.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        id: generateMessageId()
      }
      setMessages([welcomeMsg])
    }, 100)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button className="new-session-button" onClick={handleResetSession} title="Start new session">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span className="hide-mobile">New Chat</span>
          </button>
        </div>
        
        <h1 className="app-title">Hotel Front Desk Assistant</h1>
        
        <div className="header-right">
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="hide-mobile">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>
      
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onResetSession={handleResetSession}
        onReconnect={connectWebSocket}
        isConnected={isConnected}
        isTyping={isTyping}
        sessionId={sessionId}
        connectionError={connectionError}
      />
    </div>
  )
}

export default App
