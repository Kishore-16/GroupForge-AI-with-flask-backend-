from datetime import datetime
from typing import Any, Dict, List


def default_assessment_session() -> Dict[str, Any]:
    return {
        "userId": None,
        "type": None,
        "questions": [],
        "responses": [],
        "currentQuestionIndex": 0,
        "skillVersion": None,
        "status": "active",
        "startedAt": datetime.utcnow(),
        "completedAt": None,
    }


def default_assessment_record() -> Dict[str, Any]:
    return {
        "sessionId": None,
        "skillProfile": {},
        "createdAt": datetime.utcnow(),
    }
