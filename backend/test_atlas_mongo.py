import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from workspace root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Get MongoDB URI from environment
mongo_uri = os.getenv('MONGO_URI')
print(f"Using MongoDB URI: {mongo_uri}")

# Test connection
from pymongo import MongoClient

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Trigger a connection to validate
    server_info = client.server_info()
    print("✅ MongoDB Atlas Connected Successfully!")
    print(f"MongoDB Version: {server_info.get('version', 'Unknown')}")
    print(f"Server: {server_info.get('ok', 'N/A')}")
    client.close()
except Exception as e:
    print("❌ MongoDB Atlas Connection Failed!")
    print(f"Error: {str(e)}")
