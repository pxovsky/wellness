# 📄 QUICK REFERENCE CARD - AI Agent Cheat Sheet

Szybka ściąga dla agenta AI. Przetestuj to jako pierwszą rzecz każdego ranka.


## ✅ PRE-SESSION CHECKLIST (5 minut)

```bash
# 1. Sprawdź najnowszy kod
[ ] Pobrałem najświeższy main branch?
[ ] Git status: co się zmieniło od ostatniej sesji?
[ ] Ostatni commit: [hash - message]

# 2. Check wersji
[ ] Frontend deps: npm list --depth=0
[ ] Backend deps: pip list

# 3. Connectivity
[ ] Frontend dev server: http://localhost:5173 (czy działa?)
[ ] Backend API: http://localhost:5000/api/health (czy zwraca OK?)

# 4. Baza danych
[ ] SQLite: backend/wellness.db istnieje?
[ ] Backup istnieje? (jeśli planujemy migracje)

# 5. Messages
Gotowy! Czym się dzisiaj zajmujemy?
```


## 📚 PLIK QUICK LOOKUP

### "Muszę zmienić [X]"

| Chcę zmienić | Pliki | Key Classes/Functions |
|--------------|-------|----------------------|
| Daily log schema | `backend/models.py` | `DailyLog` class |
| Daily log API | `backend/app.py` | `@app.route('/api/daily/*')` |
| Daily log persistence | `backend/storage.py` | `daily_log_table`, `insert_daily_log()` |
| Dashboard stats | `backend/app.py`, `storage.py` | `dashboard_endpoint`, `get_stats()` |
| Training endpoint | `backend/app.py` | `@app.route('/api/trainings')` |
| Training model | `backend/models.py` | `Training` class |
| Frontend component | `frontend/src/components/` | `*.tsx` file |
| Frontend hook/logic | `frontend/src/hooks/` | `use*.ts` file |
| Styling | `frontend/src/styles/` or inline | Tailwind classes |
| API integration | `frontend/src/services/` | `api.ts` or `axios` calls |
| OCR processing | `backend/ocr_worker.py` | `extract_text_from_image()` |
| Environment config | `.env` (root) | `FLASK_*` variables |
| CORS settings | `backend/app.py` | `CORS()` call |

---

## 🏗️ ARCHITECTURE OVERVIEW

```
Frontend (http://localhost:5173)
    ↓ [Axios HTTP]
Backend API (http://localhost:5000/api/*)
    ↓ [Raw SQL / storage.py]
SQLite Database (backend/wellness.db)
```

### Data Flow Example: "User logs water"
```
1. User clicks "Add Water" button
   ↓
2. Frontend component: `WaterLogger.tsx`
   ↓
3. useWaterLog hook sends: POST /api/daily/water { glasses: 1 }
   ↓
4. Backend receives: app.py route handler
   ↓
5. Validation: Pydantic model checks input
   ↓
6. Storage: storage.py updates SQLite
   ↓
7. Response: { status: 'success', data: {...} }
   ↓
8. Frontend updates UI: streak counter +1
```

---

## 🔑 KEY CONCEPTS

### Streaks (Paski - nie łam je!)
```
Reading:      consecutive days z reading_minutes > 0
Water:        consecutive days z water_glasses > 0
Kefir:        consecutive days z kefir_glasses > 0
No Phone:     consecutive days z no_phone_after_21 = true

⚠️ BREAK STREAK = FALSE
Jeśli dzisiaj water_glasses = 0 → streak się zeruje
```

### Compliance %
```
Dzisiaj:
- Reading: 0 lub 1 ✓
- Water: 0 lub 1 ✓
- Kefir: 0 lub 1 ✓
- No Phone: 0 lub 1 ✓

Compliance % = (✓ / 4) * 100%
Przykład: 3 ze 4 = 75%
```

### Daily Log Entry
```python
class DailyLog(Base):
    date: date                  # Unikalny klucz
    reading_minutes: int        # 0+ 
    water_glasses: int          # 0+
    kefir_glasses: int          # 0+
    no_phone_after_21: bool     # true/false
    discipline_score: int       # 1-10
    mood_score: int             # 1-10
```

### Training Entry
```python
class Training(Base):
    date: date
    duration: int               # minutes
    calories: int               # burned
    hr: int                     # avg heart rate
    training_effect: float      # 0.0-5.0 scale
```

---

## 🚀 COMMON PATTERNS

### Adding New Daily Log Metric

```python
# 1. Model
class DailyLog(Base):
    new_metric: int = 0

# 2. Storage
def add_daily_log(date, new_metric):
    stmt = insert(daily_log_table).values(
        date=date,
        new_metric=new_metric
    )
    db.execute(stmt)

# 3. API Endpoint
@app.route('/api/daily/new-metric', methods=['POST'])
def log_new_metric():
    data = request.json
    add_daily_log(date.today(), data['new_metric'])
    return {"status": "success"}

# 4. Frontend Hook
const useNewMetric = () => {
  const log = async (value: number) => {
    const res = await axios.post('/api/daily/new-metric', {
      new_metric: value
    });
    return res.data;
  };
  return { log };
};

# 5. Frontend Component
function NewMetricLogger() {
  const { log } = useNewMetric();
  
  const handleLog = async (value: number) => {
    try {
      await log(value);
      showToast('Logged!', 'success');
    } catch (error) {
      showToast('Error', 'error');
    }
  };
  
  return <button onClick={() => handleLog(5)}>Log Metric</button>;
}
```

