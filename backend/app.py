import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError
from dotenv import load_dotenv
from models import TrainingCreateRequest, DailyLogCreateRequest, ErrorResponse
from storage import Storage
from datetime import datetime

load_dotenv()
app = Flask(__name__)
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=[origin.strip() for origin in cors_origins])
storage = Storage()

@app.errorhandler(404)
def not_found(e): return jsonify(ErrorResponse(error="Endpoint not found").dict()), 404
@app.errorhandler(500)
def internal_error(e): return jsonify(ErrorResponse(error="Internal error", detail=str(e)).dict()), 500

def handle_validation_error(e: ValidationError):
    errors = [f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}" for err in e.errors()]
    return jsonify({"error": "Validation error", "detail": "; ".join(errors)}), 400

@app.route('/health', methods=['GET'])
def health(): return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()}), 200

@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    limit = request.args.get('limit', 200, type=int)
    return jsonify(storage.get_trainings(limit)), 200

@app.route('/api/trainings', methods=['POST'])
def add_training():
    try:
        data = TrainingCreateRequest(**request.json)
        storage.add_training(**data.dict())
        return jsonify({"status": "ok"}), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/trainings/<int:id>', methods=['DELETE'])
def delete_training(id):
    try:
        storage.delete_training(id)
        return jsonify({"status": "ok"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard(): return jsonify(storage.get_dashboard()), 200

@app.route('/api/daily/logs', methods=['GET'])
def get_daily_logs():
    limit = request.args.get('limit', 200, type=int)
    return jsonify(storage.get_daily_logs(limit)), 200

@app.route('/api/daily/reading', methods=['POST'])
def log_reading():
    try:
        data = DailyLogCreateRequest(**request.json)
        return jsonify(storage.log_reading(data.date, data.reading)), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/daily/kefir', methods=['POST'])
def log_kefir():
    try:
        data = DailyLogCreateRequest(**request.json)
        return jsonify(storage.log_kefir(data.date, data.kefir)), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host=os.getenv('FLASK_HOST', '0.0.0.0'), port=int(os.getenv('FLASK_PORT', 5000)), debug=os.getenv('FLASK_DEBUG', 'False')=='True')
