# Camunda-Demo: Ressourcen

## Inhalt
### camunda_resources
Beinhaltet die Modelle für:
- Prozess (BPMN)
- Zuordnung des Pizzabäckers (DMN)

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
- Prüfe, ob docker-compose installiert ist (in Kommandozeile `docker-compose version`)
  - Falls ein Fehler geworfen wird, installiere docker-compose

### 1. Umgebungsvariablen definieren
- Kopiere die Datei *worker/.env.sample* und nenne sie *worker/.env*
- Konfiguriere den E-Mail Server in der Datei *worker/.env*
  - (Dies ist optional. Ohne Konfiguration können jedoch keine Mails versandt werden.)

Es gibt **keine Gewähr, dass der im Code hinterlegte Paypal-Sandbox Zugang noch verfügbar ist**. Um einen eigenen Paypal-Sandbox Zugang zu hinterlegen, folge den Anweisungen auf https://developer.paypal.com/ und ersetze die *client-id* in *webserver/templates/order.html*, sowie die Authorization in *worker/automation.js*. Ohne gültigen Paypal-Sandbox Zugang können keine Zahlungen durchgeführt oder verifiziert werden.

### 2. Anwendungen über docker-compose starten
- In Kommandozeile `docker-compose up -d`

### 3. Warten bis alle Anwendungen gestartet sind
  - [http://localhost:8080/camunda](http://localhost:8080/camunda) sollte erreichbar sein
  - Webseite sollte unter [http://localhost:8082/](http://localhost:8082/) erreichbar sein

### 4. Camunda Ressourcen deployen
- *pizza_shop.bpmn* sowie *chefs.dmn* im Camunda Modeler öffnen
- Deploy jeweils über button "deploy current diagram"
  - Der REST Endpoint sollte http://localhost:8080/engine-rest sein

### 5. Fertig / Verwendung
- Über die Webseite http://localhost:8082/ können nun Prozess-Instanzen gestartet werden.
- In der Camunda Webapp können die Instanzen überwacht und manuelle Aufgaben erledigt werden (http://localhost:8080/camunda, Login: demo, PW: demo)

## Produktiv-Einsatz
- Der hier bereitgestellte Code ist **nicht** für den produktiven Einsatz, sondern lediglich zu Demonstrationszwecken gedacht.
- Vor dem produktiven Einsatz von Camunda ist **zwingend erforderlich**, dass der Zugriff auf die REST-Schnittstelle nur mit Authorisierung möglich ist (egal um welchen Prozess es sich handelt).
- Vor dem produktiven Einsatz sollten Benutzer angelegt und im Admin-Bereich konfiguriert werden.
