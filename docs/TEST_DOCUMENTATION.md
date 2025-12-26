# Test Dokumentation - Film Kompass

## A. Testplanung

### A.1 Umfang

In diesem Meilenstein werden sowohl **manuelle Black-Box-Systemtests** als auch **automatisierte Unit- und Integrationstests** durchgeführt. Getestet werden die zentralen Use Cases der Web-App:

| Use Case | Beschreibung |
|----------|-------------|
| **UC-1** | Benutzerregistrierung und Anmeldung (über Supabase-Auth, inkl. E-Mail-Verifizierung) |
| **UC-2** | Filmsuche und -filter (Titel, Genre, Jahr, Paginierung) |
| **UC-3** | Film Details (Anzeige der Filminformationen) |
| **UC-4** | Zu Favoriten hinzufügen (Add to Favorites) |
| **UC-5** | AI Recommendation System (KI-gestützte Filmempfehlungen) |
| **UC-6** | Freundesystem (Arkadaş Ekleme / Friend System) |
| **UC-7** | Gemeinsame Listen (Ortak Liste / Shared Lists) |

> **Neu implementiert:** Automatisierte Tests mit **Vitest** und **React Testing Library**

### A.2 Testauswahl

Es werden die wichtigsten Szenarien aus allen Use Cases getestet:

**UC-1 (Manuell):**
- Erfolgreiche Registrierung & Login
- Fehlerfälle (falsches Passwort, existente E-Mail, nicht verifizierte E-Mail)

**UC-2 (Manuell + Automatisiert):**
- Filmsuche nach Titel
- Leere Suche (alle Filme)
- Filter (Genre/Jahr)
- Kombinationen, keine Treffer

**UC-3 (Automatisiert):**
- Film-Titel Anzeige
- Genre-Anzeige
- Rating-Anzeige
- Release Year
- Runtime Formatierung

**UC-4 (Automatisiert):**
- Film zu Favoriten hinzufügen
- Favoriten-Status prüfen
- Film aus Favoriten entfernen

**UC-5 (Automatisiert):**
- Duration Query Parser (short, medium, long)
- Cache-Logik für Recommendations
- Duration Filter für Filme
- User-Daten Kontext Aufbau

**UC-6 (Automatisiert):**
- Freundesliste Verarbeitung
- Freundschaftsanfrage Logik
- Freundschaftsstatus Prüfung
- Eingehende Anfragen Filter

**UC-7 (Automatisiert):**
- Liste Erstellung
- Collaborator Verwaltung
- Film zu Liste hinzufügen
- Listen Abruf (Owned + Shared)
- Listen Löschung

### A.3 Teststrategie

Der Fokus liegt auf Funktionen mit hoher Relevanz:

| Bereich | Testtyp | Priorität |
|---------|---------|-----------|
| Zugang zum System (UC-1) | Manuell | Hoch |
| Nutzung der Filmsammlung (UC-2) | Manuell + Automatisiert | Hoch |
| Film Details (UC-3) | Automatisiert | Hoch |
| Favoriten-System (UC-4) | Automatisiert | Hoch |
| AI Recommendation (UC-5) | Automatisiert | Hoch |
| Freundesystem (UC-6) | Automatisiert | Hoch |
| Gemeinsame Listen (UC-7) | Automatisiert | Hoch |
| Utility Functions | Automatisiert (Unit) | Hoch |

Es werden jeweils Positiv- und Negativ-Szenarien getestet.

### A.4 Testentwicklung

- **Manuelle Tests:** Die Testfälle werden tabellarisch beschrieben (Vorbedingungen, Schritte, erwartetes Ergebnis) und anschließend manuell im Browser ausgeführt
- **Automatisierte Tests:** Implementierung in TypeScript mit Vitest Framework

---

## B. Testanalyse

Unter Bezugnahme auf die Testziele werden die Testbedingungen priorisiert, die notwendig sind, um die definierten Anwendungsfälle zu verifizieren.

