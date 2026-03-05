# Hotel Front Desk Assistant - Frontend

A ChatGPT-style web chat interface for a Hotel Front Desk Assistant with real-time WebSocket streaming.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Features

✅ **Real-time Chat** - WebSocket streaming responses
✅ **Dark Theme** - ChatGPT-inspired UI with black/dark gray colors
✅ **Token Streaming** - See responses as they're generated
✅ **Session Management** - Unique sessions with conversation history
✅ **Connection Status** - Visual indicators for WebSocket state
✅ **Auto-reconnect** - Automatic reconnection on connection loss
✅ **Mobile Responsive** - Works on desktop, tablet, and mobile

## Requirements

- Node.js 16+
- Backend server running on port 8000
- Ollama running with hotel-qwen model

## Connection States

### 🟢 Connected
- Green indicator in header
- Backend WebSocket active
- Ready to chat

### 🔴 Disconnected  
- Red indicator in header
- Backend not reachable
- Shows offline message

### ⚠️ Connection Lost
- Yellow error banner with reconnect button
- Was connected, now lost connection
- Attempts auto-reconnect (5 tries)

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start backend first** (in another terminal):
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

4. **Access:** http://localhost:3000

## Troubleshooting

### "Not Connected" on page load
**This is normal for 1-2 seconds while connecting.**
- Wait 2-3 seconds for connection
- If persists, check backend is running
- Refresh the page (Ctrl+R)

### No response from assistant
1. **First message is slow** (15-30 seconds) - model loading
2. Check Ollama is running: `ollama list`
3. Check backend logs for errors
4. Test: `ollama run hotel-qwen "Hello"`

### Connection keeps dropping
- Check backend server didn't crash
- Check firewall isn't blocking WebSocket
- Look for errors in browser console (F12)

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # React entry
│   ├── App.jsx               # Main app + WebSocket logic
│   ├── components/           # UI components
│   │   ├── ChatInterface.jsx
│   │   ├── MessageDisplay.jsx
│   │   └── InputBox.jsx
│   ├── utils/
│   │   ├── websocketService.js   # WebSocket management
│   │   └── messageService.js     # Message formatting
│   └── styles/               # CSS files
├── index.html
├── package.json
└── vite.config.js
```

## Configuration

### WebSocket URL
Default: `ws://localhost:8000/ws/chat`

Change in [App.jsx](src/App.jsx):
```javascript
const wsUrl = 'ws://your-backend-url/ws/chat'
```

### Session Management
- New session ID generated on app start
- Click "New Session" button to reset
- Session ID shown in footer

## Performance

### Expected Response Times
- **First message:** 15-30 seconds (model loading)
- **Subsequent messages:** 1-3 seconds
- **Streaming:** Real-time token display

### Why is first message slow?
The Ollama model needs to load into memory on first use. This is normal and only happens once per backend restart.

## Next Steps

This is Step 6 (final) - the complete implementation:
1. ✅ Project skeleton (Step 1)
2. ✅ Conversation display (Step 2)
3. ✅ Message input (Step 3)
4. ✅ WebSocket integration (Step 4)
5. ✅ Reset functionality (Step 5)
6. ✅ UI/UX styling (Step 6)

**All features complete!** See [STARTUP_GUIDE.md](../STARTUP_GUIDE.md) for full system setup.

## Support

For issues, check:
1. Backend is running: http://localhost:8000/health
2. Ollama is running: `ollama list`
3. Browser console (F12) for errors
4. Backend terminal for errors

See [STARTUP_GUIDE.md](../STARTUP_GUIDE.md) for detailed troubleshooting.

