def start_assessment(user_id: str, skill_version: str | None = None):
    raise NotImplementedError


def submit_assessment(session_id: str, responses):
    raise NotImplementedError


def complete_assessment(session_id: str):
    raise NotImplementedError