### UC-1: Benutzerregistrierung und Anmeldung (Manuell)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-1.1 | Registrierung – Erfolgreich | Hoch | Obligatorisch |
| UC-1.2 | Registrierung – Fehlerfälle | Hoch | Optional |
| UC-1.3 | Anmeldung – Erfolgreich | Hoch | Obligatorisch |
| UC-1.4 | Anmeldung – Fehlerfälle | Mittel | Optional |

### UC-2: Filmsuche und -filter (Manuell + Automatisiert)

| Test-ID | Beschreibung | Priorität | Testtyp |
|---------|--------------|-----------|---------|
| UC-2.1 | Filmsuche nach Titel | Hoch | Manuell + Automatisiert |
| UC-2.2 | Leere Suche (alle Filme) | Mittel | Automatisiert |
| UC-2.3 | Genre- und Jahr-Filter | Hoch | Automatisiert |
| UC-2.4 | Kombination Suche + Filter / keine Treffer | Hoch | Automatisiert |

### UC-3: Film Details (Automatisiert)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-3.1 | Film-Titel korrekt angezeigt | Hoch | ✅ Implementiert |
| UC-3.2 | Genres korrekt angezeigt | Hoch | ✅ Implementiert |
| UC-3.3 | Rating korrekt angezeigt | Hoch | ✅ Implementiert |
| UC-3.4 | Release Year korrekt angezeigt | Hoch | ✅ Implementiert |
| UC-3.5 | Runtime korrekt formatiert | Hoch | ✅ Implementiert |
| UC-3.6 | Overview korrekt angezeigt | Hoch | ✅ Implementiert |

### UC-4: Favoriten-System (Automatisiert)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-4.1 | Film zu Favoriten hinzufügen | Hoch | ✅ Implementiert |
| UC-4.2 | Favoriten-Status prüfen | Hoch | ✅ Implementiert |
| UC-4.3 | Film aus Favoriten entfernen | Hoch | ✅ Implementiert |

### UC-5: AI Recommendation System (Automatisiert)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-5.1 | Duration Query Parser - "short" erkennen | Hoch | ✅ Implementiert |
| UC-5.2 | Duration Query Parser - "medium" erkennen | Hoch | ✅ Implementiert |
| UC-5.3 | Duration Query Parser - "long" erkennen | Hoch | ✅ Implementiert |
| UC-5.4 | Cache - Ergebnisse speichern | Hoch | ✅ Implementiert |
| UC-5.5 | Cache - Cached Results abrufen | Hoch | ✅ Implementiert |
| UC-5.6 | Duration Filter - Short Movies | Hoch | ✅ Implementiert |
| UC-5.7 | Duration Filter - Medium Movies | Hoch | ✅ Implementiert |
| UC-5.8 | Duration Filter - Long Movies | Hoch | ✅ Implementiert |

### UC-6: Freundesystem (Automatisiert)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-6.1 | Freund identifizieren (als Sender) | Hoch | ✅ Implementiert |
| UC-6.2 | Freund identifizieren (als Receiver) | Hoch | ✅ Implementiert |
| UC-6.3 | Nur akzeptierte Freundschaften filtern | Hoch | ✅ Implementiert |
| UC-6.4 | Freundschaftsanfrage hinzufügen | Hoch | ✅ Implementiert |
| UC-6.5 | Existierende Anfrage erkennen | Hoch | ✅ Implementiert |
| UC-6.6 | Freundschaftsstatus prüfen | Hoch | ✅ Implementiert |
| UC-6.7 | Eingehende Anfragen filtern | Hoch | ✅ Implementiert |

### UC-7: Gemeinsame Listen (Automatisiert)

| Test-ID | Beschreibung | Priorität | Status |
|---------|--------------|-----------|--------|
| UC-7.1 | Liste erstellen | Hoch | ✅ Implementiert |
| UC-7.2 | Mehrere Listen pro User | Hoch | ✅ Implementiert |
| UC-7.3 | Collaborator hinzufügen | Hoch | ✅ Implementiert |
| UC-7.4 | Existierenden Collaborator erkennen | Hoch | ✅ Implementiert |
| UC-7.5 | Film zu Liste hinzufügen | Hoch | ✅ Implementiert |
| UC-7.6 | Alle Filme einer Liste abrufen | Hoch | ✅ Implementiert |
| UC-7.7 | Eigene Listen abrufen | Hoch | ✅ Implementiert |
| UC-7.8 | Geteilte Listen abrufen | Hoch | ✅ Implementiert |
| UC-7.9 | Nur Owner kann löschen | Hoch | ✅ Implementiert |

