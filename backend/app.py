import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
import storage

app = Flask(__name__)

# CORS - allow frontend on localhost:3000 (or any port during dev)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:*"])

# Initialize database on startup
@app.before_request
def init():
    """Initialize database before first request"""
    try:
        storage.init_db()
    except Exception as e:
        print(f"Database initialization error: {e}")


# ========== DASHBOARD ==========

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard stats and streaks"""
    try:
        stats = storage.get_stats()
        weekly_kcal, weekly_goal = storage.get_weekly_calories()

        return jsonify({
            "stats": stats,
            "streaks": {
                "reading": storage.get_reading_streak(),
                "kefir": storage.get_kefir_streak(),
                "water": storage.get_water_streak(),
            },
            "compliance": storage.get_compliance_rate(days=7),
            "weekly_calories": {
                "current": weekly_kcal,
                "goal": weekly_goal,
            },
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== TRAININGS ==========

@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    """Get all trainings"""
    try:
        limit = request.args.get('limit', 200, type=int)
        trainings = storage.get_trainings(limit=limit)
        return jsonify({
            "trainings": trainings,
            "count": len(trainings),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/trainings', methods=['POST'])
def add_training():
    """Add new training"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        # Validate required fields
        required = ['date', 'duration_min', 'calories', 'avg_hr', 'max_hr', 'training_effect']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        training_id = storage.add_training(
            date=data['date'],
            duration_min=data['duration_min'],
            calories=data['calories'],
            avg_hr=data['avg_hr'],
            max_hr=data['max_hr'],
            training_effect=data['training_effect'],
            notes=data.get('notes', '')
        )

        return jsonify({
            "status": "success",
            "training_id": training_id,
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 409  # Conflict (date already exists)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/trainings/<int:training_id>', methods=['GET'])
def get_training(training_id):
    """Get single training by ID"""
    try:
        training = storage.get_training(training_id)
        if not training:
            return jsonify({"error": "Training not found"}), 404
        return jsonify(training), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/trainings/<int:training_id>', methods=['DELETE'])
def delete_training(training_id):
    """Delete training by ID"""
    try:
        success = storage.delete_training(training_id)
        if not success:
            return jsonify({"error": "Training not found"}), 404
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== DAILY LOGS ==========

@app.route('/api/daily/reading', methods=['POST'])
def log_reading():
    """Log reading for a day"""
    try:
        data = request.json
        if not data or 'date' not in data or 'minutes' not in data:
            return jsonify({"error": "Missing date or minutes"}), 400

        storage.log_reading(data['date'], data['minutes'])
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/water', methods=['POST'])
def log_water():
    """Log water glasses for a day"""
    try:
        data = request.json
        if not data or 'date' not in data or 'glasses' not in data:
            return jsonify({"error": "Missing date or glasses"}), 400

        storage.log_water(data['date'], data['glasses'])
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/kefir', methods=['POST'])
def log_kefir():
    """Log kefir glasses for a day"""
    try:
        data = request.json
        if not data or 'date' not in data or 'glasses' not in data:
            return jsonify({"error": "Missing date or glasses"}), 400

        storage.log_kefir(data['date'], data['glasses'])
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/no_phone_after_21', methods=['POST'])
def log_no_phone_after_21():
    """Log no phone after 21:00 for a day"""
    try:
        data = request.json
        if not data or 'date' not in data or 'success' not in data:
            return jsonify({"error": "Missing date or success"}), 400

        success = 1 if data['success'] else 0
        storage.log_no_phone_after_21(data['date'], success)
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/<log_date>', methods=['GET'])
def get_daily_log(log_date):
    """Get daily log for specific date"""
    try:
        log = storage.get_daily_log(log_date)
        if not log:
            return jsonify({
                "date": log_date,
                "reading_minutes": 0,
                "water_glasses": 0,
                "kefir_glasses": 0,
                "no_phone_after_21": 0,
                "discipline_score": None,
                "mood_score": None,
            }), 200

        return jsonify(log), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily', methods=['GET'])
def get_daily_logs_range():
    """Get daily logs for date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            return jsonify({"error": "Missing start_date or end_date"}), 400

        logs = storage.get_daily_logs(start_date, end_date)
        return jsonify({
            "logs": logs,
            "count": len(logs),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== HEALTH CHECK ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"}), 200


# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


# ========== MAIN ==========

if __name__ == '__main__':
    # Initialize database before starting server
    storage.init_db()

    # Start Flask app
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"Starting Flask app on {host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)
