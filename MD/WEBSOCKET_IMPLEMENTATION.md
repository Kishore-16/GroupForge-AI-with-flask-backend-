# Real-time WebSocket Implementation

This implementation adds real-time WebSocket capabilities to GroupForge using Flask-SocketIO on the backend and Socket.IO client on the frontend.

## Architecture

### Backend (Flask-SocketIO)
- **WebSocket Service** (`backend/app/services/websocket_service.py`): Handles real-time event broadcasting
- **WebSocket Handlers** (`backend/app/websocket_handlers.py`): Manages connection events and authentication
- **Service Integration**: Assessment, Team, and Auth services emit real-time updates

### Frontend (Socket.IO Client)
- **WebSocket Service** (`src/services/websocketService.ts`): Manages connection and event handling
- **WebSocket Context** (`src/contexts/WebSocketContext.tsx`): Provides React integration
- **UI Components**: Real-time status indicator and notifications

## Real-time Events

### 1. Profile Updates
- **Trigger**: User profile changes
- **Event**: `profile_updated`
- **Recipients**: The user whose profile was updated

### 2. Assessment Completion
- **Trigger**: Student completes assessment
- **Events**: 
  - `assessment_completed` → Student who completed
  - `student_assessment_completed` → Faculty members
- **Recipients**: Student + Faculty

### 3. Team Formation
- **Trigger**: New team is created
- **Event**: `team_formed`
- **Recipients**: All team members + Faculty

### 4. Student Eligibility Changes
- **Trigger**: Student becomes eligible/ineligible for team formation
- **Events**:
  - `eligibility_changed` → The student
  - `student_eligibility_changed` → Faculty members
- **Recipients**: Student + Faculty

### 5. Notifications
- **Trigger**: System notifications
- **Event**: `notification`
- **Recipients**: Specific users or broadcast

## Usage Examples

### Backend - Emitting Events
```python
# In service methods
from app.services.websocket_service import websocket_service

# Emit profile update
websocket_service.emit_user_profile_updated(user_id, profile_data)

# Emit team formation
websocket_service.emit_team_formed(team_data)

# Emit assessment completion  
websocket_service.emit_assessment_completed(user_id, assessment_data)
```

### Frontend - Listening to Events
```typescript
// In React components
import { useWebSocket } from '../contexts';

const { onTeamFormed, onAssessmentCompleted } = useWebSocket();

useEffect(() => {
  onTeamFormed((data) => {
    console.log('Team formed:', data);
    // Update UI state
  });
  
  onAssessmentCompleted((data) => {
    console.log('Assessment completed:', data);
    // Show notification
  });
}, []);
```

## Setup Instructions

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python backend/run.py
```

### 2. Frontend Setup
```bash
# Install dependencies (Socket.IO client already included)
npm install

# Set environment variables
cp .env.example .env
# Edit .env to set VITE_BACKEND_URL=http://localhost:5000

# Run the frontend
npm run dev
```

### 3. Testing WebSockets

1. **Connection Test**: Check the sidebar for real-time status indicator
2. **Profile Updates**: Update your profile and see real-time notifications
3. **Assessment**: Complete an assessment and see real-time updates
4. **Team Formation**: Faculty can form teams and see real-time broadcasts

## Authentication

WebSocket connections are authenticated using JWT tokens:
- Token passed via query parameter or Authorization header
- User authenticated on connection
- User joined to appropriate rooms based on role

## Event Data Structure

### Profile Update
```javascript
{
  type: 'profile_update',
  data: {
    id: 'user_id',
    displayName: 'User Name',
    // ... other profile fields
  },
  timestamp: '2024-01-12T10:30:00Z'
}
```

### Team Formation
```javascript
{
  type: 'team_formed',
  data: {
    teamId: 'team_id',
    teamName: 'Team Name',
    members: [
      {
        userId: 'user_id',
        displayName: 'User Name',
        role: 'member',
        // ... other member data
      }
    ],
    // ... other team data
  },
  timestamp: '2024-01-12T10:30:00Z'
}
```

### Assessment Completion
```javascript
{
  type: 'assessment_completed',
  user_id: 'user_id',
  data: {
    userId: 'user_id',
    displayName: 'User Name',
    skills: { 'python': 85, 'ml': 78 },
    overallScore: 81.5,
    attendedTest: true
  },
  timestamp: '2024-01-12T10:30:00Z'
}
```

## Error Handling

- Connection failures handled with automatic reconnection
- Authentication failures show appropriate error messages
- Fallback to polling if WebSocket connection fails
- Graceful degradation when WebSocket service unavailable

## Production Considerations

1. **Scaling**: Use Redis adapter for multi-instance deployments
2. **Authentication**: Implement proper JWT token validation
3. **Rate Limiting**: Add rate limiting for WebSocket events
4. **Monitoring**: Add logging and monitoring for WebSocket connections
5. **Error Reporting**: Implement comprehensive error reporting

## Debugging

### Backend
- Check Flask-SocketIO logs for connection issues
- Verify MongoDB connections
- Test JWT token validation

### Frontend
- Check browser console for WebSocket connection status
- Verify environment variables are set correctly
- Use browser dev tools to monitor WebSocket traffic

## Future Enhancements

1. **Typing Indicators**: Show when users are actively working
2. **Presence System**: Show online/offline status
3. **Chat Integration**: Real-time team chat
4. **File Sharing**: Real-time file upload notifications
5. **Analytics**: Real-time dashboard updates