---

## C. Test Design am Produkt

### C.1 Manuelle Tests

Jeder Anwendungsfall wird mit einer Reihe von manuellen Black-Box-Systemtests überprüft. Die Testdaten (z. B. E-Mail-Adressen, Passwörter, Suchbegriffe, Filterwerte) werden anhand der Anforderungen der Use Cases festgelegt.

Die Testumgebung besteht aus der laufenden Web-App in der Entwicklungsumgebung und wird ausschließlich über den Browser getestet.

#### UC-1: Benutzerregistrierung und Anmeldung

| Testfall-ID | Use Case Schritt | Ziel | Vorbedingungen | Testdaten | Ablauf | Erwartetes Ereignis |
|-------------|------------------|------|----------------|-----------|--------|---------------------|
| UC1-T1 | Registrierung (Erfolgsfall) | Neue Benutzer erfolgreich registriert | App läuft, E-Mail-Dienst aktiv | E-Mail: newuser@test.com, Passwort: Test123!@ | 1. Sign-Up öffnen, 2. E-Mail & Passwort eingeben, 3. Registrieren klicken, 4. E-Mail bestätigen | Benutzerkonto wird erstellt und zur Login-Seite weitergeleitet |
| UC1-T2 | Registrierung - Fehlerfall | Bereits registrierte E-Mail erkennen | E-Mail existiert bereits | E-Mail: existing@test.com, Passwort: Test123!@ | 1. Sign-Up öffnen, 2. Existierende E-Mail eingeben, 3. Registrieren klicken | Fehlermeldung: „E-Mail bereits registriert" |
| UC1-T3 | Registrierung - Fehlerfall | Ungültiges Passwort ablehnen | - | E-Mail: test@test.com, Passwort: 123 (zu kurz) | 1. Formular ausfüllen, 2. Registrieren klicken | Meldung: „Passwort ungültig" |
| UC1-T4 | Anmeldung - Erfolgsfall | Erfolgreicher Login | Benutzer verifiziert | E-Mail: verified@test.com, Passwort: Test123!@ | 1. Login öffnen, 2. Daten eingeben, 3. Login klicken | Weiterleitung zur Startseite |
| UC1-T5 | Anmeldung - Fehlerfall | Falsches Passwort erkennen | Konto existiert | E-Mail: verified@test.com | 1. Login öffnen, 2. E-Mail korrekt, Passwort falsch | Fehlermeldung: „E-Mail oder Passwort falsch" |

#### UC-2: Filmsuche und -filter

| Testfall-ID | Use Case Schritt | Ziel | Vorbedingungen | Testdaten | Ablauf | Erwartetes Ereignis |
|-------------|------------------|------|----------------|-----------|--------|---------------------|
| UC2-T1 | Suche nach Titel | Film anhand Titel finden | Filmdatenbank aktiv | Titel: "Inception" | 1. Startseite öffnen, 2. Titel eingeben, 3. Suchen klicken | Trefferliste enthält "Inception" |
| UC2-T2 | Leere Suche | Alle Filme anzeigen | - | (leer) | 1. Startseite öffnen, 2. Suchfeld leer lassen, 3. Suchen | Liste aller Filme |
| UC2-T3 | Filter Genre | Genre-basierte Filterung | Genre vorhanden | Genre: "Action" | 1. Genre auswählen, 2. Suchen/Filter anwenden | Nur Action-Filme werden angezeigt |
| UC2-T4 | Filter Jahr | Jahresfilter prüfen | Filme haben Jahresangaben | Jahr: "2020" | 1. Titel eingeben, 2. Genre wählen, 3. Suchen | Nur Filme aus 2020 werden angezeigt |
| UC2-T5 | Kombination Suche + Filter | Filter korrekt kombinieren | Beispiel-Film existiert | Titel: "Star", Genre: "Sci-Fi" | 1. Suchbegriff eingeben, 2. Suchen | Nur Sci-Fi-Filme, deren Titel "Star" enthält |




