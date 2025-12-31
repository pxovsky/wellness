# backend/app.py
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError
from dotenv import load_dotenv
from models import TrainingCreateRequest, DailyLogCreateRequest, ErrorResponse
from storage import Storage
from datetime import datetime


load_dotenv()


app = Flask(__name__)


# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# CORS
CORS(app, resources={r"/*": {"origins": "*"}})


# Storage
storage = Storage()


@app.before_request
def log_request():
    logger.info(f"📥 {request.method} {request.path}")


@app.errorhandler(404)
def not_found(e): 
    return jsonify(ErrorResponse(error="Endpoint not found").model_dump()), 404


@app.errorhandler(500)
def internal_error(e): 
    logger.error(f"❌ Error: {e}")
    return jsonify(ErrorResponse(error="Internal error", detail=str(e)).model_dump()), 500


def handle_validation_error(e: ValidationError):
    errors = [f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}" for err in e.errors()]
    return jsonify({"error": "Validation error", "detail": "; ".join(errors)}), 400


@app.route('/health', methods=['GET'])
def health(): 
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()}), 200


@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    try:
        limit = request.args.get('limit', 200, type=int)
        trainings = storage.get_trainings(limit)
        logger.info(f"✅ Zwrócono {len(trainings)} treningów")
        return jsonify(trainings), 200
    except Exception as e:
        logger.error(f"❌ Błąd przy GET /api/trainings: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/trainings', methods=['POST'])
def add_training():
    try:
        data = TrainingCreateRequest(**request.json)
        logger.info(f"📝 Dodawanie treningu: {data.dt}")
        storage.add_training(**data.model_dump())
        logger.info(f"✅ Trening dodany!")
        return jsonify({"status": "ok", "message": "Training added"}), 201
    except ValidationError as e: 
        return handle_validation_error(e)
    except Exception as e: 
        logger.error(f"❌ Błąd przy POST /api/trainings: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/trainings/<int:id>', methods=['DELETE'])
def delete_training(id):
    try:
        storage.delete_training(id)
        logger.info(f"🗑️ Usunięto trening ID: {id}")
        return jsonify({"status": "ok"}), 200
    except Exception as e: 
        logger.error(f"❌ Błąd przy DELETE: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard(): 
    try:
        data = storage.get_dashboard()
        return jsonify(data), 200
    except Exception as e:
        logger.error(f"❌ Błąd przy GET /api/dashboard: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/logs', methods=['GET'])
def get_daily_logs():
    try:
        limit = request.args.get('limit', 200, type=int)
        logs = storage.get_daily_logs(limit)
        logger.info(f"✅ Zwrócono {len(logs)} logów dziennych")
        return jsonify(logs), 200
    except Exception as e:
        logger.error(f"❌ Błąd przy GET /api/daily/logs: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/reading', methods=['POST'])
def log_reading():
    try:
        data = DailyLogCreateRequest(**request.json)
        logger.info(f"📊 Dodawanie czytania: {data.date} = {data.reading_minutes} min")
        result = storage.log_reading(data.date, data.reading_minutes)
        return jsonify(result), 201
    except ValidationError as e: 
        return handle_validation_error(e)
    except Exception as e: 
        logger.error(f"❌ Błąd przy log_reading: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/water', methods=['POST'])
def log_water():
    try:
        data = DailyLogCreateRequest(**request.json)
        logger.info(f"💧 Dodawanie wody: {data.date} = {data.water_glasses} szkl.")
        result = storage.log_water(data.date, data.water_glasses)
        return jsonify(result), 201
    except ValidationError as e: 
        return handle_validation_error(e)
    except Exception as e: 
        logger.error(f"❌ Błąd przy log_water: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/kefir', methods=['POST'])
def log_kefir():
    try:
        data = DailyLogCreateRequest(**request.json)
        logger.info(f"🥛 Dodawanie kefiru: {data.date} = {data.kefir_glasses} porcji")
        result = storage.log_kefir(data.date, data.kefir_glasses)
        return jsonify(result), 201
    except ValidationError as e: 
        return handle_validation_error(e)
    except Exception as e: 
        logger.error(f"❌ Błąd przy log_kefir: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily/phone', methods=['POST'])
def log_phone():
    try:
        data = DailyLogCreateRequest(**request.json)
        logger.info(f"📵 Brak telefonu po 21: {data.date} = {data.no_phone_after_21}")
        result = storage.log_phone(data.date, data.no_phone_after_21)
        return jsonify(result), 201
    except ValidationError as e: 
        return handle_validation_error(e)
    except Exception as e: 
        logger.error(f"❌ Błąd przy log_phone: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    logger.info("🚀 Uruchamianie Flask App na 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
