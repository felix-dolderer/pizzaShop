# Camunda-Demo: Ressourcen

## Inhalt
### camunda_resources
Beinhaltet die Modelle für:
- Prozess (BPMN)
- Zuordnung de Pizzabäckers (DMN)

### webserver
Beinhaltet die Webseite zum erstellen von Prozessinstanzen (Pizza-Bestellungen).

### worker
Beinhaltet Automatisierungen:
- Prüfung der Zahlung
- Versandt von E-Mails

## Setup
### 1. Camunda starten
Camunda sollte unter dieser Adresse erreichbar sein: [http://localhost:8080/camunda](http://localhost:8080/camunda)

**Camunda mit Docker starten**:
- Prüfe, ob Docker installiert ist (in Kommandozeile `docker -v`)
  - Falls ein Fehler geworfen wird, installiere Docker
- Prüfe, ob Docker läuft (in Kommandozeile `docker ps`)
  - Falls Docker nicht läuft, starte Docker
- Hole das Docker Image: `docker pull camunda/camunda-bpm-platform:latest`
- Starte einen Container: `docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:latest`
- Prüfe, ob Camunda läuft
  - `docker ps` sollte einen Container mit der Bezeichnung camunda anzeigen
  - [http://localhost:8080/camunda](http://localhost:8080/camunda) sollte erreichbar sein

### 2. Camunda Ressourcen deployen
- "pizza_shop.bpmn" sowie "chefs.dmn" im Camunda Modeler öffnen
- Deploy jeweils über button "deploy current diagram"
  - Der REST Endpoint sollte "http://localhost:8080/engine-rest" sein


### 2. Webserver starten
- Prüfe, ob Python istalliert ist (`python -V`)
- Installiere Python Flask (Webserver) (`pip install Flask`)
- Starte den Webserver
  - Wechsele in den Ordner webserver: `cd ./webserver`
  - `python ./app.py`
- Webseite sollte unter [http://127.0.0.1:8082/](http://127.0.0.1:8082/) erreichbar sein

### 3. Worker starten
(öffne hierzu eine separate Kommandozeile)
- Prüfe, ob node.js installiert ist (`node -v`)
- Installiere die Dependencies:
  - Wechsele in den Ordner worker `cd ./worker`
  - `npm i`
- Konfiguriere den E-Mail Server in der Datei "worker/.env"
  - (Dies ist optional. Ohne Konfiguration können jedoch keine Mails versandt werden.)
- Starte den Worker
  - Prüfe, dass du dich im worker-Ordner befindest (falls nicht: `cd ./worker`)
  - `node automations.js`

### 4. Fertig / Verwendung
- Über die Webseite http://127.0.0.1:8082/ können nun Prozess-Instanzen gestartet werden.
- In der Camunda Webapp können die Instanzen überwacht und manuelle Aufgaben erledigt werden (http://localhost:8080/camunda, Login: demo, PW: demo)

## Produktiv-Einsatz
- Vor dem produktiven Einsatz ist **zwingend erforderlich**, dass der Zugriff auf die REST-Schnittstelle nur mit Authorisierung möglich ist.
- Vor dem produktiven Einsatz sollten Benutzer angelegt und im Admin-Bereich konfiguriert werden.