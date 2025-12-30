import sqlite3
from dataclasses import dataclass
from datetime import datetime, date, timedelta
from typing import List, Optional


DB_PATH = "myniu.db"


@dataclass
class Training:
    id: int
    dt: str                 # ISO: YYYY-MM-DD HH:MM
    duration_min: int
    calories: int
    avg_hr: int
    max_hr: int
    training_effect: float
    notes: str


def connect():
    return sqlite3.connect(DB_PATH)


def init_db():
    with connect() as con:
        cur = con.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS trainings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dt TEXT NOT NULL,
            duration_min INTEGER NOT NULL,
            calories INTEGER NOT NULL,
            avg_hr INTEGER NOT NULL,
            max_hr INTEGER NOT NULL,
            training_effect REAL NOT NULL,
            notes TEXT DEFAULT ""
        )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_trainings_dt ON trainings(dt DESC)")
        
        # Rozszerzona tabela dla dziennych logów
        cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            did_reading INTEGER DEFAULT 0,
            reading_minutes INTEGER DEFAULT 0,
            did_kefir INTEGER DEFAULT 0,
            kefir_glasses INTEGER DEFAULT 0,
            discipline_score INTEGER DEFAULT 0,
            water_glasses INTEGER DEFAULT 0,
            no_phone_after_21 INTEGER DEFAULT 0,
            mood_score INTEGER DEFAULT 0
        )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date DESC)")
        con.commit()


def add_training(dt_iso: str, duration_min: int, calories: int, avg_hr: int, max_hr: int, training_effect: float, notes: str):
    with connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO trainings(dt, duration_min, calories, avg_hr, max_hr, training_effect, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (dt_iso, duration_min, calories, avg_hr, max_hr, training_effect, notes or "")
        )
        con.commit()


def list_trainings(limit: Optional[int] = None) -> List[Training]:
    q = """SELECT id, dt, duration_min, calories, avg_hr, max_hr, training_effect, notes
           FROM trainings ORDER BY dt DESC"""
    if limit:
        q += " LIMIT ?"
    with connect() as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        rows = cur.execute(q, (limit,) if limit else ()).fetchall()
        return [Training(
            id=r["id"],
            dt=r["dt"],
            duration_min=r["duration_min"],
            calories=r["calories"],
            avg_hr=r["avg_hr"],
            max_hr=r["max_hr"],
            training_effect=float(r["training_effect"]),
            notes=r["notes"] or ""
        ) for r in rows]


def get_stats():
    with connect() as con:
        cur = con.cursor()
        total = cur.execute("SELECT COUNT(*) FROM trainings").fetchone()[0]
        total_kcal = cur.execute("SELECT COALESCE(SUM(calories),0) FROM trainings").fetchone()[0]
        avg_hr = cur.execute("SELECT COALESCE(ROUND(AVG(avg_hr)),0) FROM trainings").fetchone()[0]
        best_effect = cur.execute("SELECT COALESCE(MAX(training_effect),0) FROM trainings").fetchone()[0]
        last = cur.execute("""
            SELECT dt, calories, avg_hr, training_effect
            FROM trainings ORDER BY dt DESC LIMIT 1
        """).fetchone()
        return {
            "total": total,
            "total_kcal": int(total_kcal),
            "avg_hr": int(avg_hr),
            "best_effect": float(best_effect),
            "last": last
        }


def delete_training(training_id: int):
    with connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM trainings WHERE id = ?", (training_id,))
        con.commit()


# ============================================================================
# DZIENNE LOGI - CZYTANIE
# ============================================================================

def log_reading_today(did_read: bool = True):
    """Oznacz dzisiaj jako 'czytałem'"""
    today = str(date.today())
    with connect() as con:
        cur = con.cursor()
        cur.execute(
            "UPDATE daily_logs SET did_reading = ? WHERE date = ?",
            (1 if did_read else 0, today)
        )
        if cur.rowcount == 0:
            cur.execute(
                "INSERT INTO daily_logs(date, did_reading, did_kefir, discipline_score, water_glasses, no_phone_after_21, mood_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (today, 1 if did_read else 0, 0, 0, 0, 0, 0)
            )
        con.commit()


def get_reading_streak() -> int:
    """Policz ile dni z rzędu czytałem"""
    with connect() as con:
        cur = con.cursor()
        rows = cur.execute(
            "SELECT date FROM daily_logs WHERE did_reading = 1 ORDER BY date DESC LIMIT 100"
        ).fetchall()
    
    if not rows:
        return 0
    
    streak = 0
    current_date = date.today()
    
    for row in rows:
        row_date = date.fromisoformat(row[0])
        if row_date == current_date or row_date == current_date - timedelta(days=1):
            streak += 1
            current_date = row_date - timedelta(days=1)
        else:
            break
    
    return streak


# ============================================================================
# DZIENNE LOGI - KEFIR
# ============================================================================

def log_kefir_today(did_drink: bool = True):
    """Oznacz dzisiaj jako 'piłem kefir'"""
    today = str(date.today())
    with connect() as con:
        cur = con.cursor()
        cur.execute(
            "UPDATE daily_logs SET did_kefir = ? WHERE date = ?",
            (1 if did_drink else 0, today)
        )
        if cur.rowcount == 0:
            cur.execute(
                "INSERT INTO daily_logs(date, did_reading, did_kefir, discipline_score, water_glasses, no_phone_after_21, mood_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (today, 0, 1 if did_drink else 0, 0, 0, 0, 0)
            )
        con.commit()


