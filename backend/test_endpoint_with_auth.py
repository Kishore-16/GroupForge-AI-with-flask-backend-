"""
Test script to verify the fixed eligible-students endpoint with authentication
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from flask import Flask
import json

def test_endpoint_with_auth():
    """Test the endpoint within Flask app context"""
    
    print("=" * 60)
    print("Testing /api/teams/eligible-students Endpoint")
    print("=" * 60)
    
    app = create_app()
    client = app.test_client()
    
    # Step 1: Register a test faculty user (or try to)
    print("\n1. Registering/Logging in as faculty...")
    test_email = 'testfaculty@test.com'
    test_password = 'TestPassword123!'
    
    # Try to register
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': test_email,
            'password': test_password,
            'displayName': 'Test Faculty',
            'role': 'faculty'
        }),
        content_type='application/json'
    )
    
    if register_response.status_code == 201:
        print(f"   ✓ New user registered")
    elif register_response.status_code == 400:
        print(f"   ⚠ User already exists, proceeding to login")
    
    # Login to get JWT token
    print("\n2. Logging in to get JWT token...")
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({'email': test_email, 'password': test_password}),
        content_type='application/json'
    )
    
    if login_response.status_code == 200:
        login_data = json.loads(login_response.data)
        token = login_data.get('accessToken') or login_data.get('access_token')
        print(f"   ✓ Login successful! Got JWT token")
        print(f"   Token preview: {token[:50] if token else 'None'}...")
    else:
        print(f"   ❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.data.decode()}")
        return
    
    # Step 3: Call eligible-students endpoint
    print("\n3. Calling /api/teams/eligible-students...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = client.get('/api/teams/eligible-students', headers=headers)
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = json.loads(response.data)
        print(f"   ✓ SUCCESS!")
        print(f"\n   Response:")
        print(f"   - Success: {data.get('success')}")
        print(f"   - Count: {data.get('count')}")
        print(f"   - Students found: {len(data.get('data', []))}")
        
        if data.get('data'):
            print(f"\n   Sample students:")
            for i, student in enumerate(data['data'][:3]):
                print(f"   [{i+1}] {student.get('displayName')} ({student.get('email')})")
                print(f"       Department: {student.get('department')}")
                print(f"       Skills: {list(student.get('skills', {}).keys())}")
    else:
        print(f"   ❌ Request failed!")
        print(f"   Response: {response.data.decode()}")

if __name__ == "__main__":
    test_endpoint_with_auth()
