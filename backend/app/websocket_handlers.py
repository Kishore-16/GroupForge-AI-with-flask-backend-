"""
WebSocket Event Handlers
Handles WebSocket connection events and real-time communication
"""

from flask_socketio import emit, join_room, leave_room, disconnect
from flask import request
from app.extensions import socketio
from app.services.websocket_service import websocket_service
import logging

logger = logging.getLogger(__name__)


@socketio.on('connect')
def handle_connect(auth):
    """Handle client connection"""
    try:
        logger.info(f"WebSocket connection attempt from {request.sid}")
        logger.info(f"Auth data: {auth}")
        
        # Get JWT token from various sources
        token = None
        
        # 1. Try auth parameter (Socket.IO auth)
        if auth and isinstance(auth, dict):
            token = auth.get('token')
            if token:
                logger.info("Token found in Socket.IO auth parameter")
        
        # 2. Try query parameters
        if not token:
            try:
                token = request.args.get('token')
                if token:
                    logger.info("Token found in query args")
            except Exception as e:
                logger.debug(f"Could not get token from query: {e}")
        
        # 3. Try headers
        if not token:
            try:
                auth_header = request.headers.get('Authorization')
                if auth_header:
                    token = auth_header
                    logger.info("Token found in Authorization header")
            except Exception as e:
                logger.debug(f"Could not get token from headers: {e}")
        
        if not token:
            logger.warning(f"WebSocket connection attempted without token from {request.sid}")
            emit('error', {'message': 'Authentication required'})
            return False
        
        logger.info(f"Attempting to authenticate user with token (length: {len(token)})")
        
        # Authenticate user
        user_id = websocket_service.authenticate_socket_user(token)
        if not user_id:
            logger.warning(f"WebSocket connection failed - invalid token from {request.sid}")
            emit('error', {'message': 'Invalid token'})
            return False
        
        logger.info(f"User {user_id} authenticated successfully")
        
        # Add user connection
        session_id = request.sid
        websocket_service.add_user_connection(user_id, session_id)
        
        # Join user-specific room
        user_room = f"user_{user_id}"
        join_room(user_room)
        websocket_service.user_rooms[user_id] = user_room
        logger.info(f"User {user_id} joined room {user_room}")
        
        # TODO: Determine user role and join role-based room
        # For now, we'll assume all users can be in a general room
        # In production, you'd fetch user role from database
        
        emit('connected', {
            'message': 'Connected successfully',
            'user_id': user_id,
            'timestamp': websocket_service._get_timestamp()
        })
        
        logger.info(f"User {user_id} connected via WebSocket")
        
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        emit('error', {'message': 'Connection failed'})
        return False


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    try:
        session_id = request.sid
        
        # Find and remove user connection
        user_id = None
        for uid, sessions in websocket_service.connected_users.items():
            if session_id in sessions:
                user_id = uid
                break
        
        if user_id:
            websocket_service.remove_user_connection(user_id, session_id)
            logger.info(f"User {user_id} disconnected from WebSocket")
        else:
            logger.info(f"Anonymous session {session_id} disconnected")
            
    except Exception as e:
        logger.error(f"WebSocket disconnection error: {e}")


@socketio.on('join_room')
def handle_join_room(data):
    """Handle user joining a specific room"""
    try:
        room = data.get('room')
        if not room:
            emit('error', {'message': 'Room name required'})
            return
        
        join_room(room)
        emit('joined_room', {
            'room': room,
            'message': f'Joined room: {room}',
            'timestamp': websocket_service._get_timestamp()
        })
        
        logger.info(f"Session {request.sid} joined room {room}")
        
    except Exception as e:
        logger.error(f"Join room error: {e}")
        emit('error', {'message': 'Failed to join room'})


@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle user leaving a specific room"""
    try:
        room = data.get('room')
        if not room:
            emit('error', {'message': 'Room name required'})
            return
        
        leave_room(room)
        emit('left_room', {
            'room': room,
            'message': f'Left room: {room}',
            'timestamp': websocket_service._get_timestamp()
        })
        
        logger.info(f"Session {request.sid} left room {room}")
        
    except Exception as e:
        logger.error(f"Leave room error: {e}")
        emit('error', {'message': 'Failed to leave room'})


@socketio.on('ping')
def handle_ping():
    """Handle ping for connection testing"""
    emit('pong', {
        'timestamp': websocket_service._get_timestamp(),
        'message': 'pong'
    })


@socketio.on('subscribe_to_updates')
def handle_subscribe_to_updates(data):
    """Handle user subscribing to specific update types"""
    try:
        update_types = data.get('types', [])
        
        # Join rooms based on subscription types
        for update_type in update_types:
            if update_type in ['team_updates', 'assessment_updates', 'profile_updates', 'notifications']:
                room = f"updates_{update_type}"
                join_room(room)
        
        emit('subscribed', {
            'types': update_types,
            'message': 'Subscribed to updates',
            'timestamp': websocket_service._get_timestamp()
        })
        
        logger.info(f"Session {request.sid} subscribed to updates: {update_types}")
        
    except Exception as e:
        logger.error(f"Subscribe error: {e}")
        emit('error', {'message': 'Failed to subscribe to updates'})


@socketio.on('get_connection_status')
def handle_get_connection_status():
    """Handle request for connection status"""
    emit('connection_status', {
        'connected': True,
        'session_id': request.sid,
        'timestamp': websocket_service._get_timestamp()
    })