def get_kefir_streak() -> int:
    """Policz ile dni z rzędu piłem kefir"""
    with connect() as con:
        cur = con.cursor()
        rows = cur.execute(
            "SELECT date FROM daily_logs WHERE did_kefir = 1 ORDER BY date DESC LIMIT 100"
        ).fetchall()
    
    if not rows:
        return 0
    
    streak = 0
    current_date = date.today()
    
    for row in rows:
        row_date = date.fromisoformat(row[0])
        if row_date == current_date or row_date == current_date - timedelta(days=1):
            streak += 1
            current_date = row_date - timedelta(days=1)
        else:
            break
    
    return streak


# ============================================================================
# DZIENNE LOGI - NAWODNIENIE (NOWE)
# ============================================================================

def log_water_today(glasses: int = 1):
    """Dodaj ilość szklanek wody do dzisiaj"""
    today = str(date.today())
    with connect() as con:
        cur = con.cursor()
        cur.execute(
            "UPDATE daily_logs SET water_glasses = water_glasses + ? WHERE date = ?",
            (glasses, today)
        )
        if cur.rowcount == 0:
            cur.execute(
                "INSERT INTO daily_logs(date, did_reading, did_kefir, discipline_score, water_glasses, no_phone_after_21, mood_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (today, 0, 0, 0, glasses, 0, 0)
            )
        con.commit()


def get_water_today() -> int:
    """Zwróć ile szklanek wody dzisiaj"""
    today = str(date.today())
    with connect() as con:
        cur = con.cursor()
        result = cur.execute(
            "SELECT water_glasses FROM daily_logs WHERE date = ?",
            (today,)
        ).fetchone()
    return result[0] if result else 0


# ============================================================================
# DZIENNE LOGI - BRAK TELEFONU PO 21 (NOWE)
# ============================================================================

def log_no_phone_after_21(success: bool = True):
    """Zaloguj czy udało się być bez telefonu po 21:00"""
    today = str(date.today())
    with connect() as con:
        cur = con.cursor()
        cur.execute(
            "UPDATE daily_logs SET no_phone_after_21 = ? WHERE date = ?",
            (1 if success else 0, today)
        )
        if cur.rowcount == 0:
            cur.execute(
                "INSERT INTO daily_logs(date, did_reading, did_kefir, discipline_score, water_glasses, no_phone_after_21, mood_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (today, 0, 0, 0, 0, 1 if success else 0, 0)
            )
        con.commit()


def get_no_phone_after_21_streak() -> int:
    """Policz ile dni z rzędu byłem bez telefonu po 21:00"""
    with connect() as con:
        cur = con.cursor()
        rows = cur.execute(
            "SELECT date FROM daily_logs WHERE no_phone_after_21 = 1 ORDER BY date DESC LIMIT 100"
        ).fetchall()
    
    if not rows:
        return 0
    
    streak = 0
    current_date = date.today()
    
    for row in rows:
        row_date = date.fromisoformat(row[0])
        if row_date == current_date or row_date == current_date - timedelta(days=1):
            streak += 1
            current_date = row_date - timedelta(days=1)
        else:
            break
    
    return streak


# ============================================================================
# STATYSTYKI OGÓLNE
# ============================================================================

def get_weekly_calories() -> tuple:
    """Zwraca (spalone_kcal, cel_kcal) za ostatnie 7 dni"""
    week_ago = str(date.today() - timedelta(days=7))
    with connect() as con:
        cur = con.cursor()
        total = cur.execute(
            "SELECT COALESCE(SUM(calories), 0) FROM trainings WHERE dt >= ?",
            (week_ago,)
        ).fetchone()[0]
    return (int(total), 1500)  # 1500 kcal to Twój cel


def days_since_last_training() -> int:
    """Ile dni minęło od ostatniego treningu"""
    with connect() as con:
        cur = con.cursor()
        last = cur.execute(
            "SELECT dt FROM trainings ORDER BY dt DESC LIMIT 1"
        ).fetchone()
    
    if not last:
        return 999  # Nigdy nie trenował
    
    last_date = datetime.fromisoformat(last[0]).date()
    days = (date.today() - last_date).days
    return days


def get_compliance_rate(days: int = 7) -> int:
    """Compliance Rate: ile % dni spełniłem zadania (czytanie + kefir)"""
    from_date = str(date.today() - timedelta(days=days))
    
    with connect() as con:
        cur = con.cursor()
        logged_days = cur.execute(
            "SELECT COUNT(DISTINCT date) FROM daily_logs WHERE date >= ?",
            (from_date,)
        ).fetchone()[0]
        
        perfect_days = cur.execute(
            "SELECT COUNT(*) FROM daily_logs WHERE date >= ? AND did_reading = 1 AND did_kefir = 1",
            (from_date,)
        ).fetchone()[0]
    
    if logged_days == 0:
        return 0
    return int((perfect_days / logged_days) * 100)


# ============================================================================
# POBIERANIE WSZYSTKICH DZIENNYCH LOGÓW (dla frontendu)
# ============================================================================

def get_daily_logs() -> List[dict]:
    """Pobierz wszystkie dzienne logi"""
    with connect() as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        rows = cur.execute(
            "SELECT * FROM daily_logs ORDER BY date DESC"
        ).fetchall()
    
    return [dict(row) for row in rows]


def get_today_log() -> Optional[dict]:
    """Pobierz dzisiejszy log"""
    today = str(date.today())
    with connect() as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        row = cur.execute(
            "SELECT * FROM daily_logs WHERE date = ?",
            (today,)
        ).fetchone()
    
    return dict(row) if row else None
