from datetime import datetime
from typing import Any, Dict, List


def default_team() -> Dict[str, Any]:
    return {
        "name": None,
        "courseId": None,
        "projectId": None,
        "members": [],
        "formationMethod": "manual",
        "createdAt": datetime.utcnow(),
        "createdBy": None,
        "status": "draft",
        "balanceScore": 0,
        "aiRationale": None,
    }


def default_team_member(user_id: str, role: str, skill_snapshot: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "userId": user_id,
        "displayName": None,
        "role": role,
        "skillSnapshot": skill_snapshot,
        "joinedAt": datetime.utcnow(),
    }
