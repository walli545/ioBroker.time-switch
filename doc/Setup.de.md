[English version](Setup.en.md)

[Zurück zum README](../README.md)

# An/Aus Schaltplan einrichten

  1. Adapter installieren und eine Instanz anlegen (eine Instanz kann mehrere Zeitpläne verwalten)
  2. Öffnen der Instanzeinstellungen (Werkzeugschlüssel neben Play/Pause) und anlegen eines Zeitplans mit klick auf 
   "An/Aus Schaltplan hinzufügen". 
   Nun die neu Schaltplandaten Id des neu angelegten Schaltplans merken, diese wird später im VIS Editor benötigt.
    
   Im den Instanzeinstellungen können nur neue Zeitpläne angelegt und gelöscht werden, außerdem werden noch
   grundlegende Infos zu den Zeitplänen angezeigt (Name, Anzahl Trigger, Aktiv).
    
   Anschließend speichern und die Einstellungen verlassen.
  3. Öffnen des views im VIS Editor, in dem das Widget angezeigt werden soll.
  
     Anlegen eines neuen Widgets vom Typ "Schedule (On/Off)", dieses kann unter der Kategorie "time-switch" gefunden
     werden. Nun kann die Größe und Position des Widgets angepasst werden.
     
  4. Anschließend müssen noch weitere Einstellungen unter "Allgemein" getroffen werden:
  
     - Id für Schaltplandaten: Öffnen des OID Auswahldialogs und auswählen der Schaltplandaten Id, die vorher neu
        angelegt wurde
     - Anzeigen des geschaltenen States: Zum ausblenden/anzeigen des geschaltenen States im Widget. Wenn mehrere
        States geschalten werden, hat diese Einstellung keinen Effekt
     - Anzeigen der manuellen Schalter: Zum ausblenden/anzeigen eines Schalters, um manuell den geschaltenen State
        zu schalten. Bei einem geschaltenen State wird auch der aktuelle Zustand angezeigt. Bei mehreren können nur
        alle geschalten werden.
     - Werttyp: Typ des Werts, der geschalten werden soll. Man kann zwischen Wahrheitswert/Zeichenkette/Zahl wählen.
     - Wert für aus/Wert für an: Werte die für an oder aus geschalten werden sollen. Mögliche werte hängen vom Werttyp ab:

        - Wahrheitswert: Feld kann freigelassen werden, es wird nicht ausgewertet (immer true/false)
        - Zeichenkette: Alles bis auf eine leere Eingabe
        - Zahl: Alles was von der Javascript Funktion Number.parseFloat() akzeptiert wird.
        
     - Anzahl geschaltener States: Auswählen wie viele States gleichzeitig geschalten werden sollen (Gruppengröße)
     - Id vom geschaltenen State[1-10]: Auswählen der Ids, die geschalten werden. Z.b. den State eine Schaltsteckdose,
      oder einer Lampe. Bei Gruppen müssen die Geräte alle vom gleichen Typ sein (gleicher Werttyp, an und aus Werte)
      
  5. Alle anderen Interaktionen erfolgen nun mit dem VIS View.
  
    - Ändern des Schaltplannamens
    - Temporäres deaktivieren des automatischen Schaltens
    - Manuelles Schalten
    - Anlegen/Bearbeiten/Löschen von Triggern
