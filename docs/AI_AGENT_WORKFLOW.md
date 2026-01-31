# 🛠️ AI Agent Workflow - Szablony i Checklist'y

Kompleks praktycznych szablonów i checklistów do codziennej pracy agenta AI przy rozwijaniu aplikacji wellness.

---

## 📄 SZABLON: Propozycja Nowej Funkcji

Uytkownik najpierw:
> "Chcę dodaj funkcję [X]"

Agent odpowiada:

```markdown
## 🎯 Propozycja: [Nazwa Funkcji]

### 📝 Streszczenie
[2-3 zdania - co to robi, po co, dla kogo]

### 📊 Analiza Wpływu

**Frontend:** 
- Nowe komponenty: [component names]
- Zmieniane komponenty: [component names]
- Nowe hooks: [hook names]
- Impact: [low/medium/high]

**Backend:** 
- Nowe modele: [model names]
- Nowe endpoints: [GET/POST paths]
- Zmieniane endpoints: [GET/POST paths]
- Impact: [low/medium/high]

**Database:**
- Czy nowe tabele? [yes/no]
- Czy zmiana schematu? [yes/no]
- Migracja danych? [yes/no]

**Breaking Changes:**
- [list lub "Brak"]

### 🏗️ Plan Implementacji

**Krok 1: Backend Models** (Pydantic)
```python
# nowy model / zmiana
```

**Krok 2: Backend Storage** (SQLite)
```python
# nowe queries lub zmiana
```

**Krok 3: Backend Endpoints** (Flask)
```python
# nowy endpoint
```

**Krok 4: Frontend Hooks** (React Hooks)
```typescript
// nowy hook
```

**Krok 5: Frontend Components** (React Components)
```typescript
// nowy komponent lub zmiana
```

**Krok 6: UI Integration** (Tailwind CSS)
- Gdzie będzie wyświetlane?
- Jakie interakcje?

### ⚠️ Potencjalne Problemy
1. **Problem:** [opis]
   **Rozwiązanie:** [propozycja]
2. ...

### 🤬 Edge Cases
- Nowy użytkownik bez historii: [obsługa]
- Błąd walidacji OCR: [obsługa]
- Conflict z existing streaks: [obsługa]
- ...

### ✅ Success Criteria
- [ ] API endpoint zwraca poprawne dane
- [ ] Frontend wyświetla dane bez błędów
- [ ] Streaks nie zostają złamane
- [ ] OCR gracefully fallback'a na manual entry
- [ ] Wszystkie input fieldy są validated
- [ ] CORS nie blokuje requestów
- [ ] SQLite queries są optimized

### 🤔 Pytania przed Implementacją
1. Czy dobrze zrozumiałem wymagania?
2. Czy wszystkie stakeholder'y zgadzają się z planem?
3. Czy są dodatkowe constraints (performance, accessibility)?
4. Czy chcesz incremental deployment czy wszystko naraz?

**Czy chcesz bym to zaimplementował? [TAK/NIE/ZMIENIĆ]
```

---

## 📃 SZABLON: Bugfix / Performance Improvement

Użytkownik mówi:
> "Jest bug z [X]" lub "Optimize [X]"

Agent odpowiada:

```markdown
## 🐛 Bug / ⚡ Performance: [Opis]

### 📍 Problem
**Rejestracja:** [skąd wiadomo o problemie?]
**Objawy:** [co obserwuje użytkownik?]
**Severity:** [Low/Medium/High/Critical]
**Frequency:** [Always/Sometimes/Rare]

### 🔍 Root Cause Analysis
[Analiza - gdzie i dlaczego się to dzieje]

**Plik/Funkcja:** `path/to/file.py` or `src/components/File.tsx`
**Linia:** [number]
**Aktualny kod:**
```python
# lub typescript
# pokazanie problematycznego kodu
```

### 🛠️ Proponowane Rozwiązanie

**Zmiana 1:** [opis zmianę]
```python
# Przed
old_code()

# Po
new_code()
```

**Zmiana 2:** ...

### 🔍 Impact
- Performance gain: [x% faster / reduced memory by y]
- Kod jest teraz: [cleaner/safer/more readable]
- Backward compatible: [yes/no]

### ✅ Jak Sprawdzić
1. [Kroki do reprodukcji problemu]
2. [Jak widać że jest fixed]
3. [Performance before/after (jeśli applicable)]

**Czy chcesz bym to zaimplementował? [TAK/NIE]
```

