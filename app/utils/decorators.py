def require_role(role: str):
    def wrapper(func):
        return func
    return wrapper
