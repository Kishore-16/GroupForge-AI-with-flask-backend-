from app import create_app
from app.extensions import mongo

app = create_app()

with app.app_context():
    try:
        # Try to get server info
        info = mongo.cx.server_info()
        print("✅ MongoDB Connected Successfully!")
        print(f"MongoDB Version: {info.get('version', 'Unknown')}")
        print(f"Connection URI: {app.config.get('MONGO_URI', 'Not configured')}")
    except Exception as e:
        print("❌ MongoDB Connection Failed!")
        print(f"Error: {str(e)}")
        print(f"Attempted URI: {app.config.get('MONGO_URI', 'Not configured')}")
