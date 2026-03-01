import json
import os
import sqlite3
from pathlib import Path

DATABASE_PATH = os.environ.get("DATABASE_PATH") or str(
    Path(__file__).parent / "characters.db"
)

# Seed: gangster/crime movies and TV (type, name, year, year_end, description, poster_url, cast_json)
SEED_TITLES = [
    ("movie", "The Godfather", 1972, None, "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.", None, '["Marlon Brando", "Al Pacino", "James Caan"]'),
    ("movie", "The Godfather Part II", 1974, None, "The early life and career of Vito Corleone and his son Michael's rise to power.", None, '["Al Pacino", "Robert De Niro", "Robert Duvall"]'),
    ("movie", "Scarface", 1983, None, "In 1980 Miami, a determined Cuban immigrant takes over a drug cartel and succumbs to greed.", None, '["Al Pacino", "Michelle Pfeiffer", "Steven Bauer"]'),
    ("movie", "Goodfellas", 1990, None, "The story of Henry Hill and his life in the mob, from childhood to the witness protection program.", None, '["Robert De Niro", "Ray Liotta", "Joe Pesci"]'),
    ("movie", "Casino", 1995, None, "A tale of greed, deception, money, power, and murder in Las Vegas.", None, '["Robert De Niro", "Sharon Stone", "Joe Pesci"]'),
    ("movie", "Donnie Brasco", 1997, None, "An FBI undercover agent infiltrates the Bonanno crime family in New York.", None, '["Al Pacino", "Johnny Depp", "Michael Madsen"]'),
    ("movie", "The Departed", 2006, None, "An undercover cop and a mole in the police attempt to identify each other in Boston's Irish mafia.", None, '["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"]'),
    ("movie", "The Irishman", 2019, None, "A hitman recalls his possible involvement in the disappearance of Jimmy Hoffa.", None, '["Robert De Niro", "Al Pacino", "Joe Pesci"]'),
    ("tv", "The Sopranos", 1999, 2007, "New Jersey mob boss Tony Soprano balances family life with the criminal organization he runs.", None, '["James Gandolfini", "Edie Falco", "Michael Imperioli"]'),
    ("tv", "Boardwalk Empire", 2010, 2014, "Politician Nucky Thompson runs Atlantic City during Prohibition.", None, '["Steve Buscemi", "Kelly Macdonald", "Michael Shannon"]'),
]


def get_connection():
    return sqlite3.connect(DATABASE_PATH)


def init_db() -> None:
    """Create tables: drop legacy characters, ensure users and titles exist; seed titles if empty."""
    with get_connection() as conn:
        conn.execute("DROP TABLE IF EXISTS characters")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                bio TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS titles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL CHECK (type IN ('movie', 'tv')),
                name TEXT NOT NULL,
                year INTEGER NOT NULL,
                year_end INTEGER,
                description TEXT,
                poster_url TEXT,
                cast_json TEXT NOT NULL DEFAULT '[]'
            )
        """)
        conn.commit()
        cursor = conn.execute("SELECT COUNT(*) FROM titles")
        if cursor.fetchone()[0] == 0:
            conn.executemany(
                """INSERT INTO titles (type, name, year, year_end, description, poster_url, cast_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                SEED_TITLES,
            )
            conn.commit()


def _title_row_to_dict(row: dict) -> dict:
    out = dict(row)
    try:
        out["cast"] = json.loads(out.pop("cast_json", "[]") or "[]")
    except (json.JSONDecodeError, KeyError):
        out["cast"] = []
    if "year_end" in out and out["year_end"] is None:
        out["year_end"] = None
    return out


def get_all_titles(type_filter: str | None = None) -> list[dict]:
    """Return all titles as list of dicts; optional type_filter 'movie' or 'tv'."""
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        if type_filter:
            cursor = conn.execute(
                """SELECT id, type, name, year, year_end, description, poster_url, cast_json
                   FROM titles WHERE type = ? ORDER BY year, name""",
                (type_filter,),
            )
        else:
            cursor = conn.execute(
                """SELECT id, type, name, year, year_end, description, poster_url, cast_json
                   FROM titles ORDER BY type, year, name"""
            )
        return [_title_row_to_dict(dict(row)) for row in cursor.fetchall()]


