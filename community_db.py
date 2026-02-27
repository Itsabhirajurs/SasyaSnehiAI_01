"""
Community database module — SQLite-backed farmer discussion forum.
No user accounts needed: farmer identifies with name + location.
"""

from __future__ import annotations

import sqlite3
import time
from pathlib import Path
from contextlib import contextmanager
from typing import Any, Dict, Optional


DB_PATH: str = ""   # Set from app config at startup


def init_db(db_path: str) -> None:
    """Create tables if not exist."""
    global DB_PATH
    DB_PATH = db_path

    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS posts (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT    NOT NULL,
                body        TEXT    NOT NULL,
                plant       TEXT    DEFAULT '',
                disease     TEXT    DEFAULT '',
                location    TEXT    DEFAULT '',
                state       TEXT    DEFAULT '',
                author      TEXT    NOT NULL DEFAULT 'Anonymous',
                supabase_user_id TEXT DEFAULT '',
                created_at  INTEGER NOT NULL,
                views       INTEGER DEFAULT 0,
                upvotes     INTEGER DEFAULT 0,
                status      TEXT    DEFAULT 'open',
                image_url   TEXT    DEFAULT '',
                tags        TEXT    DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS replies (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id     INTEGER NOT NULL,
                body        TEXT    NOT NULL,
                author      TEXT    NOT NULL DEFAULT 'Anonymous',
                supabase_user_id TEXT DEFAULT '',
                created_at  INTEGER NOT NULL,
                upvotes     INTEGER DEFAULT 0,
                is_solution INTEGER DEFAULT 0,
                FOREIGN KEY(post_id) REFERENCES posts(id)
            );

            CREATE TABLE IF NOT EXISTS post_votes (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                voter   TEXT    NOT NULL,
                UNIQUE(post_id, voter)
            );

            CREATE TABLE IF NOT EXISTS reply_votes (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                reply_id INTEGER NOT NULL,
                voter    TEXT    NOT NULL,
                UNIQUE(reply_id, voter)
            );

            CREATE TABLE IF NOT EXISTS profiles (
                supabase_user_id TEXT PRIMARY KEY,
                email       TEXT DEFAULT '',
                full_name   TEXT DEFAULT '',
                state       TEXT DEFAULT '',
                district    TEXT DEFAULT '',
                taluk       TEXT DEFAULT '',
                major_crop  TEXT DEFAULT '',
                phone       TEXT DEFAULT '',
                language    TEXT DEFAULT '',
                updated_at  INTEGER NOT NULL
            );
        """)

    _ensure_column("posts", "supabase_user_id", "TEXT DEFAULT ''")
    _ensure_column("replies", "supabase_user_id", "TEXT DEFAULT ''")


@contextmanager
def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _ensure_column(table: str, column: str, ddl: str) -> None:
    """Add column if missing (safe for existing DB)."""
    with _conn() as conn:
        cols = {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
        if column not in cols:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


# ─── Posts ───────────────────────────────────────────────────────────────────

def create_post(title: str, body: str, plant: str = "", disease: str = "",
                     location: str = "", state: str = "", author: str = "Anonymous",
                     image_url: str = "", tags: str = "", supabase_user_id: str = "") -> int:
    with _conn() as conn:
        cur = conn.execute(
                """INSERT INTO posts (title, body, plant, disease, location, state,
                    author, supabase_user_id, created_at, image_url, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (title, body, plant, disease, location, state, author,
                 supabase_user_id, int(time.time()), image_url, tags),
        )
        return cur.lastrowid


def get_posts(plant: str = "", state: str = "", disease: str = "",
              search: str = "", limit: int = 30, offset: int = 0) -> list[dict]:
    query = "SELECT * FROM posts WHERE 1=1"
    params: list = []

    if plant:
        query += " AND LOWER(plant) LIKE ?"
        params.append(f"%{plant.lower()}%")
    if state:
        query += " AND LOWER(state) LIKE ?"
        params.append(f"%{state.lower()}%")
    if disease:
        query += " AND LOWER(disease) LIKE ?"
        params.append(f"%{disease.lower()}%")
    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(body) LIKE ?)"
        params += [f"%{search.lower()}%", f"%{search.lower()}%"]

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params += [limit, offset]

    with _conn() as conn:
        rows = conn.execute(query, params).fetchall()

    posts = []
    for row in rows:
        p = dict(row)
        p["reply_count"] = _count_replies(p["id"])
        p["time_ago"] = _time_ago(p["created_at"])
        posts.append(p)
    return posts


def get_post(post_id: int) -> dict | None:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not row:
            return None
        p = dict(row)
        # increment views
        conn.execute("UPDATE posts SET views = views + 1 WHERE id = ?", (post_id,))
        p["time_ago"] = _time_ago(p["created_at"])
        return p


def get_similar_posts(plant: str, disease: str, limit: int = 5) -> list[dict]:
    """Find posts about the same plant/disease for the community sidebar."""
    with _conn() as conn:
        rows = conn.execute(
            """SELECT * FROM posts
               WHERE (LOWER(plant) LIKE ? OR LOWER(disease) LIKE ?)
               ORDER BY upvotes DESC, created_at DESC LIMIT ?""",
            (f"%{plant.lower()}%", f"%{disease.lower()}%", limit),
        ).fetchall()

    result = []
    for row in rows:
        p = dict(row)
        p["reply_count"] = _count_replies(p["id"])
        p["time_ago"] = _time_ago(p["created_at"])
        result.append(p)
    return result


