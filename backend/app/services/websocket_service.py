"""
WebSocket Service for real-time updates
Handles all WebSocket events and real-time data broadcasting
"""

from typing import Dict, List, Any, Optional
from flask_socketio import emit
from flask_jwt_extended import decode_token
from flask import current_app
from app.extensions import socketio
import logging

logger = logging.getLogger(__name__)


class WebSocketService:
    """Service for managing WebSocket connections and real-time updates"""
    
    def __init__(self):
        self.connected_users = {}  # {user_id: [session_ids]}
        self.user_rooms = {}       # {user_id: room_name}
    
    def authenticate_socket_user(self, token: str) -> Optional[str]:
        """
        Authenticate user from JWT token for WebSocket connection
        Returns user_id if valid, None if invalid
        """
        try:
            if not token:
                logger.error("No token provided for authentication")
                return None
            
            # Remove 'Bearer ' if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            logger.info(f"Attempting to decode token (length: {len(token)})")
            
            # Decode and validate JWT token
            decoded_token = decode_token(token)
            user_id = decoded_token.get('sub')
            
            if user_id:
                logger.info(f"Successfully authenticated user: {user_id}")
            else:
                logger.error("Token decoded but no 'sub' claim found")
            
            return user_id
        except Exception as e:
            logger.error(f"Socket authentication error: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def add_user_connection(self, user_id: str, session_id: str):
        """Add a new user connection"""
        if user_id not in self.connected_users:
            self.connected_users[user_id] = []
        
        if session_id not in self.connected_users[user_id]:
            self.connected_users[user_id].append(session_id)
            
        logger.info(f"User {user_id} connected with session {session_id}")
    
    def remove_user_connection(self, user_id: str, session_id: str):
        """Remove a user connection"""
        if user_id in self.connected_users:
            if session_id in self.connected_users[user_id]:
                self.connected_users[user_id].remove(session_id)
                
            # Remove user entry if no more connections
            if not self.connected_users[user_id]:
                del self.connected_users[user_id]
                if user_id in self.user_rooms:
                    del self.user_rooms[user_id]
                    
        logger.info(f"User {user_id} disconnected session {session_id}")
    
    def join_user_room(self, user_id: str, room: str):
        """Track user room membership (actual join happens in handler)"""
        self.user_rooms[user_id] = room
        logger.info(f"User {user_id} registered for room {room}")
    
    def is_user_connected(self, user_id: str) -> bool:
        """Check if user is currently connected"""
        return user_id in self.connected_users and len(self.connected_users[user_id]) > 0
    
    # Real-time event emitters
    
    def emit_user_profile_updated(self, user_id: str, profile_data: Dict[str, Any]):
        """Emit profile update to user"""
        self._emit_to_user(user_id, 'profile_updated', {
            'type': 'profile_update',
            'data': profile_data,
            'timestamp': self._get_timestamp()
        })
    
    def emit_assessment_completed(self, user_id: str, assessment_data: Dict[str, Any]):
        """Emit assessment completion to user and relevant stakeholders"""
        event_data = {
            'type': 'assessment_completed',
            'user_id': user_id,
            'data': assessment_data,
            'timestamp': self._get_timestamp()
        }
        
        # Emit to the user who completed the assessment
        self._emit_to_user(user_id, 'assessment_completed', event_data)
        
        # Emit to faculty (for real-time student progress tracking)
        self._emit_to_role('faculty', 'student_assessment_completed', event_data)
    
    def emit_team_formed(self, team_data: Dict[str, Any]):
        """Emit team formation to all team members"""
        event_data = {
            'type': 'team_formed',
            'data': team_data,
            'timestamp': self._get_timestamp()
        }
        
        # Emit to all team members
        if 'members' in team_data:
            for member in team_data['members']:
                user_id = member.get('userId')
                if user_id:
                    self._emit_to_user(user_id, 'team_formed', event_data)
        
        # Emit to faculty for real-time updates
        self._emit_to_role('faculty', 'team_formation_update', event_data)
    
    def emit_team_updated(self, team_data: Dict[str, Any]):
        """Emit team updates to all team members"""
        event_data = {
            'type': 'team_updated',
            'data': team_data,
            'timestamp': self._get_timestamp()
        }
        
        # Emit to all team members
        if 'members' in team_data:
            for member in team_data['members']:
                user_id = member.get('userId')
                if user_id:
                    self._emit_to_user(user_id, 'team_updated', event_data)
    
    def emit_student_eligible_status_changed(self, student_data: Dict[str, Any]):
        """Emit when student becomes eligible/ineligible for team formation"""
        event_data = {
            'type': 'student_eligible_status_changed',
            'data': student_data,
            'timestamp': self._get_timestamp()
        }
        
        # Emit to the student
        user_id = student_data.get('_id') or student_data.get('userId')
        if user_id:
            self._emit_to_user(user_id, 'eligibility_changed', event_data)
        
        # Emit to faculty for real-time eligible students list updates
        self._emit_to_role('faculty', 'student_eligibility_changed', event_data)
    
    def emit_analytics_update(self, analytics_data: Dict[str, Any]):
        """Emit analytics updates to faculty"""
        event_data = {
            'type': 'analytics_update',
            'data': analytics_data,
            'timestamp': self._get_timestamp()
        }
        
        self._emit_to_role('faculty', 'analytics_update', event_data)
    
    def emit_system_notification(self, user_id: str, notification: Dict[str, Any]):
        """Emit system notifications to specific user"""
        event_data = {
            'type': 'system_notification',
            'data': notification,
            'timestamp': self._get_timestamp()
        }
        
        self._emit_to_user(user_id, 'notification', event_data)
    
    def emit_broadcast_notification(self, notification: Dict[str, Any], target_role: Optional[str] = None):
        """Emit broadcast notifications to all users or specific role"""
        event_data = {
            'type': 'broadcast_notification',
            'data': notification,
            'timestamp': self._get_timestamp()
        }
        
        if target_role:
            self._emit_to_role(target_role, 'notification', event_data)
        else:
            # Broadcast to all connected users
            socketio.emit('notification', event_data)
    
    # Private helper methods
    
    def _emit_to_user(self, user_id: str, event: str, data: Dict[str, Any]):
        """Emit event to specific user's sessions"""
        if user_id in self.connected_users:
            for session_id in self.connected_users[user_id]:
                socketio.emit(event, data, room=session_id)
    
    def _emit_to_role(self, role: str, event: str, data: Dict[str, Any]):
        """Emit event to all users with specific role"""
        # For now, emit to a role-based room
        # In production, you might want to maintain role-based user lists
        room_name = f"role_{role}"
        socketio.emit(event, data, room=room_name)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


# Global WebSocket service instance
websocket_service = WebSocketService()