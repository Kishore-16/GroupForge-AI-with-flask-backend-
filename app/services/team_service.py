from typing import List, Dict
from datetime import datetime

from app.extensions import mongo


class TeamService:
    """
    Service layer for Team operations.
    Handles all business logic related to team formation and retrieval.
    """

    def __init__(self):
        pass  # DO NOT access mongo here (important)

    def _get_collection(self):
        """
        Safely get MongoDB collection after app is initialized
        """
        return mongo.db.teams

    def form_team(self, payload: Dict) -> Dict:
        """
        Create a new team based on payload.
        """

        if not payload:
            raise ValueError("Payload is required to form team")

        team_name = payload.get("teamName", "Untitled Team")
        members = payload.get("members", [])

        if not isinstance(members, list) or len(members) == 0:
            raise ValueError("Team must have at least one member")

        team_doc = {
            "teamName": team_name,
            "members": members,
            "createdAt": datetime.utcnow()
        }

        result = self._get_collection().insert_one(team_doc)

        return {
            "teamId": str(result.inserted_id),
            "teamName": team_name,
            "members": members,
            "createdAt": team_doc["createdAt"].isoformat()
        }

    def list_teams(self, query: Dict = None) -> List[Dict]:
        """
        Get list of teams.
        """

        if query is None:
            query = {}

        teams_cursor = self._get_collection().find(query)

        teams = []
        for team in teams_cursor:
            teams.append({
                "teamId": str(team["_id"]),
                "teamName": team.get("teamName"),
                "members": team.get("members", []),
                "createdAt": team.get("createdAt").isoformat() if team.get("createdAt") else None
            })

        return teams
