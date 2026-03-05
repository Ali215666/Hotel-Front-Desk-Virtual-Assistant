# Reset / New Session Functionality

## Overview
The Reset/New Session feature allows users to start a fresh conversation with a new unique session ID, clearing all previous conversation history.

## Features

### 1. **Session Reset Button**
Located at the bottom of the chat interface with:
- 🔄 Icon for visual recognition
- Clear "New Session" label
- Tooltip explaining functionality

### 2. **State Management**
When reset is triggered, the system:
- ✅ Clears all conversation history in the UI
- ✅ Generates a new unique `session_id`
- ✅ Resets all component states (typing, errors, streaming)
- ✅ Displays new welcome message with new session ID
- ✅ Shows message count for current session

### 3. **Session ID Format**
```javascript
session_1709481234_xyz789abc
```
- Timestamp-based prefix for uniqueness
- Random alphanumeric suffix
- Easy to track and debug

### 4. **Backend Communication**
Sends optional reset signal to backend:
```json
{
  "type": "reset",
  "session_id": "session_1709481234_xyz789abc"
}
```

### 5. **User Confirmation**
- Prompts confirmation dialog if conversation has started
- Skips confirmation if only welcome message exists
- Prevents accidental data loss

### 6. **Visual Feedback**
- Session info panel shows:
  - Current session ID (truncated for display)
  - Message count in current session
- Welcome message includes ✨ indicator for new sessions

## Usage Flow

### Starting a New Session:
1. User clicks "🔄 New Session" button
2. System checks if conversation exists
3. If yes, shows confirmation dialog
4. If confirmed (or no conversation):
   - Sends reset signal to backend
   - Generates new session ID
   - Clears UI state
   - Shows welcome message

### Subsequent Messages:
- All messages sent after reset use the new `session_id`
- Backend treats as completely new conversation
- No memory of previous session

## State Cleanup

The reset process clears:
- `messages[]` - All conversation messages
- `isTyping` - Typing indicator state
- `connectionError` - Any connection errors
- `streamingMessageRef` - Streaming message reference
- `sessionId` - Old session ID (replaced with new)

## Implementation Details

### Session ID Generation
```javascript
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

### Reset Handler
```javascript
const handleResetSession = () => {
  // 1. Confirm with user (if needed)
  // 2. Send reset signal to backend
  // 3. Generate new session ID
  // 4. Clear all state
  // 5. Show welcome message
}
```

## Integration with Backend

The backend can optionally handle the reset signal to:
- Clear conversation memory for old session
- Free up resources
- Log session completion
- Update session statistics

If the backend doesn't handle the `reset` message type, it will simply be ignored, and the frontend will still function correctly by using a new `session_id` for subsequent messages.

## Testing

To test reset functionality:
1. Start a conversation with several messages
2. Click "🔄 New Session"
3. Confirm the dialog
4. Verify:
   - Conversation is cleared
   - New session ID is displayed
   - New welcome message appears
   - Next message uses new session ID
