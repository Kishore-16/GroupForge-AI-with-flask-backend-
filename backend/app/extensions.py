from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_socketio import SocketIO

cors = CORS()
jwt = JWTManager()
mongo = PyMongo()
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode='eventlet',
    logger=True,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25
)
