from typing import List, Dict
from datetime import datetime
from bson import ObjectId

from app.extensions import mongo


class TeamService:
    """
    Service layer for Team operations.
    Handles all business logic related to team formation and retrieval.
    """

    def __init__(self):
        pass  # DO NOT access mongo here (important)

    def _get_teams_collection(self):
        """
        Safely get MongoDB teams collection after app is initialized
        """
        return mongo.db.teams

    def _get_users_collection(self):
        """
        Safely get MongoDB users collection after app is initialized
        """
        return mongo.db.users

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
                "teamId": str(team["_id"]),
                "teamName": team.get("teamName"),
                "members": team.get("members", []),
                "teamSkillVector": team.get("teamSkillVector", {}),
                "status": team.get("status", "active"),
                "createdBy": team.get("createdBy"),
                "createdAt": team.get("createdAt").isoformat() if team.get("createdAt") else None
            })

        return teams