def get_title_by_id(title_id: int) -> dict | None:
    """Return one title dict or None."""
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            """SELECT id, type, name, year, year_end, description, poster_url, cast_json
               FROM titles WHERE id = ?""",
            (title_id,),
        )
        row = cursor.fetchone()
        return _title_row_to_dict(dict(row)) if row else None


def create_title(
    type: str,
    name: str,
    year: int,
    year_end: int | None = None,
    description: str | None = None,
    poster_url: str | None = None,
    cast: list[str] | None = None,
) -> dict:
    """Insert title and return full title dict."""
    cast_json = json.dumps(cast or [])
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            """INSERT INTO titles (type, name, year, year_end, description, poster_url, cast_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (type, name, year, year_end, description, poster_url, cast_json),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, type, name, year, year_end, description, poster_url, cast_json FROM titles WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return _title_row_to_dict(dict(row))


def update_title(
    title_id: int,
    type: str | None = None,
    name: str | None = None,
    year: int | None = None,
    year_end: int | None = None,
    description: str | None = None,
    poster_url: str | None = None,
    cast: list[str] | None = None,
) -> dict | None:
    """Update title by id; only provided fields are updated. Returns updated dict or None."""
    existing = get_title_by_id(title_id)
    if not existing:
        return None
    type_ = type if type is not None else existing["type"]
    name_ = name if name is not None else existing["name"]
    year_ = year if year is not None else existing["year"]
    year_end_ = year_end if year_end is not None else existing.get("year_end")
    description_ = description if description is not None else existing.get("description")
    poster_url_ = poster_url if poster_url is not None else existing.get("poster_url")
    cast_ = cast if cast is not None else existing.get("cast", [])
    cast_json = json.dumps(cast_)
    with get_connection() as conn:
        conn.execute(
            """UPDATE titles SET type = ?, name = ?, year = ?, year_end = ?, description = ?, poster_url = ?, cast_json = ?
               WHERE id = ?""",
            (type_, name_, year_, year_end_, description_, poster_url_, cast_json, title_id),
        )
        conn.commit()
    return get_title_by_id(title_id)


def delete_title(title_id: int) -> bool:
    """Delete title by id. Returns True if deleted."""
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM titles WHERE id = ?", (title_id,))
        conn.commit()
        return cursor.rowcount > 0


def update_user(
    user_id: int,
    display_name: str | None = None,
    avatar_url: str | None = None,
    bio: str | None = None,
) -> dict | None:
    """Update user profile; only provided fields are updated. Returns updated user dict (no password_hash) or None."""
    existing = get_user_by_id(user_id)
    if not existing:
        return None
    display_name_ = display_name if display_name is not None else existing["display_name"]
    avatar_url_ = avatar_url if avatar_url is not None else existing.get("avatar_url")
    bio_ = bio if bio is not None else existing.get("bio")
    with get_connection() as conn:
        conn.execute(
            "UPDATE users SET display_name = ?, avatar_url = ?, bio = ? WHERE id = ?",
            (display_name_, avatar_url_, bio_, user_id),
        )
        conn.commit()
    return get_user_by_id(user_id)


def create_user(
    email: str,
    password_hash: str,
    display_name: str,
    avatar_url: str | None = None,
    bio: str | None = None,
) -> dict:
    """Insert user and return dict with id, email, display_name, avatar_url, bio, created_at (no password_hash)."""
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            """INSERT INTO users (email, password_hash, display_name, avatar_url, bio)
               VALUES (?, ?, ?, ?, ?)""",
            (email, password_hash, display_name, avatar_url or None, bio or None),
        )
        conn.commit()
        user_id = cursor.lastrowid
        row = conn.execute(
            "SELECT id, email, display_name, avatar_url, bio, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        return dict(row)


def get_user_by_id(user_id: int) -> dict | None:
    """Return user dict (id, email, display_name, avatar_url, bio, created_at) or None."""
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            "SELECT id, email, display_name, avatar_url, bio, created_at FROM users WHERE id = ?",
            (user_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def get_user_by_email(email: str) -> dict | None:
    """Return full user row including password_hash, or None."""
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            "SELECT id, email, password_hash, display_name, avatar_url, bio, created_at FROM users WHERE email = ?",
            (email,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None