### C.2 Automatisierte Tests

Die automatisierten Tests wurden mit folgenden Technologien implementiert:

| Technology | Version | Zweck |
|------------|---------|-------|
| Vitest | 4.0.14 | Test Framework |
| @testing-library/react | 16.3.0 | React Component Testing |
| @testing-library/jest-dom | 6.9.1 | DOM Matchers |
| @vitest/coverage-v8 | 4.0.16 | Code Coverage |
| jsdom | 27.2.0 | Browser Environment |

#### Teststruktur (🔄 AKTUALISIERT)

```
src/test/
├── setup.ts                           # Test-Konfiguration
├── __mocks__/                         # 🆕 Supabase Mock (NEU)
│   └── supabase.ts                    # Mock für Supabase Client
├── components/
│   └── MovieCard.test.tsx             # Component Tests (6 Tests)
├── integration/
│   ├── movieSearch.test.ts            # Movie Search Integration (8 Tests)
│   └── friendsAndLists.test.ts        # Friends & Lists Integration (12 Tests)
├── services/                          # 🔄 Mit echten Service-Imports (AKTUALISIERT)
│   ├── aiRecommendation.test.ts       # AI Service Tests (8 Tests)
│   ├── friendService.test.ts          # Friend Service Tests (11 Tests)
│   └── listService.test.ts            # List Service Tests (14 Tests)
└── utils/
    └── utils.test.ts                  # Utility Unit Tests (15 Tests)
```

> 🆕 **Neu:** Supabase Mock ermöglicht das Testen echter Service-Dateien und erhöht die Code Coverage

---

## D. Test Implementierung

### D.1 Manuelle Tests

Die manuelle Testdurchführung besteht aus folgenden Iterationen:

| Iteration | Beschreibung |
|-----------|--------------|
| 1 | Web-App wird in der Entwicklungsumgebung gestartet und ist über den Browser erreichbar |
| 2 | Die Testfälle zu UC-1 und UC-2 werden tabellarisch definiert |
| 3 | Die vorbereiteten Testdaten werden erstellt und geprüft |
| 4 | Die Testfälle werden manuell im Browser ausgeführt und die Ergebnisse dokumentiert |

### D.2 Automatisierte Tests

#### Unit Tests - Utility Functions (`utils.test.ts`)

```typescript
describe('formatRuntime', () => {
  it('should format 90 minutes as 1h 30m', () => {
    expect(formatRuntime(90)).toBe('1h 30m')
  })
})
```

**Getestete Funktionen:** `formatRuntime`, `formatDate`, `getRatingColor` (15 Tests)

#### Unit Tests - AI Recommendation (`aiRecommendation.test.ts`)

```typescript
describe('AI Recommendation - Duration Query Parser', () => {
  it('should return "short" for queries containing "short"', () => {
    expect(getDurationFromQuery('I want a short movie')).toBe('short')
  })
})
```

**Getestete Funktionen:** Duration Parser, Cache Logic, Duration Filter (16 Tests)

#### Unit Tests - Friend Service (`friendService.test.ts`)

```typescript
describe('Friend Service - Friendship Status', () => {
  it('should return "accepted" for accepted friendship', () => {
    expect(checkStatus('user-1', 'user-2')).toBe('accepted')
  })
})
```

**Getestete Funktionen:** Friend List Processing, Request Logic, Status Check, Incoming Requests (14 Tests)

#### Unit Tests - List Service (`listService.test.ts`)

```typescript
describe('List Service - Collaborator Management', () => {
  it('should add collaborator to list', () => {
    list.collaborators.push(friendId)
    expect(list.collaborators).toContain('user-2')
  })
})
```

**Getestete Funktionen:** List Creation, Collaborator Management, List Items, Deletion (15 Tests)

