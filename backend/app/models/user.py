from datetime import datetime
from typing import Any, Dict


def default_user() -> Dict[str, Any]:
    return {
        "uid": None,
        "email": None,
        "displayName": None,
        "photoURL": None,
        "role": None,
        "institutionId": None,
        "profileCompleted": False,
        "skills": {},
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
