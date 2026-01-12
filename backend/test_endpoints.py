"""
Quick test script to verify backend endpoints are working
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['groupforge']
users_collection = db['users']

# Check for eligible students
query = {
    'role': 'student',
    'profileCompleted': True,
    'attendedTest': True,
    'inTeam': False
}

eligible_count = users_collection.count_documents(query)
print(f"✓ Found {eligible_count} eligible students")

# Show details of eligible students
for student in users_collection.find(query):
    print(f"  - {student.get('displayName', 'Unknown')} ({student.get('email')})")
    print(f"    Profile Completed: {student.get('profileCompleted')}")
    print(f"    Attended Test: {student.get('attendedTest')}")
    print(f"    In Team: {student.get('inTeam')}")
    print(f"    Skills: {student.get('skills', {})}")
    print()

# Check all students
all_students = users_collection.count_documents({'role': 'student'})
print(f"\n✓ Total students: {all_students}")

# Check students by status
profile_incomplete = users_collection.count_documents({
    'role': 'student',
    'profileCompleted': False
})
print(f"  - Profile incomplete: {profile_incomplete}")

test_not_taken = users_collection.count_documents({
    'role': 'student',
    'profileCompleted': True,
    'attendedTest': False
})
print(f"  - Profile complete but test not taken: {test_not_taken}")

already_in_team = users_collection.count_documents({
    'role': 'student',
    'inTeam': True
})
print(f"  - Already in team: {already_in_team}")
