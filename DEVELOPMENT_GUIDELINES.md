# 📚 Development Guidelines - Praktyczne Wskazania

Praktyczne wskazania i best practices dla rozwoju aplikacji wellness. Dokumentacja dla zarówno agenta AI, jak i ludzi-developerów.

---

## 👀 OBSERWUJ TE RZECZY

### 1. Frontend-Backend Sync

**ZAWSZE, gdy dodajesz endpoint API:**

```typescript
// Backend (Flask)
@app.route('/api/feature', methods=['POST'])
def create_feature():
    data = request.json
    # validation
    # logic
    return {"status": "success", "data": {...}}

// Frontend (React)
const useFeature = () => {
  const [data, setData] = useState(null);
  
  const create = async (input) => {
    const response = await axios.post('/api/feature', input);
    setData(response.data.data);
    return response.data;
  };
  
  return { data, create };
};
```

**Checklist:**
- [ ] Backend: endpoint ma `try-catch` i prawidłowy error response
- [ ] Backend: input jest validated przez Pydantic
- [ ] Backend: response jest typed (Pydantic model)
- [ ] Frontend: hook ma error handling
- [ ] Frontend: hook ma loading state
- [ ] Frontend: types są defined (TypeScript interfaces)
- [ ] CORS: endpoint jest dostępny z frontendu

---

### 2. Streaks - Nie Łam Ich!

**Current Streaks:**
```python
# backend/models.py
class DailyLog(Base):
    reading_minutes: int  # ← Reading streak
    water_glasses: int    # ← Water streak
    kefir_glasses: int    # ← Kefir streak
    no_phone_after_21: bool  # ← No Phone streak
    discipline_score: int  # Daily score 1-10
    mood_score: int        # Daily score 1-10
```

**ZAPAMIĘTAJ:**
- Streak = consecutive days bez przerwy
- Jeśli cokolwiek zepsuje daily log → streaks will break
- Bądź ostrożny z updates do historycznych danych
- Zawsze backupuj przed zmianą schematu

**Kiedy edytujesz daily log:**
```python
# ❌ ZŁE - może złamać streak
log.reading_minutes = 0  # user cleared it

# ✅ DOBRE - zachowaj logikę
if daily_log.reading_minutes > 0:
    update_reading_streak()
else:
    break_reading_streak()  # conscious decision
```

---

### 3. Type Safety - Frontend (TypeScript)

**ZAWSZE define types dla API responses:**

```typescript
// ❌ ZŁE
const response = await axios.get('/api/dashboard');
const stats = response.data; // any type

// ✅ DOBRE
interface DashboardStats {
  reading_streak: number;
  water_streak: number;
  kefir_streak: number;
  compliance_percent: number;
  weekly_calories: number;
}

const response = await axios.get<DashboardStats>('/api/dashboard');
const stats: DashboardStats = response.data;
```

**Components:**
```typescript
// ❌ ZŁE - props nie mają types
function TrainingCard(props) {
  return <div>{props.training.name}</div>;
}

// ✅ DOBRE - props są typed
interface TrainingCardProps {
  training: Training;
  onDelete?: (id: string) => void;
}

function TrainingCard({ training, onDelete }: TrainingCardProps) {
  return <div>{training.name}</div>;
}
```

---

### 4. Type Safety - Backend (Pydantic)

**ZAWSZE use Pydantic models:**

```python
# ❌ ZŁE
@app.route('/api/trainings', methods=['POST'])
def create_training():
    data = request.json
    # gdzieś coś może być None
    db.insert_training(data)

# ✅ DOBRE
from pydantic import BaseModel, Field

class TrainingInput(BaseModel):
    date: str
    duration: int = Field(gt=0)  # must be > 0
    calories: int = Field(gte=0)
    hr: int = Field(gte=0)
    training_effect: float = Field(ge=0.0, le=5.0)

@app.route('/api/trainings', methods=['POST'])
def create_training():
    try:
        data = TrainingInput(**request.json)  # validates!
        db.insert_training(data)
        return {"status": "success"}
    except ValidationError as e:
        return {"status": "error", "details": e.errors()}, 400
```

---

### 5. Error Handling - Backend

