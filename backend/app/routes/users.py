from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Get MongoDB connection
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['groupforge']
users_collection = db['users']

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id: str):
    """
    Get user profile by ID
    """
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Convert ObjectId to string and remove password
        user['id'] = str(user['_id'])
        del user['_id']
        if 'password' in user:
            del user['password']

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching user: {str(e)}"
        }), 500


@bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id: str):
    """
    Update user profile
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Only allow users to update their own profile
        if current_user_id != user_id:
            return jsonify({
                "success": False,
                "message": "Unauthorized to update this profile"
            }), 403

        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Remove fields that shouldn't be updated
        if '_id' in data:
            del data['_id']
        if 'password' in data:
            del data['password']
        if 'email' in data:
            del data['email']

        # Add updated timestamp
        data['updatedAt'] = datetime.utcnow()

        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )

        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Profile updated successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating profile: {str(e)}"
        }), 500


@bp.route("/<user_id>/skill-status", methods=["GET"])
@jwt_required()
def skill_status(user_id: str):
    """
    Get user's skill status
    """
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "userId": user_id,
            "skillVersion": user.get('skillVersion'),
            "updatedAt": user.get('updatedAt'),
            "stale": False
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching skill status: {str(e)}"
        }), 500

