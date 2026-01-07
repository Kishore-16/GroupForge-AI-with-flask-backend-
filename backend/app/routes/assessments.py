from flask import Blueprint, jsonify, request

bp = Blueprint("assessments", __name__)


@bp.post("/start")
def start_assessment():
    return jsonify({"message": "start_assessment not implemented"}), 501


@bp.post("/<session_id>/submit")
def submit_assessment(session_id: str):
    return jsonify({"message": "submit_assessment not implemented", "sessionId": session_id}), 501


@bp.post("/<session_id>/complete")
def complete_assessment(session_id: str):
    return jsonify({"message": "complete_assessment not implemented", "sessionId": session_id}), 501
