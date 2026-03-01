import re
import os
from datetime import datetime, timezone, timedelta

import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from db import create_user, get_user_by_email

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-change-in-production"
JWT_EXPIRY_MINUTES = int(os.environ.get("JWT_EXPIRY_MINUTES", 60 * 24 * 7))  # 7 days


def _user_to_json(row: dict) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "displayName": row["display_name"],
        "avatarUrl": row.get("avatar_url"),
        "bio": row.get("bio"),
        "createdAt": row["created_at"],
    }


def _create_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "exp": now + timedelta(minutes=JWT_EXPIRY_MINUTES),
        "iat": now,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("displayName") or "").strip()
    avatar_url = (data.get("avatarUrl") or "").strip() or None
    bio = (data.get("bio") or "").strip() or None

    if not email or not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "Invalid email"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if not display_name:
        return jsonify({"error": "Display name is required"}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    password_hash = generate_password_hash(password, method="scrypt")
    user = create_user(
        email=email,
        password_hash=password_hash,
        display_name=display_name,
        avatar_url=avatar_url,
        bio=bio,
    )
    token = _create_token(user["id"])
    return jsonify({"token": token, "user": _user_to_json(user)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    safe_user = {
        "id": user["id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "avatar_url": user.get("avatar_url"),
        "bio": user.get("bio"),
        "created_at": user["created_at"],
    }
    token = _create_token(user["id"])
    return jsonify({"token": token, "user": _user_to_json(safe_user)}), 200
