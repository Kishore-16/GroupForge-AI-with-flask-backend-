from typing import List, Dict
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Get MongoDB connection using direct MongoClient (not Flask-PyMongo)
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['groupforge']


class TeamService:
    """
    Service layer for Team operations.
    Handles all business logic related to team formation and retrieval.
    """

    def __init__(self):
        pass

    def _get_teams_collection(self):
        """
        Get MongoDB teams collection
        """
        return db['teams']

    def _get_users_collection(self):
        """
        Get MongoDB users collection
        """
        return db['users']

    def get_eligible_students(self) -> List[Dict]:
        """
        Get all students eligible for team formation.
        Criteria: profileCompleted=true, attendedTest=true, inTeam=false
        """
        try:
            users_collection = self._get_users_collection()
            
            # Verify MongoDB connection
            if users_collection is None:
                raise RuntimeError("MongoDB users collection is not available. Check MONGO_URI configuration.")
            
            # Use flexible query to handle missing fields on legacy documents
            # $ne: true means "not equal to true" (includes false and missing fields)
            query = {
                'role': 'student',
                'profileCompleted': True,
                '$or': [
                    {'attendedTest': True},
                    {'attendedTest': {'$exists': False}}  # Include legacy users without this field
                ],
                '$or': [
                    {'inTeam': False},
                    {'inTeam': {'$exists': False}},  # Include legacy users without this field
                    {'inTeam': None}
                ]
            }
            
            # Simplified query: students with profileCompleted=true who are not in a team
            query = {
                'role': 'student',
                'profileCompleted': True,
                '$or': [
                    {'inTeam': {'$ne': True}},  # inTeam is not true (false, null, or missing)
                    {'inTeam': {'$exists': False}}  # inTeam field doesn't exist
                ]
            }
            
            students = []
            cursor = users_collection.find(query)
            
            for student in cursor:
                # Skip students who haven't completed assessment if the field exists
                attended_test = student.get('attendedTest')
                if attended_test is False:  # Only skip if explicitly False
                    continue
                    
                students.append({
                    'id': str(student['_id']),
                    'displayName': student.get('displayName', ''),
                    'email': student.get('email', ''),
                    'department': student.get('department', ''),
                    'major': student.get('major', ''),
                    'skills': student.get('skills', {}),
                    'selectedSkills': student.get('selectedSkills', []),
                    'latestAssessment': student.get('latestAssessment', {})
                })
            
            return students
            
        except Exception as e:
            print(f"Error in get_eligible_students: {str(e)}")
            raise

    def form_team(self, payload: Dict, faculty_id: str) -> Dict:
        """
        Create a new team based on payload.
        Atomically update student records to set inTeam=true and teamId.
        """

        if not payload:
            raise ValueError("Payload is required to form team")

        team_name = payload.get("teamName", "Untitled Team")
        members = payload.get("members", [])

        if not isinstance(members, list) or len(members) == 0:
            raise ValueError("Team must have at least one member")

        teams_collection = self._get_teams_collection()
        users_collection = self._get_users_collection()

        # Calculate team skill vector from member skills
        team_skill_vector = {}
        member_docs = []
        
        for member in members:
            student_id = member.get('userId') or member.get('studentId') or member.get('id')
            if not student_id:
                continue
                
            try:
                student = users_collection.find_one({'_id': ObjectId(student_id)})
                if student:
                    member_docs.append({
                        'studentId': student_id,
                        'role': member.get('role', 'member'),
                        'joinedAt': datetime.utcnow()
                    })
                    # Aggregate skills
                    student_skills = student.get('skills', {})
                    for skill, score in student_skills.items():
                        if skill not in team_skill_vector:
                            team_skill_vector[skill] = []
                        team_skill_vector[skill].append(score)
            except Exception as e:
                print(f"Error processing member {student_id}: {e}")
                continue
        
        # Calculate average for each skill
        for skill in team_skill_vector:
            scores = team_skill_vector[skill]
            team_skill_vector[skill] = sum(scores) / len(scores) if scores else 0

        # Create team document
        team_doc = {
            "teamName": team_name,
            "members": member_docs,
            "teamSkillVector": team_skill_vector,
            "status": "active",
            "createdBy": faculty_id,
            "createdAt": datetime.utcnow()
        }

        result = teams_collection.insert_one(team_doc)
        team_id = str(result.inserted_id)

        # Atomically update all student records
        for member in member_docs:
            try:
                users_collection.update_one(
                    {'_id': ObjectId(member['studentId'])},
                    {'$set': {
                        'inTeam': True,
                        'teamId': team_id,
                        'updatedAt': datetime.utcnow()
                    }}
                )
            except Exception as e:
                # Rollback: delete team and reset any updated students
                teams_collection.delete_one({'_id': result.inserted_id})
                users_collection.update_many(
                    {'teamId': team_id},
                    {'$set': {'inTeam': False, 'teamId': None}}
                )
                raise ValueError(f"Failed to update student records: {str(e)}")

        # Prepare team data for WebSocket broadcast
        team_data = {
            "teamId": team_id,
            "teamName": team_name,
            "members": [],
            "teamSkillVector": team_skill_vector,
            "status": "active",
            "createdAt": team_doc["createdAt"].isoformat(),
            "createdBy": faculty_id
        }
        
        # Enrich member data for WebSocket
        for member_doc in member_docs:
            try:
                student = users_collection.find_one({'_id': ObjectId(member_doc['studentId'])})
                if student:
                    team_data["members"].append({
                        'userId': member_doc['studentId'],
                        'studentId': member_doc['studentId'],
                        'role': member_doc.get('role', 'member'),
                        'joinedAt': member_doc.get('joinedAt').isoformat() if member_doc.get('joinedAt') else None,
                        'displayName': student.get('displayName', ''),
                        'email': student.get('email', ''),
                        'major': student.get('major', ''),
                        'department': student.get('department', ''),
                        'skills': student.get('skills', {}),
                        'githubUsername': student.get('githubUsername', '')
                    })
            except Exception:
                team_data["members"].append(member_doc)
        
        # Import websocket service here to avoid circular imports
        try:
            from app.services.websocket_service import websocket_service
            
            # Emit real-time team formation event
            websocket_service.emit_team_formed(team_data)
            
            # Emit student eligibility status changes for each team member
            for member_doc in member_docs:
                try:
                    student = users_collection.find_one({'_id': ObjectId(member_doc['studentId'])})
                    if student:
                        student_data = {
                            '_id': str(student['_id']),
                            'displayName': student.get('displayName'),
                            'email': student.get('email'),
                            'profileCompleted': student.get('profileCompleted', False),
                            'attendedTest': student.get('attendedTest', False),
                            'inTeam': student.get('inTeam', False),
                            'teamId': team_id,
                            'skills': student.get('skills', {}),
                            'eligible': False  # No longer eligible since they're in a team
                        }
                        websocket_service.emit_student_eligible_status_changed(student_data)
                except Exception:
                    pass
        except ImportError:
            # WebSocket service not available, continue without real-time updates
            pass

        return {
            "teamId": team_id,
            "teamName": team_name,
            "members": member_docs,
            "createdAt": team_doc["createdAt"].isoformat()
        }

    def list_teams(self, query: Dict = None) -> List[Dict]:
        """
        Get list of teams.
        """

        if query is None:
            query = {}

        teams_cursor = self._get_teams_collection().find(query)

        teams = []
        for team in teams_cursor:
            teams.append({
                "id": str(team["_id"]),
                "name": team.get("teamName", "Unnamed Team"),
                "members": team.get("members", []),
                "teamSkillVector": team.get("teamSkillVector", {}),
                "status": team.get("status", "active"),
                "createdBy": team.get("createdBy"),
                "createdAt": team.get("createdAt").isoformat() if team.get("createdAt") else None
            })

        return teams

    def get_team_by_id(self, team_id: str) -> Dict | None:
        """
        Get a specific team by its ID with enriched member details.
        """
        try:
            teams_collection = self._get_teams_collection()
            users_collection = self._get_users_collection()
            
            # Handle ObjectId conversion safely
            try:
                team_obj_id = ObjectId(team_id)
            except:
                return None
            
            team = teams_collection.find_one({'_id': team_obj_id})
            if not team:
                return None
            
            # Enrich member data with user profiles
            enriched_members = []
            members = team.get('members', [])
            
            if members is None:
                members = []
            
            for member in members:
                if member is None:
                    continue
                    
                student_id = member.get('studentId')
                if student_id:
                    try:
                        user = users_collection.find_one({'_id': ObjectId(student_id)})
                        if user:
                            enriched_members.append({
                                'studentId': student_id,
                                'role': member.get('role', 'member'),
                                'joinedAt': member.get('joinedAt').isoformat() if member.get('joinedAt') else None,
                                'displayName': user.get('displayName', ''),
                                'email': user.get('email', ''),
                                'major': user.get('major', ''),
                                'department': user.get('department', ''),
                                'skills': user.get('skills', {}),
                                'githubUsername': user.get('githubUsername', '')
                            })
                    except Exception as inner_e:
                        print(f"Error enriching member {student_id}: {str(inner_e)}")
                        enriched_members.append(member)
            
            return {
                "teamId": str(team["_id"]),
                "teamName": team.get("teamName"),
                "members": enriched_members,
                "teamSkillVector": team.get("teamSkillVector", {}),
                "status": team.get("status", "active"),
                "createdBy": team.get("createdBy"),
                "createdAt": team.get("createdAt").isoformat() if team.get("createdAt") else None
            }
        except Exception as e:
            print(f"Error in get_team_by_id: {str(e)}")
            raise

    def get_student_team(self, student_id: str) -> Dict | None:
        """
        Get the team that a student belongs to.
        """
        try:
            users_collection = self._get_users_collection()
            
            # Validate student_id
            if not student_id:
                print("Error: student_id is empty or None")
                return None
            
            # Convert to ObjectId and fetch user
            try:
                user_obj_id = ObjectId(student_id)
            except Exception as e:
                print(f"Invalid student_id format: {student_id}, error: {str(e)}")
                return None
            
            user = users_collection.find_one({'_id': user_obj_id})
            
            if not user:
                print(f"Student not found with id: {student_id}")
                return None
            
            # Get the team ID from user document
            team_id = user.get('teamId')
            if not team_id:
                print(f"Student {student_id} has no teamId assigned")
                return None
            
            print(f"Found team_id for student {student_id}: {team_id}")
            
            # Fetch and return full team details
            return self.get_team_by_id(team_id)
            
        except Exception as e:
            print(f"Error in get_student_team for student {student_id}: {str(e)}")
            raise
