import os
from typing import Any

import jwt
from flask import jsonify, request
from strawberry.flask.views import GraphQLView

SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-change-in-production"


class AuthenticatedGraphQLView(GraphQLView):
    """GraphQL view that requires a valid JWT; returns 401 if missing or invalid."""

    def dispatch_request(self):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header[7:].strip()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = int(payload["sub"])
        except (jwt.InvalidTokenError, ValueError, KeyError):
            return jsonify({"error": "Unauthorized"}), 401
        request.environ["auth_user_id"] = user_id
        return super().dispatch_request()

    def get_context(self, request, response) -> Any:
        user_id = request.environ.get("auth_user_id")
        return {"request": request, "response": response, "user_id": user_id}