def vote_post(post_id: int, voter_id: str) -> dict:
    with _conn() as conn:
        try:
            conn.execute("INSERT INTO post_votes (post_id, voter) VALUES (?, ?)", (post_id, voter_id))
            conn.execute("UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
            row = conn.execute("SELECT upvotes FROM posts WHERE id = ?", (post_id,)).fetchone()
            return {"voted": True, "upvotes": row["upvotes"] if row else 0}
        except sqlite3.IntegrityError:
            # Already voted — unvote
            conn.execute("DELETE FROM post_votes WHERE post_id = ? AND voter = ?", (post_id, voter_id))
            conn.execute("UPDATE posts SET upvotes = MAX(0, upvotes - 1) WHERE id = ?", (post_id,))
            row = conn.execute("SELECT upvotes FROM posts WHERE id = ?", (post_id,)).fetchone()
            return {"voted": False, "upvotes": row["upvotes"] if row else 0}


def mark_solved(post_id: int) -> None:
    with _conn() as conn:
        conn.execute("UPDATE posts SET status = 'solved' WHERE id = ?", (post_id,))


# ─── Replies ─────────────────────────────────────────────────────────────────

def add_reply(post_id: int, body: str, author: str = "Anonymous", supabase_user_id: str = "") -> int:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO replies (post_id, body, author, supabase_user_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (post_id, body, author, supabase_user_id, int(time.time())),
        )
        return cur.lastrowid


def get_replies(post_id: int) -> list[dict]:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT * FROM replies WHERE post_id = ? ORDER BY is_solution DESC, upvotes DESC, created_at ASC",
            (post_id,),
        ).fetchall()

    result = []
    for row in rows:
        r = dict(row)
        r["time_ago"] = _time_ago(r["created_at"])
        result.append(r)
    return result


def vote_reply(reply_id: int, voter_id: str) -> dict:
    with _conn() as conn:
        try:
            conn.execute("INSERT INTO reply_votes (reply_id, voter) VALUES (?, ?)", (reply_id, voter_id))
            conn.execute("UPDATE replies SET upvotes = upvotes + 1 WHERE id = ?", (reply_id,))
            row = conn.execute("SELECT upvotes FROM replies WHERE id = ?", (reply_id,)).fetchone()
            return {"voted": True, "upvotes": row["upvotes"] if row else 0}
        except sqlite3.IntegrityError:
            conn.execute("DELETE FROM reply_votes WHERE reply_id = ? AND voter = ?", (reply_id, voter_id))
            conn.execute("UPDATE replies SET upvotes = MAX(0, upvotes - 1) WHERE id = ?", (reply_id,))
            row = conn.execute("SELECT upvotes FROM replies WHERE id = ?", (reply_id,)).fetchone()
            return {"voted": False, "upvotes": row["upvotes"] if row else 0}


def mark_solution(reply_id: int, post_id: int) -> None:
    with _conn() as conn:
        conn.execute("UPDATE replies SET is_solution = 0 WHERE post_id = ?", (post_id,))
        conn.execute("UPDATE replies SET is_solution = 1 WHERE id = ?", (reply_id,))
        conn.execute("UPDATE posts SET status = 'solved' WHERE id = ?", (post_id,))


# ─── Stats ───────────────────────────────────────────────────────────────────

def get_stats() -> dict:
    with _conn() as conn:
        total_posts = conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
        total_replies = conn.execute("SELECT COUNT(*) FROM replies").fetchone()[0]
        solved = conn.execute("SELECT COUNT(*) FROM posts WHERE status='solved'").fetchone()[0]
        plants = conn.execute(
            "SELECT plant, COUNT(*) as cnt FROM posts WHERE plant != '' GROUP BY plant ORDER BY cnt DESC LIMIT 5"
        ).fetchall()
    return {
        "total_posts": total_posts,
        "total_replies": total_replies,
        "solved": solved,
        "top_crops": [dict(r) for r in plants],
    }


# ─── Profiles ───────────────────────────────────────────────────────────────

def upsert_profile(supabase_user_id: str, email: str = "", full_name: str = "",
                   state: str = "", district: str = "", taluk: str = "",
                   major_crop: str = "", phone: str = "", language: str = "") -> Dict[str, Any]:
    now = int(time.time())
    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO profiles (supabase_user_id, email, full_name, state, district, taluk, major_crop, phone, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(supabase_user_id) DO UPDATE SET
              email=excluded.email,
              full_name=excluded.full_name,
              state=excluded.state,
              district=excluded.district,
              taluk=excluded.taluk,
              major_crop=excluded.major_crop,
              phone=excluded.phone,
              language=excluded.language,
              updated_at=excluded.updated_at
            """,
            (supabase_user_id, email, full_name, state, district, taluk, major_crop, phone, language, now),
        )
    return get_profile(supabase_user_id) or {}


def get_profile(supabase_user_id: str) -> Optional[Dict[str, Any]]:
    if not supabase_user_id:
        return None
    with _conn() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE supabase_user_id = ?", (supabase_user_id,)).fetchone()
    return dict(row) if row else None


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _count_replies(post_id: int) -> int:
    with _conn() as conn:
        row = conn.execute("SELECT COUNT(*) FROM replies WHERE post_id = ?", (post_id,)).fetchone()
        return row[0] if row else 0


def _time_ago(ts: int) -> str:
    diff = int(time.time()) - ts
    if diff < 60:
        return "Just now"
    elif diff < 3600:
        return f"{diff // 60}m ago"
    elif diff < 86400:
        return f"{diff // 3600}h ago"
    elif diff < 604800:
        return f"{diff // 86400}d ago"
    else:
        return f"{diff // 604800}w ago"
