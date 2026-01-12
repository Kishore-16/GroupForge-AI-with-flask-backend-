"""
Test script to debug the eligible-students endpoint
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.services.team_service import TeamService

def test_eligible_students():
    """Test the get_eligible_students method directly"""
    
    print("=" * 60)
    print("Testing Eligible Students Endpoint")
    print("=" * 60)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        from app.extensions import mongo
        
        # Check MongoDB connection
        print("\n1. Checking MongoDB connection...")
        try:
            if mongo.db is None:
                print("   ❌ ERROR: mongo.db is None")
                print("   MONGO_URI:", app.config.get('MONGO_URI'))
                return
            else:
                print("   ✓ MongoDB connected:", mongo.db)
        except Exception as e:
            print(f"   ❌ MongoDB connection error: {e}")
            return
        
        # Check collections
        print("\n2. Checking collections...")
        try:
            collections = mongo.db.list_collection_names()
            print(f"   Available collections: {collections}")
            
            if 'users' in collections:
                user_count = mongo.db.users.count_documents({})
                print(f"   ✓ Users collection exists with {user_count} documents")
            else:
                print("   ❌ Users collection does NOT exist")
        except Exception as e:
            print(f"   ❌ Error listing collections: {e}")
            import traceback
            traceback.print_exc()
        
        # Test the service method
        print("\n3. Testing get_eligible_students()...")
        try:
            team_service = TeamService()
            students = team_service.get_eligible_students()
            
            print(f"   ✓ SUCCESS: Found {len(students)} eligible students")
            
            if students:
                print(f"\n   Sample student data:")
                for i, student in enumerate(students[:3]):  # Show first 3
                    print(f"   [{i+1}] {student.get('displayName')} ({student.get('email')})")
                    print(f"       Skills: {list(student.get('skills', {}).keys())}")
            else:
                print("   ⚠ No eligible students found")
                
                # Check why
                print("\n   Checking all students...")
                all_students = list(mongo.db.users.find({'role': 'student'}))
                print(f"   Total students: {len(all_students)}")
                
                if all_students:
                    print("\n   Student statuses:")
                    for student in all_students[:5]:  # Show first 5
                        print(f"   - {student.get('email')}:")
                        print(f"     profileCompleted: {student.get('profileCompleted')}")
                        print(f"     attendedTest: {student.get('attendedTest')}")
                        print(f"     inTeam: {student.get('inTeam')}")
                        
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_eligible_students()
