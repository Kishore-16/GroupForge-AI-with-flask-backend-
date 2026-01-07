from flask import Blueprint, jsonify, request

bp = Blueprint("auth", __name__)


@bp.post("/register")
def register():
    return jsonify({"message": "register not implemented"}), 501


@bp.post("/login")
def login():
    return jsonify({"message": "login not implemented"}), 501


@bp.post("/refresh")
def refresh():
    return jsonify({"message": "refresh not implemented"}), 501
