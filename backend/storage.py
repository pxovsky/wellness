import sqlite3
from dataclasses import dataclass
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple

DB_PATH = "wellness.db"


@dataclass
class Training:
    id: int
    date: str  # ISO: YYYY-MM-DD HH:MM
    duration_min: int
    calories: int
    avg_hr: int
    max_hr: int
    training_effect: float
    notes: str


@dataclass
class DailyLog:
    date: str  # ISO: YYYY-MM-DD
    reading_minutes: int
    water_glasses: int
    kefir_glasses: int
    no_phone_after_21: int  # 1 = yes, 0 = no
    discipline_score: Optional[int] = None
    mood_score: Optional[int] = None


def connect():
    """Open database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database with all required tables"""
    with connect() as con:
        cur = con.cursor()

        # Trainings table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS trainings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                duration_min INTEGER NOT NULL,
                calories INTEGER NOT NULL,
                avg_hr INTEGER NOT NULL,
                max_hr INTEGER NOT NULL,
                training_effect REAL NOT NULL,
                notes TEXT DEFAULT ''
            )
        """)

        # Daily logs table (health habits)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
                date TEXT PRIMARY KEY,
                reading_minutes INTEGER DEFAULT 0,
                water_glasses INTEGER DEFAULT 0,
                kefir_glasses INTEGER DEFAULT 0,
                no_phone_after_21 INTEGER DEFAULT 0,
                discipline_score INTEGER,
                mood_score INTEGER
            )
        """)

        con.commit()


# ========== TRAININGS ==========

def add_training(date: str, duration_min: int, calories: int, avg_hr: int, max_hr: int, training_effect: float, notes: str = "") -> int:
    """Add new training, return training ID"""
    with connect() as con:
        cur = con.cursor()
        try:
            cur.execute("""
                INSERT INTO trainings (date, duration_min, calories, avg_hr, max_hr, training_effect, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (date, duration_min, calories, avg_hr, max_hr, training_effect, notes))
            con.commit()
            return cur.lastrowid
        except sqlite3.IntegrityError:
            # Training for this date already exists
            raise ValueError(f"Training for date {date} already exists")


def get_trainings(limit: int = 200) -> List[dict]:
    """Get all trainings (most recent first)"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT id, date, duration_min, calories, avg_hr, max_hr, training_effect, notes
            FROM trainings
            ORDER BY date DESC
            LIMIT ?
        """, (limit,))
        return [dict(row) for row in cur.fetchall()]


def get_training(training_id: int) -> Optional[dict]:
    """Get single training by ID"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT id, date, duration_min, calories, avg_hr, max_hr, training_effect, notes
            FROM trainings
            WHERE id = ?
        """, (training_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def delete_training(training_id: int) -> bool:
    """Delete training by ID"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM trainings WHERE id = ?", (training_id,))
        con.commit()
        return cur.rowcount > 0


def get_last_training_date() -> Optional[str]:
    """Get date of last training (most recent)"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("SELECT date FROM trainings ORDER BY date DESC LIMIT 1")
        row = cur.fetchone()
        return row[0] if row else None


# ========== DAILY LOGS ==========

def log_reading(reading_date: str, minutes: int) -> None:
    """Log reading for a day"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            INSERT INTO daily_logs (date, reading_minutes)
            VALUES (?, ?)
            ON CONFLICT(date) DO UPDATE SET reading_minutes = ?
        """, (reading_date, minutes, minutes))
        con.commit()


def log_water(water_date: str, glasses: int) -> None:
    """Log water glasses for a day"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            INSERT INTO daily_logs (date, water_glasses)
            VALUES (?, ?)
            ON CONFLICT(date) DO UPDATE SET water_glasses = ?
        """, (water_date, glasses, glasses))
        con.commit()


def log_kefir(kefir_date: str, glasses: int) -> None:
    """Log kefir glasses for a day"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            INSERT INTO daily_logs (date, kefir_glasses)
            VALUES (?, ?)
            ON CONFLICT(date) DO UPDATE SET kefir_glasses = ?
        """, (kefir_date, glasses, glasses))
        con.commit()


def log_no_phone_after_21(log_date: str, success: int) -> None:
    """Log no phone after 21:00 for a day (1 = success, 0 = failed)"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            INSERT INTO daily_logs (date, no_phone_after_21)
            VALUES (?, ?)
            ON CONFLICT(date) DO UPDATE SET no_phone_after_21 = ?
        """, (log_date, success, success))
        con.commit()


def get_daily_log(log_date: str) -> Optional[dict]:
    """Get daily log for specific date"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT date, reading_minutes, water_glasses, kefir_glasses, no_phone_after_21, discipline_score, mood_score
            FROM daily_logs
            WHERE date = ?
        """, (log_date,))
        row = cur.fetchone()
        return dict(row) if row else None


def get_daily_logs(start_date: str, end_date: str) -> List[dict]:
    """Get daily logs for date range"""
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT date, reading_minutes, water_glasses, kefir_glasses, no_phone_after_21, discipline_score, mood_score
            FROM daily_logs
            WHERE date BETWEEN ? AND ?
            ORDER BY date DESC
        """, (start_date, end_date))
        return [dict(row) for row in cur.fetchall()]