**NIGDY nie zwracaj raw exceptions:**

```python
# ❌ ZŁE
@app.route('/api/training/<id>', methods=['DELETE'])
def delete_training(id):
    training = db.get_training(id)  # może być None!
    db.delete_training(training)  # TypeError!

# ✅ DOBRE
@app.route('/api/training/<id>', methods=['DELETE'])
def delete_training(id):
    try:
        training = db.get_training(id)
        if not training:
            return {"status": "error", "message": "Training not found"}, 404
        
        db.delete_training(training)
        return {"status": "success", "message": "Training deleted"}
    
    except Exception as e:
        print(f"Error deleting training: {e}")  # Log for debugging
        return {"status": "error", "message": "Internal server error"}, 500
```

---

### 6. Error Handling - Frontend

**NIGDY nie assume successful response:**

```typescript
// ❌ ZŁE
const addWater = async () => {
  const response = await axios.post('/api/daily/water', { glasses: 1 });
  setWater(response.data.glasses);  // Może fail!
};

// ✅ DOBRE
const addWater = async () => {
  try {
    const response = await axios.post('/api/daily/water', { glasses: 1 });
    if (response.data.status === 'success') {
      setWater(response.data.data.glasses);
      showToast('Water logged!', 'success');
    } else {
      showToast('Failed to log water', 'error');
    }
  } catch (error) {
    console.error('Error logging water:', error);
    showToast('Network error', 'error');
  }
};
```

---

### 7. SQLite - Performance

**ZAWSZE check dla N+1 queries:**

```python
# ❌ ZŁE - N+1 problem
trainings = db.query(Training).all()  # 1 query
for training in trainings:
    user = db.query(User).filter_by(id=training.user_id).first()  # N queries!

# ✅ DOBRE - Use joins
trainings = db.query(Training).join(User).all()  # 1 query

# LUB eager load
trainings = db.query(Training).options(joinedload(Training.user)).all()
```

**SQLite-specific:**
```python
# ❌ ZŁE - synchronous Flask might block
# If operation takes 5 seconds, user waits

# ✅ DOBRE - Keep it fast
# Operations should be < 1 second ideally
# Use indexes for frequent queries

# Index example
class DailyLog(Base):
    __tablename__ = 'daily_logs'
    id = Column(Integer, primary_key=True)
    date = Column(Date, index=True)  # ← Index this for fast queries
    user_id = Column(Integer, ForeignKey('users.id'), index=True)
```

---

### 8. CORS - Zawsze Sprawdzaj

**Current CORS config:**
```python
# backend/app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["localhost:3000", "localhost:5173"]}})
```

**ZAPAMIĘTAJ:**
- Dev: `localhost:3000` i `localhost:5173`
- Prod: zmienisz to na rzeczywiste domeny
- Jeśli frontend na porcie X, a backend na Y → CORS issue

**Debugowanie CORS:**
```javascript
// Frontend - jeśli nie działa:
// 1. Check: czy backend ma CORS enabled?
curl -H "Origin: http://localhost:5173" http://localhost:5000/api/health

// 2. Check: czy response ma Access-Control-Allow-Origin header?
echo "Szukaj: Access-Control-Allow-Origin w headers"

// 3. Jeśli brak → skonfiguruj CORS na backendzieЯ
```

---

### 9. OCR - Graceful Handling

**OCR może fail na wiele sposobów:**

```python
# backend/ocr_worker.py

# ❌ ZŁE - assume zawsze sukces
def extract_text_from_image(image_path):
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)

# ✅ DOBRE - handle errors
def extract_text_from_image(image_path: str) -> tuple[bool, str]:
    try:
        # Validate image first
        if not os.path.exists(image_path):
            return False, "Image file not found"
        
        # Check file size
        file_size = os.path.getsize(image_path)
        if file_size > 10 * 1024 * 1024:  # 10MB limit
            return False, "Image too large"
        
        # Try OCR
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        
        if not text or len(text.strip()) == 0:
            return False, "Could not extract text from image"
        
        return True, text
    
    except Exception as e:
        print(f"OCR Error: {e}")
        return False, f"OCR processing failed: {str(e)}"

# Usage
@app.route('/api/ocr/receipt', methods=['POST'])
def process_receipt():
    image = request.files.get('image')
    if not image:
        return {"status": "error", "message": "No image provided"}, 400
    
    # Save temporarily
    temp_path = f"/tmp/{image.filename}"
    image.save(temp_path)
    
    # Try OCR
    success, result = extract_text_from_image(temp_path)
    
    if success:
        # Parse extracted text (nutritional info, etc)
        parsed = parse_receipt_text(result)
        return {"status": "success", "data": parsed}
    else:
        # Fallback: user must enter manually
        return {"status": "error", "message": result, "fallback": "manual_entry"}
```

