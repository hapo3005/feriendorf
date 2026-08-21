# Feriendorf Intern

Mobile-first PWA für die Eigentümergemeinschaft des Feriendorfs in Kerschenbach.

## Ziel

Feriendorf Intern bündelt die gemeinschaftlichen Themen des Feriendorfs an einem Ort. Der erste Produktfokus ist bewusst klein: weniger WhatsApp-Suche, Rundmails, doppelte Schadensmeldungen und unkoordinierte Dienstleisterbesuche.

## MVP v0.1

- **Aktuell** – zentrale Übersicht und relevante Hinweise
- **Schäden** – Problem erfassen und Status von `Gemeldet` bis `Erledigt` verfolgen
- **Termine** – Gemeinschaftstermine und Dienstleisterbesuche teilen
- **Dienstleister bündeln** – weitere Eigentümer können Bedarf zu einem bereits geplanten Besuch anmelden
- **Mitreden** – einfache, ausdrücklich unverbindliche Stimmungsbilder
- **Gemeinschaft** – Hilfe suchen, Dinge verleihen, Tipps teilen oder gemeinsam bestellen
- **Dokumente** – UI vorbereitet; Datei-Upload folgt mit dem Backend
- **PWA** – installierbar, responsive und mit Offline-Cache

## Technischer Stand

Das MVP ist bewusst **local-first**. Einträge werden aktuell im Browser über `localStorage` gespeichert. Dadurch lässt sich die UX bereits vollständig testen, ohne vorschnell Benutzerverwaltung und Backend-Komplexität einzubauen.

Die Datenobjekte enthalten schon stabile Integrationsfelder:

- `community_id`: ordnet Daten der Eigentümergemeinschaft zu
- `house_id`: vorbereitet für die spätere Zuordnung zu einem einzelnen Ferienhaus

Damit bleibt die spätere Anbindung an eine Ferienhaus-/Gäste-App möglich, ohne die Intern-App heute davon abhängig zu machen.

## Nächster Produktionsschritt

Für den echten gemeinschaftlichen Betrieb werden als Nächstes benötigt:

1. Login und Rollen/Rechte
2. gemeinsames Backend statt Browser-Speicher
3. Foto-Upload bei Schäden
4. Dokument-Upload mit Berechtigungen und Versionierung
5. Push-Benachrichtigungen für wichtige Meldungen
6. Audit-/Änderungshistorie für sensible Gemeinschaftsdaten

Rechtlich verbindliche digitale Beschlüsse sind **nicht** Bestandteil des MVP und müssen separat fachlich und rechtlich validiert werden.

## Deployment

Das Repository enthält einen GitHub-Pages-Workflow unter `.github/workflows/pages.yml`. Nach Merge auf `main` wird die statische PWA automatisch über GitHub Pages veröffentlicht, sofern Pages im Repository auf **GitHub Actions** als Source eingestellt ist.