# ========== STATS & STREAKS ==========

def days_since_last_training() -> int:
    """Days since last training (0 if today, 1 if yesterday, etc.)"""
    last_date = get_last_training_date()
    if not last_date:
        return 999  # No trainings yet

    last_date_obj = datetime.fromisoformat(last_date).date()
    today = date.today()
    delta = (today - last_date_obj).days
    return delta


def get_reading_streak() -> int:
    """Count consecutive days with reading (from today backwards)"""
    streak = 0
    current_date = date.today()

    with connect() as con:
        cur = con.cursor()
        while True:
            date_str = current_date.isoformat()
            cur.execute("SELECT reading_minutes FROM daily_logs WHERE date = ?", (date_str,))
            row = cur.fetchone()

            if row and row[0] > 0:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

    return streak


def get_kefir_streak() -> int:
    """Count consecutive days with kefir (from today backwards)"""
    streak = 0
    current_date = date.today()

    with connect() as con:
        cur = con.cursor()
        while True:
            date_str = current_date.isoformat()
            cur.execute("SELECT kefir_glasses FROM daily_logs WHERE date = ?", (date_str,))
            row = cur.fetchone()

            if row and row[0] > 0:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

    return streak


def get_water_streak() -> int:
    """Count consecutive days with water goal met (from today backwards)"""
    streak = 0
    current_date = date.today()
    WATER_GOAL = 6  # 6 glasses

    with connect() as con:
        cur = con.cursor()
        while True:
            date_str = current_date.isoformat()
            cur.execute("SELECT water_glasses FROM daily_logs WHERE date = ?", (date_str,))
            row = cur.fetchone()

            if row and row[0] >= WATER_GOAL:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

    return streak


def get_compliance_rate(days: int = 7) -> int:
    """Percentage of days with at least one activity logged"""
    with connect() as con:
        cur = con.cursor()

        # Count days with any activity
        start_date = (date.today() - timedelta(days=days)).isoformat()
        end_date = date.today().isoformat()

        cur.execute("""
            SELECT COUNT(*) FROM daily_logs
            WHERE date BETWEEN ? AND ?
            AND (reading_minutes > 0 OR water_glasses > 0 OR kefir_glasses > 0 OR no_phone_after_21 = 1)
        """, (start_date, end_date))
        active_days = cur.fetchone()[0]

    if days == 0:
        return 0
    return int((active_days / days) * 100)


def get_weekly_calories() -> Tuple[int, int]:
    """Get total calories this week and weekly goal"""
    start_date = (date.today() - timedelta(days=7)).isoformat()
    end_date = date.today().isoformat()

    with connect() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT COALESCE(SUM(calories), 0) FROM trainings
            WHERE date BETWEEN ? AND ?
        """, (start_date, end_date))
        total = cur.fetchone()[0]

    weekly_goal = 1500  # Example: 1500 kcal per week
    return int(total), weekly_goal


def get_stats() -> dict:
    """Get overall dashboard stats"""
    with connect() as con:
        cur = con.cursor()

        # Total trainings
        cur.execute("SELECT COUNT(*) FROM trainings")
        total_trainings = cur.fetchone()[0]

        # Total calories (all time)
        cur.execute("SELECT COALESCE(SUM(calories), 0) FROM trainings")
        total_calories = cur.fetchone()[0]

        # Average HR
        cur.execute("SELECT AVG(avg_hr) FROM trainings WHERE avg_hr > 0")
        avg_hr = cur.fetchone()[0]
        avg_hr = int(avg_hr) if avg_hr else 0

        # Max HR
        cur.execute("SELECT MAX(max_hr) FROM trainings")
        max_hr = cur.fetchone()[0] or 0

        # Average training effect
        cur.execute("SELECT AVG(training_effect) FROM trainings")
        avg_effect = cur.fetchone()[0]
        avg_effect = float(avg_effect) if avg_effect else 0.0

    return {
        "total_trainings": total_trainings,
        "total_calories": int(total_calories),
        "avg_hr": avg_hr,
        "max_hr": max_hr,
        "avg_training_effect": round(avg_effect, 2),
        "days_without_training": days_since_last_training(),
    }
