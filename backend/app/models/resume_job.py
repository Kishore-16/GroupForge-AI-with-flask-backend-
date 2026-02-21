from datetime import datetime
from typing import Any, Dict


STATUS_VALUES = {"queued", "processing", "done", "error"}


def default_resume_job() -> Dict[str, Any]:
    return {
        "userId": None,
        "filePath": None,
        "status": "queued",
        "result": None,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