---

### 10. React Optimization

**Używaj memoization dla expensive components:**

```typescript
// ❌ ZŁE - re-renders za każdym razem
function TrainingList({ trainings }) {
  return (
    <div>
      {trainings.map(training => (
        <TrainingCard key={training.id} training={training} />
      ))}
    </div>
  );
}

// ✅ DOBRE - memo prevents unnecessary re-renders
const TrainingCard = React.memo(function TrainingCard({ training }) {
  return <div>{training.name}</div>;
});

function TrainingList({ trainings }) {
  return (
    <div>
      {trainings.map(training => (
        <TrainingCard key={training.id} training={training} />
      ))}
    </div>
  );
}
```

**useCallback dla event handlers:**

```typescript
// ❌ ZŁE - new function on every render
function Dashboard() {
  const handleDelete = (id) => {
    // delete logic
  };
  
  return <TrainingList onDelete={handleDelete} />;
}

// ✅ DOBRE - stable reference
function Dashboard() {
  const handleDelete = useCallback((id: string) => {
    // delete logic
  }, []);  // Empty deps = stable across renders
  
  return <TrainingList onDelete={handleDelete} />;
}
```

---

## 💿 ENVIRONMENT VARIABLES

**Setup dla local development:**

```bash
# .env (root)
FLASK_HOST=localhost
FLASK_PORT=5000
FLASK_DEBUG=1

# .env.local (frontend root)
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=5000
```

**Production setup:**
```bash
# Inne wartości na deployment
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=0
VITE_API_URL=https://api.wellness.com
```

---

## 🚠 DATABASE BACKUP

**SQLite is a file, so backup is easy:**

```bash
# Backup całą bazę
cp backend/wellness.db backend/wellness.db.backup

# Lub skrypt (weekly)
#!/bin/bash
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp backend/wellness.db $BACKUP_DIR/wellness_$DATE.db
echo "Backup created: $BACKUP_DIR/wellness_$DATE.db"
```

**Restore:**
```bash
cp backend/wellness.db.backup backend/wellness.db
```

---

## 🔌 TESTING STRATEGY

### Unit Tests (Backend)
```python
import pytest

class TestDailyLog:
    def test_water_logged(self):
        daily_log = DailyLog(date=date.today())
        daily_log.add_water(1)
        assert daily_log.water_glasses == 1
    
    def test_invalid_water(self):
        daily_log = DailyLog(date=date.today())
        with pytest.raises(ValueError):
            daily_log.add_water(-1)  # negative!
```

### Integration Tests (Frontend + Backend)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('user can log water and see streak update', async () => {
  render(<App />);
  
  const waterButton = screen.getByRole('button', { name: /add water/i });
  fireEvent.click(waterButton);
  
  await screen.findByText(/water logged/i);
  expect(screen.getByText(/water streak: 1/i)).toBeInTheDocument();
});
```

---

## 🛡 SECURITY CONSIDERATIONS

1. **SQL Injection** - Always use parameterized queries (Pydantic handles this)
2. **XSS** - Always escape user input (React does this by default)
3. **CORS** - Only allow known origins
4. **Validation** - Validate everything (Pydantic on backend, TypeScript on frontend)
5. **Logging** - Never log sensitive data (passwords, health data)

---

## 📚 USEFUL RESOURCES

- React 18: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Flask: https://flask.palletsprojects.com
- Pydantic: https://docs.pydantic.dev
- SQLAlchemy: https://docs.sqlalchemy.org
- Tailwind CSS: https://tailwindcss.com

---

**Last Updated:** 2025-12-31  
**Version:** 1.0