---

## 🔍 SZABLON: Code Review / Refactoring

Agent proaktywnie:
> "Widzę miejsce na ulepszzenie w [plik]"

Agent proponuje:

```markdown
## 🛠️ Refactoring Propozycja: [Opis]

### 📌 Current State
**Plik:** `path/to/file`
**Problem:** [dlaczego warto refactor]
**Benefit:** [co zyska]

### 📗 Aktualny kod
```typescript
// obecna implementacja
```

### 🎯 Proponowana zmiana
```typescript
// nowa implementacja
```

### 📊 Porównanie
| Aspekt | Przed | Po |
|--------|-------|-----|
| Readability | Trudne do czytania | Jasne i intuicyjne |
| Performance | O(n²) | O(n) |
| Maintainability | ... | ... |
| Type Safety | ... | ... |

### ⚠️ Risk Assessment
**Risk Level:** Low / Medium / High
- [potencjalne problemy]

### ✅ Test Cases
```typescript
// testy które sprawdzą że refactor jest OK
test('...', () => {
  expect(...).toBe(...);
});
```

**Czy chcesz bym to zrefactor'ował? [TAK/NIE]
```

---

## ✅ CHECKLIST: Przed Każdą Zmianą

### Faza 1: Przygotowanie (Agent robi ZAWSZE)
- [ ] Pobrałem najnowszy kod z `main` branch
- [ ] Przeanalizowałem `package.json` i `requirements.txt` - version check
- [ ] Przeczytałem ostatnie 5-10 commitów
- [ ] Sprawdziłem czy są otwarte PRs dotyczące tego
- [ ] Przejrzałem istniejące implementation (czy już coś podobnego jest?)
- [ ] Sprawdziłem aktualną strukturę plików

### Faza 2: Analiza (Agent robi ZAWSZE)
- [ ] Zidentyfikowałem wszystkie pliki które będą zmieniane
- [ ] Zmapowałem zależności między plikami
- [ ] Sprawdziłem czy zmiana jest backward compatible
- [ ] Przeanalizowałem potencjalne konflikty
- [ ] Zidentyfikowałem edge cases
- [ ] Sprawdziłem performance implications

### Faza 3: Planowanie (Agent robi ZAWSZE)
- [ ] Napisałem plan w formacie: Cel → Pliki → Kroki → Testy
- [ ] Wyjaśniłem wpływ na Frontend i Backend
- [ ] Wyjaśniłem wpływ na Database (jeśli jest)
- [ ] Zidentyfikowałem nowe dependencies (jeśli są)
- [ ] Zaproponowałem testowanie strategy
- [ ] **Poprosiłem o potwierdzenie przed kodem**

### Faza 4: Implementacja (Tylko jeśli user powiedział TAK)
- [ ] Strukturyzuję zmiany logicznie
- [ ] Pokazuję PRZED i PO dla każdego chunka
- [ ] Dodaję inline komentarze dla skomplikowanych części
- [ ] Zachowuję istniejące style i konwencje
- [ ] Nie robię unrequested improvements
- [ ] Testuję mentalne (flood my brain z test cases)

### Faza 5: Validacja (Agent robi ZAWSZE)
- [ ] Sprawdzam Type Safety (TypeScript/Pydantic)
- [ ] Sprawdzam Error Handling (try-catch, null checks)
- [ ] Sprawdzam SQL Injection risks (jeśli SQLite)
- [ ] Sprawdzam CORS implications (jeśli API change)
- [ ] Sprawdzam Performance (N+1 queries, memoization)
- [ ] Sprawdzam Accessibility (jeśli UI change)
- [ ] Sprawdzam czy Streaks/Compliance nie są złamane

### Faza 6: Dokumentacja (Agent robi ZAWSZE)
- [ ] Dodaję komentarze do nowego kodu
- [ ] Updateuję README (jeśli nowe setup wymagane)
- [ ] Updateuję ENV VARIABLES (jeśli nowe)
- [ ] Zaproponuję API documentation update (jeśli nowy endpoint)
- [ ] Wyjaśniam jak testować tę zmianę

---

## 📚 DAILY AGENT CHECKLIST