### Creating New Endpoint

```python
# Template
@app.route('/api/resource', methods=['GET', 'POST'])
def resource_handler():
    try:
        if request.method == 'GET':
            # Validate query params if needed
            # Get data from DB
            return {"status": "success", "data": result}
        
        elif request.method == 'POST':
            # Validate input
            data = ResourceInput(**request.json)
            # Save to DB
            result = db.insert(data)
            return {"status": "success", "data": result}, 201
    
    except ValidationError as e:
        return {"status": "error", "details": e.errors()}, 400
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500
```

---

## 🧪 TESTING CHECKLIST

### After Feature Implementation

```bash
[ ] Backend Unit Test
    - Input validation (valid + invalid cases)
    - Database operations
    - Edge cases

[ ] Frontend Unit Test
    - Component renders
    - User interactions work
    - Loading/error states

[ ] Integration Test
    - Frontend ↔ Backend communication
    - Data flows correctly end-to-end
    - Error handling works

[ ] Manual Testing
    - UI looks correct
    - No console errors
    - Performance is acceptable
    - Streaks not broken

[ ] Edge Cases
    - Empty data
    - Null/undefined values
    - Large numbers
    - Invalid dates
    - Network timeouts
```

---

## 🐛 DEBUGGING TIPS

### Frontend Issues

```javascript
// Check network requests
// Dev Tools → Network tab
// Look for: 4xx/5xx responses, timeouts, CORS errors

// Check component state
console.log('Debug:', { data, loading, error });

// Check API response
axios.get('/api/endpoint')
  .then(res => console.log('Response:', res.data))
  .catch(err => console.error('Error:', err.response));
```

### Backend Issues

```python
# Check logs
print(f"Debug: {variable}")

# Validate Pydantic model
try:
    data = MyModel(**input_dict)
except ValidationError as e:
    print(f"Validation error: {e.errors()}")

# Check database
from backend.storage import db
result = db.query(DailyLog).filter_by(date=date.today()).first()
print(f"DB result: {result}")
```

### CORS Issues

```bash
# Test from terminal
curl -H "Origin: http://localhost:5173" \
     http://localhost:5000/api/health

# Look for:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, DELETE
```

---

## 📊 CURL COMMANDS (Testing API)

```bash
# Health check
curl http://localhost:5000/api/health

# Get dashboard
curl http://localhost:5000/api/dashboard

# Create training
curl -X POST http://localhost:5000/api/trainings \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-31",
    "duration": 40,
    "calories": 500,
    "hr": 140,
    "training_effect": 3.5
  }'

# Get daily log
curl http://localhost:5000/api/daily/2025-12-31

# Update daily log (water)
curl -X POST http://localhost:5000/api/daily/water \
  -H "Content-Type: application/json" \
  -d '{"glasses": 1}'
```

---

## 📋 RESPONSE FORMATS

### Success Response
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "value"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "What went wrong",
  "details": {}
}
```

### List Response
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "item1" },
    { "id": 2, "name": "item2" }
  ]
}
```

---

## 🎯 BEFORE COMMITTING CODE

```bash
# Checklist
[ ] Zmiana do review: git diff
[ ] Wersje libs: cat package.json (frontend), cat requirements.txt (backend)
[ ] Tests pass: npm test (frontend), pytest (backend)
[ ] No console errors: Dev tools
[ ] No linting issues: eslint, black
[ ] Dokumentacja updated: README, code comments
[ ] Commit message: descriptive ("feat: add water tracking")
[ ] Branch name: feature/*, bugfix/*, docs/* (jeśli git convention)
```

---

## 🚨 DANGER ZONE

### Nigdy nie rob tego:

```python
# ❌ Nie manipuluj streaks bez logiki
log.water_glasses = 0  # BREAK STREAK!

# ❌ Nie commit bez testów
# ❌ Nie mieszaj różnych zmian w jednym commit
# ❌ Nie commituj plików konfiguracyjnych (.env, secrets)
# ❌ Nie pushuj bez backup bazy danych
# ❌ Nie zmieniaj schematu bez migracji
```

---

## 📞 ESCALATION PATH

Jeśli coś pójdzie nie tak:

```
1. Error? → Check logs (frontend dev tools, backend print statements)
2. Stuck? → Revert last change (git checkout -- .)
3. DB broken? → Restore backup (cp wellness.db.backup wellness.db)
4. Lost changes? → Check git history (git log, git reflog)
5. Still stuck? → Ask user for clarification
```

---

## 🎓 LEARNING RESOURCES (Quick Links)

- React patterns: https://react.dev/learn
- TypeScript types: https://www.typescriptlang.org/docs/handbook/
- Flask routing: https://flask.palletsprojects.com/en/latest/quickstart/
- Pydantic validation: https://docs.pydantic.dev/latest/concepts/models/
- SQLite queries: https://www.sqlite.org/lang_select.html
- Tailwind CSS: https://tailwindcss.com/docs

---

## 📝 SESSION LOG TEMPLATE

```markdown
## Session: [DATE] [TIME]

### Cel
[Co robiliśmy]

### Zrobione
- [ ] Task 1 - [status]
- [ ] Task 2 - [status]

### Commits
- [hash] - "message"
- [hash] - "message"

### Problemy
[Jeśli były]

### Plan na następną sesję
[Co dalej]
```

---

**Last Updated:** 2025-12-31  
**Version:** 1.0  
**Printable:** Yes - Print this page for reference! 📄
