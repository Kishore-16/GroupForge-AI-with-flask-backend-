from typing import Dict, Tuple
from datetime import datetime
from bson import ObjectId
from app.extensions import mongo


class AssessmentService:
    """Service for handling assessment operations"""

    def __init__(self):
        pass

    def _get_users_collection(self):
        """Safely get MongoDB users collection after app is initialized"""
        return mongo.db.users

    def complete_assessment(
        self,
        user_id: str,
        skills: Dict[str, float],
        overall_score: float = 0
    ) -> Tuple[Dict, int]:
        """
        Complete assessment for a student.
        Updates user profile with skills, sets attendedTest=true, 
        and creates latestAssessment record.
        
        Args:
            user_id: Student's user ID
            skills: Dict of skill_name -> score (0-100)
            overall_score: Overall assessment score
            
        Returns:
            (response_dict, status_code)
        """
        try:
            users_collection = self._get_users_collection()
            
            # Get user to verify they exist and are a student
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {
                    'success': False,
                    'message': 'User not found'
                }, 404
            
            if user.get('role') != 'student':
                return {
                    'success': False,
                    'message': 'Only students can complete assessments'
                }, 403
            
            if not user.get('profileCompleted'):
                return {
                    'success': False,
                    'message': 'Profile must be completed before taking assessment'
                }, 403
            
            # Prepare update data
            current_time = datetime.utcnow()
            
            update_data = {
                'skills': skills,
                'latestAssessment': {
                    'score': overall_score,
                    'takenAt': current_time
                },
                'attendedTest': True,
                'updatedAt': current_time
            }
            
            # Update user document
            result = users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {
                    'success': False,
                    'message': 'Failed to update assessment'
                }, 500
            
            # Emit real-time updates
            assessment_data = {
                'userId': user_id,
                'displayName': user.get('displayName'),
                'skills': skills,
                'overallScore': overall_score,
                'attendedTest': True,
                'profileCompleted': user.get('profileCompleted', False)
            }
            
            # Import websocket service here to avoid circular imports
            try:
                from app.services.websocket_service import websocket_service
                
                # Emit to the user who completed assessment
                websocket_service.emit_assessment_completed(user_id, assessment_data)
                
                # Check if user becomes eligible for teams and emit status change
                profile_completed = user.get('profileCompleted', False)
                if profile_completed:  # Now both profile and assessment are complete
                    # Get updated user data for eligibility broadcast
                    updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
                    if updated_user:
                        student_data = {
                            '_id': str(updated_user['_id']),
                            'displayName': updated_user.get('displayName'),
                            'email': updated_user.get('email'),
                            'profileCompleted': updated_user.get('profileCompleted', False),
                            'attendedTest': updated_user.get('attendedTest', False),
                            'inTeam': updated_user.get('inTeam', False),
                            'skills': updated_user.get('skills', {}),
                            'eligible': (updated_user.get('profileCompleted', False) and 
                                       updated_user.get('attendedTest', False) and 
                                       not updated_user.get('inTeam', False))
                        }
                        websocket_service.emit_student_eligible_status_changed(student_data)
            except ImportError:
                # WebSocket service not available, continue without real-time updates
                pass
            
            return {
                'success': True,
                'message': 'Assessment completed successfully',
                'data': {
                    'skills': skills,
                    'overallScore': overall_score,
                    'attendedTest': True
                }
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error completing assessment: {str(e)}'
            }, 500


def start_assessment(user_id: str, skill_version: str | None = None):
    raise NotImplementedError


def submit_assessment(session_id: str, responses):
    raise NotImplementedError
