from flask import Flask, jsonify, request
from flask_cors import CORS
import storage

app = Flask(__name__)
CORS(app)

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    try:
        stats = storage.get_stats()
        reading_streak = storage.get_reading_streak()
        kefir_streak = storage.get_kefir_streak()
        compliance = storage.get_compliance_rate(days=7)
        days_idle = storage.days_since_last_training()
        weekly_kcal, weekly_goal = storage.get_weekly_calories()
        
        return jsonify({
            'total': stats['total'],
            'total_kcal': stats['total_kcal'],
            'avg_hr': stats['avg_hr'],
            'best_effect': stats['best_effect'],
            'last': stats['last'],
            'reading_streak': reading_streak,
            'kefir_streak': kefir_streak,
            'compliance': compliance,
            'days_idle': days_idle,
            'weekly_kcal': weekly_kcal,
            'weekly_goal': weekly_goal
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    try:
        limit = request.args.get('limit', 200, type=int)
        trainings = storage.list_trainings(limit=limit)
        return jsonify([{
            'id': t.id,
            'dt': t.dt,
            'duration_min': t.duration_min,
            'calories': t.calories,
            'avg_hr': t.avg_hr,
            'max_hr': t.max_hr,
            'training_effect': t.training_effect,
            'notes': t.notes
        } for t in trainings])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trainings', methods=['POST'])
def add_training():
    try:
        data = request.json
        storage.add_training(
            dt_iso=data['dt'],
            duration_min=data['duration_min'],
            calories=data['calories'],
            avg_hr=data['avg_hr'],
            max_hr=data['max_hr'],
            training_effect=data['training_effect'],
            notes=data.get('notes', '')
        )
        return jsonify({'status': 'ok'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/trainings/<int:training_id>', methods=['DELETE'])
def delete_training(training_id):
    try:
        storage.delete_training(training_id)
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily/reading', methods=['POST'])
def log_reading():
    try:
        storage.log_reading_today(did_read=True)
        return jsonify({'status': 'ok'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily/kefir', methods=['POST'])
def log_kefir():
    try:
        storage.log_kefir_today(did_drink=True)
        return jsonify({'status': 'ok'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    storage.init_db()
    app.run(host='0.0.0.0', port=5000, debug=False)
