"""Query the SQLite DB from the command line. No sqlite3 CLI needed.

  python query_db.py                        # list all titles
  python query_db.py "SELECT * FROM titles WHERE type = 'movie'"
"""
import sys
from db import get_connection

def main():
    default_sql = "SELECT id, type, name, year, year_end, description FROM titles ORDER BY type, year"
    sql = sys.argv[1] if len(sys.argv) > 1 else default_sql
    with get_connection() as conn:
        conn.row_factory = lambda c, r: dict(zip([x[0] for x in c.description], r))
        rows = conn.execute(sql).fetchall()
    for row in rows:
        print(row)
    print(f"\n({len(rows)} row(s))")

if __name__ == "__main__":
    main()
