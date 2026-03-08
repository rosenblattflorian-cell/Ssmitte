# Tiefe Analyse – Projekt `Ssmitte`

## 1) Kurzüberblick

Dieses Repository ist ein **minimaler Next.js-14-MVP** für Lead-Scoring im Solar-Kontext. Die Anwendung besteht aus:

- einer einzelnen Client-Seite (`/`), die einen Beispiel-Lead per Button an ein API-Endpoint sendet,
- einem API-Route-Handler (`/api/leads`), der einen einfachen regelbasierten Score berechnet,
- sehr schlanker Projektkonfiguration (nur `next`, `react`, `react-dom`).

Der Scope ist klar auf einen MVP-Workflow reduziert: **Lead absenden → Score berechnen → Ergebnis anzeigen**.

## 2) Architektur & Datenfluss

### Frontend (`src/app/page.jsx`)

- Nutzt `"use client"` und `useState` für lokalen Zustand.
- Sendet aktuell statisch kodierte Nutzdaten via `fetch("/api/leads", { method: "POST", body: JSON.stringify(...) })`.
- Antwort wird als JSON gelesen und direkt im UI als `<pre>` ausgegeben.

**Bewertung:**

- Positiv: sehr nachvollziehbarer Datenfluss, minimaler Komplexitätsgrad.
- Einschränkung: kein Formular, keine Benutzereingaben, keine Fehlerbehandlung (`try/catch`, HTTP-Status-Checks), keine Ladezustände.

### API (`src/app/api/leads/route.js`)

- Enthält zwei Hilfsfunktionen:
  - `calculateScore(lead)` mit drei Regeln (Eigentümer, Dachfläche, Verbrauch),
  - `scoreLabel(score)` für Ampelklassifizierung.
- `POST(req)` parst JSON und gibt ein angereichertes Objekt zurück (`score`, `label`, `status`, `createdAt`).

**Bewertung:**

- Positiv: Regeln sind verständlich, kompakt, deterministisch.
- Einschränkung:
  - keine Input-Validierung (Typen, Pflichtfelder, Wertebereiche),
  - keine Fehlerantworten für fehlerhafte Payloads,
  - `createdAt` wird als `Date`-Objekt gesetzt (bei JSON-Serialisierung implizit zu ISO-String; expliziter wäre robuster für Verträge).

## 3) Fachlogik-Analyse (Scoring)

Aktuelles Modell:

- `owner === true` → +25
- `roofArea >= 40` → +20
- `powerUsage >= 4000` → +20
- Maximalwert gedeckelt auf 100
- Label:
  - `>= 61` → `GREEN`
  - `>= 31` → `YELLOW`
  - sonst `RED`

### Kritischer Punkt

Mit den aktuellen Gewichten ist die **maximal erreichbare Punktzahl 65** (25 + 20 + 20). Dadurch gilt:

- `GREEN` ist nur erreichbar, wenn **alle drei Bedingungen** erfüllt sind,
- `YELLOW` deckt einen großen Bereich ab,
- die Skala bis 100 wird faktisch nicht genutzt.

Das ist nicht zwingend falsch, aber es erzeugt eine implizite harte Klassifizierung ohne feine Abstufungen.

### Empfehlung

- Entweder Gewichte/Regeln so anpassen, dass die volle 0–100-Skala sinnvoll genutzt wird,
- oder den Scorebereich als 0–65 explizit dokumentieren und Label-Schwellen entsprechend normalisieren.

## 4) Codequalität & Engineering-Reife

### Stärken

- Sehr geringer Einstiegshürde, schnell lauffähig.
- Klares Minimalbeispiel ohne unnötige Abstraktion.
- Erfolgreicher Produktions-Build (`next build`) zeigt prinzipielle Deploy-Fähigkeit.

### Schwächen / Risiken

1. **Fehlende Validierung**
   - Risiko für Laufzeitfehler bei kaputten/unerwarteten Payloads.
2. **Fehlende Fehlerbehandlung im Frontend**
   - Netzwerk-/Serverfehler würden unklar im UI enden.
3. **Keine Tests**
   - Weder Unit-Tests für Scoring noch API-Tests.
4. **Kein API-Vertrag dokumentiert**
   - Felder, Datentypen, Default-Werte und Fehlerfälle sind nicht spezifiziert.
5. **Fehlende Linting/Quality Gates**
   - Kein ESLint/Prettier/Test-Task in Scripts hinterlegt.

## 5) Sicherheits- und Robustheitsaspekte

- Aktuell keine Authentifizierung/Autorisierung – für MVP ok, produktiv kritisch.
- Keine Rate-Limits/Abuse-Schutz auf API-Ebene.
- Keine Payload-Limits oder Schema-Validation.
- Keine Sanitization/Normalisierung (Strings, negative Werte, `null`/`undefined`, extreme Zahlenwerte).

Für einen öffentlichen Endpoint wäre mindestens Zod/Valibot-basierte Validation + strukturierte Fehlerantwort (`400`) sinnvoll.

## 6) Performance- und Betriebsaspekte

- Aktuelle Last ist trivial; Performance ist bei diesem Scope unkritisch.
- Kein Caching, keine Persistenz, kein Queueing – bewusst MVP.
- Für Skalierung wären nötig:
  - Persistenz (DB),
  - Idempotenz-/Dedup-Strategie,
  - Beobachtbarkeit (Logging, Metriken, Tracing).

## 7) Produktperspektive

Das Projekt eignet sich gut als **Proof-of-Concept**. Für eine real nutzbare Version wären die nächsten Prioritäten:

1. **Echtes Eingabeformular** (Name, Eigentümerstatus, Dachfläche, Verbrauch).
2. **Serverseitige Validierung + Fehlercodes**.
3. **Tests für Scoring-Logik** (Boundary Cases, Fuzzing einfacher Eingaben).
4. **Scoringmodell schärfen** (Gewichtung, weitere Features, Transparenz).
5. **Persistenzschicht** (Leads speichern, Status-Workflow).

## 8) Konkrete, priorisierte Maßnahmen (2-Wochen-Plan)

### Woche 1 (Stabilität)

- [ ] Input-Schema einführen (z. B. Zod).
- [ ] API-Fehlerfälle implementieren (`400` mit Fehlerdetails).
- [ ] Frontend: Lade-/Fehlerzustände ergänzen.
- [ ] Unit-Tests für `calculateScore` und `scoreLabel`.

### Woche 2 (Produktnutzen)

- [ ] Formular-UI statt statischer Payload.
- [ ] Basis-Persistenz (SQLite/Postgres + ORM).
- [ ] Dokumentation des API-Vertrags im README.
- [ ] Optionale Admin-Ansicht für eingegangene Leads.

## 9) Fazit

Der aktuelle Stand ist ein **sauberer Minimal-MVP** mit klarer Funktion, aber geringer Robustheit. Für Demo-Zwecke ist er geeignet; für produktiven Einsatz fehlen zentrale Qualitätsmerkmale (Validation, Fehlerhandling, Tests, Persistenz). Mit wenigen gezielten Schritten lässt sich daraus schnell ein belastbarer erster Produktinkrement entwickeln.
