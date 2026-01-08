from flask import Blueprint, jsonify, request

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user
    """
    return jsonify({
        "success": False,
        "message": "register not implemented yet"
    }), 501


@bp.route("/login", methods=["POST"])
def login():
    """
    Login user
    """
    return jsonify({
        "success": False,
        "message": "login not implemented yet"
    }), 501


@bp.route("/refresh", methods=["POST"])
def refresh():
    """
    Refresh access token
    """
    return jsonify({
        "success": False,
        "message": "refresh not implemented yet"
    }), 501
