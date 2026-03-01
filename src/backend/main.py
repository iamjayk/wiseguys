import os

from auth_routes import auth_bp
from db import init_db
from flask import Flask, jsonify
from flask_cors import CORS
from graphql_view import AuthenticatedGraphQLView
from schema import schema

init_db()

app = Flask(__name__)

_raw_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
)
_origins = [o.strip() for o in _raw_origins.split(",")]
CORS(
    app,
    origins=_origins,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

app.register_blueprint(auth_bp)

app.add_url_rule(
    "/graphql",
    view_func=AuthenticatedGraphQLView.as_view(
        "graphql_view",
        schema=schema,
        graphql_ide=True,
    ),
)


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
