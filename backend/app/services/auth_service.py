"""
Authentication Service - Handles user registration, login, and JWT token management
"""

import bcrypt
from datetime import datetime
from typing import Dict, Tuple, Optional
from pymongo import MongoClient
from flask_jwt_extended import create_access_token, create_refresh_token
import os
from dotenv import load_dotenv

load_dotenv()

# Get MongoDB connection
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['groupforge']
users_collection = db['users']


class AuthService:
    """Service for handling authentication operations"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt(rounds=10)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def register_user(
        email: str,
        password: str,
        display_name: str,
        role: str = 'student'
    ) -> Tuple[Dict, int]:
        """
        Register a new user
        Returns: (response_dict, status_code)
        """
        # Validate inputs
        if not email or not password or not display_name:
            return {
                'success': False,
                'message': 'Email, password, and name are required'
            }, 400

        # Check if user already exists
        if existing_user := users_collection.find_one({'email': email}):
            return {
                'success': False,
                'message': 'User with this email already exists'
            }, 409

        # Validate password strength
        if len(password) < 6:
            return {
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }, 400

        # Hash password
        hashed_password = AuthService.hash_password(password)

        # Create user document
        user_doc = {
            'email': email,
            'password': hashed_password,
            'displayName': display_name,
            'role': role,
            'profileCompleted': False,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
            
            # Core fields
            'institutionId': '',
            'department': '',
            
            # Student-specific fields (will be populated during profile completion)
            'major': '' if role == 'student' else None,
            'enrollmentNumber': '' if role == 'student' else None,
            'bio': '',
            'timezone': 'Asia/Kolkata',
            'selectedSkills': [] if role == 'student' else None,
            'skills': {} if role == 'student' else None,
            'latestAssessment': {} if role == 'student' else None,
            'tools': [] if role == 'student' else None,
            'githubConnected': False if role == 'student' else None,
            'githubUsername': '' if role == 'student' else None,
            'userSkills': [] if role == 'student' else None,
            'resumeUploaded': False if role == 'student' else None,
            'attendedTest': False if role == 'student' else None,
            'inTeam': False if role == 'student' else None,
            'teamId': None if role == 'student' else None,
            
            # Faculty-specific fields
            'designation': '' if role == 'faculty' else None,
            'employeeId': '' if role == 'faculty' else None,
            'contactNumber': '' if role == 'faculty' else None,
        }

        try:
            result = users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)

            # Create tokens
            access_token = create_access_token(identity=user_id)
            refresh_token = create_refresh_token(identity=user_id)

            return {
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'id': user_id,
                    'email': email,
                    'displayName': display_name,
                    'role': role
                },
                'accessToken': access_token,
                'refreshToken': refresh_token
            }, 201

        except Exception as e:
            return {
                'success': False,
                'message': f'Error registering user: {str(e)}'
            }, 500

    @staticmethod
    def login_user(email: str, password: str) -> Tuple[Dict, int]:
        """
        Login a user with email and password
        Returns: (response_dict, status_code)
        """
        # Validate inputs
        if not email or not password:
            return {
                'success': False,
                'message': 'Email and password are required'
            }, 400

        # Find user by email
        user = users_collection.find_one({'email': email})
        if not user:
            return {
                'success': False,
                'message': 'Invalid email or password'
            }, 401

        # Verify password
        if not AuthService.verify_password(password, user['password']):
            return {
                'success': False,
                'message': 'Invalid email or password'
            }, 401

        user_id = str(user['_id'])

        # Create tokens
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)

        return {
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user_id,
                'email': user['email'],
                'displayName': user['displayName'],
                'role': user.get('role', 'student'),
                'profileCompleted': user.get('profileCompleted', False)
            },
            'accessToken': access_token,
            'refreshToken': refresh_token
        }, 200

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict]:
        """Get user profile by ID"""
        from bson import ObjectId
        try:
            if user := users_collection.find_one({'_id': ObjectId(user_id)}):
                user['id'] = str(user['_id'])
                del user['password']  # Don't return password
                return user
            return None
        except Exception:
            return None

    @staticmethod
    def update_user_profile(user_id: str, update_data: Dict) -> Tuple[Dict, int]:
        """Update user profile - only allows specific fields based on role"""
        from bson import ObjectId
        try:
            # Define allowed fields for students
            ALLOWED_STUDENT_FIELDS = {
                'displayName', 'institutionId', 'department', 'major', 
                'enrollmentNumber', 'bio', 'timezone', 'selectedSkills', 
                'skills', 'latestAssessment', 'tools', 'githubConnected', 
                'githubUsername', 'userSkills', 'profileCompleted',
                'attendedTest', 'inTeam', 'teamId', 'resumeUploaded'
            }
            
            # Define allowed fields for faculty
            ALLOWED_FACULTY_FIELDS = {
                'displayName', 'institutionId', 'department', 'designation',
                'employeeId', 'contactNumber', 'timezone', 'profileCompleted'
            }
            
            # Get user to check role
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {
                    'success': False,
                    'message': 'User not found'
                }, 404
            
            # Filter update_data to only allowed fields based on role
            role = user.get('role', 'student')
            allowed_fields = ALLOWED_STUDENT_FIELDS if role == 'student' else ALLOWED_FACULTY_FIELDS
            
            # Filter out any fields not in the whitelist
            filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
            
            # Add updatedAt timestamp
            filtered_data['updatedAt'] = datetime.utcnow()
            
            result = users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': filtered_data}
            )

            if result.matched_count == 0:
                return {
                    'success': False,
                    'message': 'User not found'
                }, 404

            return {
                'success': True,
                'message': 'Profile updated successfully'
            }, 200

        except Exception as e:
            return {
                'success': False,
                'message': f'Error updating profile: {str(e)}'
            }, 500


def register_user(data):
    """Legacy function - use AuthService.register_user instead"""
    raise NotImplementedError


def login_user(data):
    """Legacy function - use AuthService.login_user instead"""
    raise NotImplementedError
