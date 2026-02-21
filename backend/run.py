from app import create_app
from app.extensions import socketio

app = create_app()

if __name__ == "__main__":
    # Use socketio.run instead of app.run for WebSocket support
    print("Starting Flask-SocketIO server on http://0.0.0.0:5000")
    print("WebSocket endpoint: ws://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
