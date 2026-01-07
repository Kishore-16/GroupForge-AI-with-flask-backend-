from flask import Blueprint, jsonify, request

bp = Blueprint("teams", __name__)


@bp.post("/form")
def form_team():
    return jsonify({"message": "form_team not implemented"}), 501


@bp.get("")
def list_teams():
    return jsonify({"message": "list_teams not implemented"}), 501