Agent KAŻDEGO RANKA powinien:

```markdown
### 🌆 Poniedziałek [DATE]

**Przygotowanie Kontekstu:**
- [ ] Pobrałem najnowszy kod z `main` branch
- [ ] Przeczytałem commitami z ostatnich [X] godzin
- [ ] Sprawdziłem czy są nowe PRs
- [ ] Sprawdziłem czy sa nowe issues
- [ ] Przejrzałem ostatnie zmiany w schemie/strukturze

**Raport Stanu:**
- Liczba otwartych issues: [N]
- Liczba otwartych PRs: [N]
- Ostatni commit: [hash] [message]
- Ostatnia zmiana: [co zostało zmienione]

**Dostępny do Pracy:**
✅ Agent gotowy do współpracy

**Czym chcesz się dzisiaj zająć?**
- Nowa feature?
- Bug fix?
- Performance improvement?
- Code review?
- Dokumentacja?
```

---

## 🤬 TROUBLESHOOTING SCENARIOS

### Scenariusz 1: "Nie potrafię znaleźć w pliku [X]"

**Agent robi:**
1. Pobieram najnowszy plik z `main` branch
2. Jeśli zawsze nie znajdę → zapytuję użytkownika
   ```
   "Nie mogę znaleźć [X] w [plik]. Możliwe że:
   - Plik został zrefactorowany
   - Funkcja ma inną nazwę
   - Jest w innym pliku
   
   Czy możesz pokazać gdzie to jest teraz?"
   ```

### Scenariusz 2: "Plik się zmienił od kiedy ostatnio go widziałem"

**Agent robi:**
1. Pobieram najnowszą wersję
2. Porównuję z tym co miałem
3. Analizuję co się zmieniło
4. Updatowuję moją wiedzę
5. Jeśli zmiana wpływa na moją proponowaną zmianę → informuję użytkownika

### Scenariusz 3: "Breaking change w API - co teraz?"

**Agent robi:**
1. Informuję użytkownika **NATYCHMIAST**
2. Wyjaśniam co się złamało
3. Pokazuję wszystkie miejsca które będą affected
4. Proponuję migration strategy
5. Oferuję pomoc w update'cie kodu

### Scenariusz 4: "Performance jest słaby"

**Agent robi:**
1. Przeanalizuję które operacje są wolne
2. Sprawdzę czy są N+1 queries
3. Sprawdzę czy są unnecessary re-renders
4. Zaproponuję konkretne optimizacje
5. Poddam do testowania

---

## 📧 KOMUNIKACJA Z UŻYTKOWNIKIEM

### Kiedy Pytać
```
✅ Zawsze pytaj gdy:
- Nowa feature
- Breaking change
- Significant refactor
- Performance/security risk
- Niebezpieczeństwo złamania istniejącej funkcjonalności
```

### Kiedy Nie Pytać
```
✅ Nie pytaj gdy:
- Bug fix (mały, Obviously broken code)
- Formatting / linting fixes
- Komentarz improvement
- Dodanie nieśmiertelnych test cases
```

### Tone of Voice
- 🤝 Partnerski, nie paternalistyczny
- 🎯 Konkretny, nie abstrakcyjny
- 📊 Data-driven, nie spekulacyjny
- 🛡️ Bezpieczny, nie riskowy

### Format Komunikacji
```
Po polsku, czytelny, ze strukturą:
- Nagłówkami
- Bullet pointami
- Kod blokami
- Tabelami gdzie potrzeba
```

---

## 📈 TRACKING PROGRESS

Użytkownik może trackować postęp poprzez:

1. **Git Commits** - każda zmiana = commit
2. **Git History** - `git log` pokazuje co się zmienia
3. **GitHub Issues** - track'uj taskami
4. **AI Agent Raports** - summary na koniec sesji

---

## 🎯 SUCCESS METRICS

Agent jest "dobry" gdy:

- ✅ Zero unintended breakage
- ✅ Kod jest czysty i consistent
- ✅ Zero SQL injections / security issues
- ✅ Performance nie pogorszył się
- ✅ User experience się poprawił
- ✅ Dokumentacja jest aktualna
- ✅ Testy pass
- ✅ Komunikacja była jasna

---

**Last Updated:** 2025-12-31  
**Version:** 1.0
