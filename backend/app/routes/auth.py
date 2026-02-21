from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from ..services.auth_service import AuthService

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user
    Expected JSON body:
    {
        "email": "user@example.com",
        "password": "password123",
        "displayName": "John Doe",
        "role": "student" (optional, defaults to "student")
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        email = data.get('email')
        password = data.get('password')
        display_name = data.get('displayName')
        role = data.get('role', 'student')

        result, status_code = AuthService.register_user(
            email=email,
            password=password,
            display_name=display_name,
            role=role
        )

        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500


@bp.route("/login", methods=["POST"])
def login():
    """
    Login user
    Expected JSON body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        email = data.get('email')
        password = data.get('password')

        result, status_code = AuthService.login_user(email=email, password=password)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500


@bp.route("/refresh", methods=["POST"])
def refresh():
    """
    Refresh access token using refresh token
    Expected header: Authorization: Bearer <refresh_token>
    """
    try:
        # get_jwt_identity requires the token to be valid
        identity = get_jwt_identity()
        
        # Create new access token
        access_token = create_access_token(identity=identity)

        return jsonify({
            "success": True,
            "message": "Token refreshed successfully",
            "accessToken": access_token
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Invalid refresh token: {str(e)}"
        }), 401


@bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get current user profile
    Requires valid access token in Authorization header
    """
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_user_by_id(user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500


@bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update current user profile
    Requires valid access token in Authorization header
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Remove sensitive fields from update
        if 'password' in data:
            del data['password']
        if 'email' in data:
            del data['email']  # Email should not be changed this way
        if '_id' in data:
            del data['_id']

        result, status_code = AuthService.update_user_profile(user_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500
