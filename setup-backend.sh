#!/bin/bash
set -e
echo "🚀 BACKEND SETUP - Starting"
cd backend || { echo "❌ Error: backend folder not found inside current directory"; exit 1; }

# models.py
cat > models.py << 'EOF'
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class TrainingCreateRequest(BaseModel):
    dt: str = Field(..., description="DateTime in format YYYY-MM-DD HH:MM")
    duration_min: int = Field(gt=0, le=300)
    calories: int = Field(ge=0, le=10000)
    avg_hr: int = Field(gt=0, le=220)
    max_hr: int = Field(gt=0, le=220)
    training_effect: float = Field(ge=0.0, le=5.0)
    notes: str = Field(default="", max_length=1000)
    
    @validator('max_hr')
    def validate_max_hr(cls, v, values):
        if 'avg_hr' in values and v < values['avg_hr']: raise ValueError('max_hr must be >= avg_hr')
        return v
    
    @validator('dt')
    def validate_datetime(cls, v):
        try: datetime.strptime(v, '%Y-%m-%d %H:%M')
        except ValueError: raise ValueError('DateTime format error')
        return v

class TrainingResponse(BaseModel):
    id: int
    dt: str
    duration_min: int
    calories: int
    avg_hr: int
    max_hr: int
    training_effect: float
    notes: str

class DailyLogCreateRequest(BaseModel):
    date: str
    reading: Optional[int] = Field(None, ge=0, le=999)
    kefir: Optional[int] = Field(None, ge=0, le=500)

class DailyLogResponse(BaseModel):
    date: str
    reading: Optional[int]
    kefir: Optional[int]
    streak_reading: int
    streak_kefir: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
EOF

# app.py
[ -f app.py ] && cp app.py app.py.backup
cat > app.py << 'EOF'
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
EOF

# requirements.txt
cat > requirements.txt << 'EOF'
flask==2.3.3
flask-cors==4.0.0
pydantic==2.4.2
python-dotenv==1.0.0
pytesseract==0.3.10
Pillow==10.0.1
EOF

# .env
cat > .env << 'EOF'
DATABASE_URL=sqlite:///myniu.db
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
CORS_ORIGINS=http://localhost:3000
EOF

if ! grep -q "^\.env$" .gitignore 2>/dev/null; then echo ".env" >> .gitignore; fi

echo "✅ KROK 1.7: Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend setup complete!"