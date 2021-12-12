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

### 0. Docker vorbereiten
- Prüfe, ob Docker installiert ist (in Kommandozeile `docker -v`)
  - Falls ein Fehler geworfen wird, installiere Docker
- Prüfe, ob Docker läuft (in Kommandozeile `docker container ls`)
  - Falls Docker nicht läuft, starte Docker
- Prüfe, ob es das Docker Netzwert camunda_demo_net gibt (in Kommandozeile `docker network ls`)
  - Falls es das Netzwerk noch nicht gibt, starte es über `docker network create camunda_demo_net`

### 1. Camunda starten
- Docker Container starten: `docker container run -d --name camunda -p 8080:8080 --network camunda_demo_net camunda/camunda-bpm-platform:latest`
- Prüfe, ob Camunda läuft
  - `docker container ls` sollte einen Container mit der Bezeichnung camunda anzeigen
  - [http://localhost:8080/camunda](http://localhost:8080/camunda) sollte erreichbar sein

### 2. Camunda Ressourcen deployen
- "pizza_shop.bpmn" sowie "chefs.dmn" im Camunda Modeler öffnen
- Deploy jeweils über button "deploy current diagram"
  - Der REST Endpoint sollte "http://localhost:8080/engine-rest" sein

### 2. Webserver starten
- Docker Image erstellen
  - `docker image build -t camunda-webshop ./webserver`
- Docker Container starten: `docker container run -d --name camundaWebshop -p 8082:5000 --network camunda_demo_net camunda-webshop`
- Webseite sollte unter [http://localhost:8082/](http://localhost:8082/) erreichbar sein
  - `docker container ls` sollte einen Container mit der Bezeichnung camundaWebshop anzeigen

### 3. Worker starten
- Kopiere die Datei "worker/.env.sample" und nenne sie "worker/.env"
- Konfiguriere den E-Mail Server in der Datei "worker/.env"
  - (Dies ist optional. Ohne Konfiguration können jedoch keine Mails versandt werden.)
- Docker Image erstellen
  - `docker image build -t camunda-automation-worker ./worker`
- Docker Container starten: `docker container run -d --name camundaAutomationWorker --network camunda_demo_net camunda-automation-worker`
- Prüfe, ob der Worker läuft: `docker container ls` sollte einen Container mit der Bezeichnung camundaAutomationWorker anzeigen

### 4. Fertig / Verwendung
- Über die Webseite http://localhost:8082/ können nun Prozess-Instanzen gestartet werden.
- In der Camunda Webapp können die Instanzen überwacht und manuelle Aufgaben erledigt werden (http://localhost:8080/camunda, Login: demo, PW: demo)

## Produktiv-Einsatz
- Vor dem produktiven Einsatz ist **zwingend erforderlich**, dass der Zugriff auf die REST-Schnittstelle nur mit Authorisierung möglich ist.
- Vor dem produktiven Einsatz sollten Benutzer angelegt und im Admin-Bereich konfiguriert werden.