#### Component Tests (`MovieCard.test.tsx`)

```typescript
describe('MovieCard Component', () => {
  it('should render movie title', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })
})
```

**Getestete Aspekte:** Title, Genres, Rating, Release Year, Runtime, Overview (6 Tests)

#### Integration Tests (`movieSearch.test.ts`, `friendsAndLists.test.ts`)

```typescript
describe('Friends and Shared Lists Integration', () => {
  it('should only allow sharing list with friends', () => {
    expect(isFriend).toBe(true)
    expect(lists[0].collaborators).toContain('user-2')
  })
})
```

**Getestete Szenarien:** Movie Search, Favorites, Friend-List Sharing, Survey Validation (20 Tests)

---

## E. Test Coverage

### E.1 Automatisierte Test-Ergebnisse

```bash
npm run test:coverage
```

| Metrik | Wert |
|--------|------|
| **Test Files** | 7 passed |
| **Tests** | 73 passed | 🔄
| **Duration** | ~900ms |

### E.2 Code Coverage Report (🔄 AKTUALISIERT)

| File | % Stmts | % Branch | % Funcs | % Lines |
|------|---------|----------|---------|---------|
| **All files** | **77.71%** | **66.66%** | **90%** | **83.91%** | 🔄
| `components/MovieCard.tsx` | 55.55% | 76.19% | 60% | 55.55% |
| `services/aiRecommendationService.ts` | 91.52% | 72% | 100% | **98%** | 🆕
| `services/friendService.ts` | 70% | 54.54% | 88.88% | **80.95%** | 🆕
| `services/listService.ts` | 65.15% | 50% | 87.5% | **71.42%** | 🆕
| `utils/movieUtils.ts` | 100% | 100% | 100% | **100%** |

> 🆕 **Neu:** Service-Dateien sind jetzt in Coverage enthalten durch Supabase Mocking
> 
> Die Utility-Funktionen haben weiterhin **100% Code Coverage**

### E.3 Test Commands

| Script | Beschreibung |
|--------|--------------|
| `npm test` | Vitest im Watch-Modus starten |
| `npm run test:run` | Alle Tests einmalig ausführen |
| `npm run test:coverage` | Tests mit Coverage-Report ausführen |

### E.4 Hinweis zu Manuellen Tests

Für die manuellen Black-Box-Systemtests wird der Quellcode nicht analysiert. Da UC-1 (Benutzerregistrierung und Anmeldung) auf Supabase-Auth basiert, können diese Testfälle nicht automatisiert werden und werden weiterhin manuell getestet.

---

## F. Zusammenfassung

| Testtyp | Anzahl Tests | Status |
|---------|--------------|--------|
| Unit Tests - Utilities | 15 | ✅ Alle bestanden |
| Unit Tests - AI Recommendation | 8 | ✅ Alle bestanden | 🔄
| Unit Tests - Friend Service | 11 | ✅ Alle bestanden | 🔄
| Unit Tests - List Service | 14 | ✅ Alle bestanden | 🔄
| Component Tests | 6 | ✅ Alle bestanden |
| Integration Tests | 20 | ✅ Alle bestanden |
| Manuelle Tests | N/A | Dokumentiert |
| **Gesamt** | **73 automatisiert** | **100% Pass Rate** | 🔄

---

## G. Technische Hinweise (🆕 NEU)

### G.1 Supabase Mocking

Für das Testen von Service-Dateien, die Supabase verwenden, wurde ein Mock-System implementiert:

```typescript
// src/test/__mocks__/supabase.ts
export const mockSupabase = {
  auth: { getUser: vi.fn(), signUp: vi.fn(), ... },
  from: vi.fn(() => createQueryBuilder()),
  functions: { invoke: vi.fn() }
}
```

### G.2 Coverage-Konfiguration

Test-Dateien werden von der Coverage-Berechnung ausgeschlossen (Best Practice):

```typescript
// vite.config.ts
coverage: {
  exclude: ['src/test/**', '**/*.test.ts', '**/*.test.tsx']
}
```

