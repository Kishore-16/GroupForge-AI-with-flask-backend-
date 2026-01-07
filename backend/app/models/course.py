from datetime import datetime
from typing import Any, Dict


def default_course() -> Dict[str, Any]:
    return {
        "institutionId": None,
        "name": None,
        "code": None,
        "department": None,
        "semester": None,
        "facultyId": None,
        "enrolledStudents": [],
        "teams": [],
        "createdAt": datetime.utcnow(),
        "status": "active",
    }
