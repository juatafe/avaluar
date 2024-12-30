# Avaluar per competències
Aplicació per aconseguir posar notes als mòduls sense ponderar els instruments. 

```mermaid
erDiagram
    %% Entitats principals
    Cicle {
        INTEGER id_cicle
        VARCHAR nom
    }

    Modul {
        INTEGER id_modul
        VARCHAR nom
        INTEGER id_cicle
    }

    RA {
        INTEGER id_ra
        VARCHAR nom
        REAL ponderacio
        INTEGER id_modul
    }

    Criteri {
        INTEGER id_criteri
        TEXT descripcio
        REAL ponderacio
        INTEGER id_ra
    }

    Alumne {
        INTEGER nia
        TEXT nom
        TEXT cognoms
    }

    Evidencia {
        INTEGER id
        TEXT descripcio
    }

    Descriptor {
        INTEGER id
        TEXT nom
        REAL valor
    }

    Modul_Alumne {
        INTEGER id_modul
        INTEGER nia
    }

    Evidencia_Descriptor {
        INTEGER id_evidencia
        INTEGER id_descriptor
    }

    Criteri_Alumne_Evidencia {
        INTEGER id_criteri
        INTEGER id_evidencia
        INTEGER nia
        REAL valor
        DATETIME data
    }

    %% Relacions
    Cicle ||--o{ Modul : "inclou"
    Modul ||--o{ RA : "inclou"
    RA ||--o{ Criteri : "defineix"
    Modul ||--o{ Modul_Alumne : "té"
    Modul_Alumne }o--|| Alumne : "relaciona"
    Alumne ||--o{ Criteri_Alumne_Evidencia : "avalua"
    Evidencia ||--o{ Evidencia_Descriptor : "té descriptors"
    Descriptor ||--o{ Evidencia_Descriptor : "defineix"
    Criteri ||--o{ Criteri_Alumne_Evidencia : "especifica"
    Evidencia ||--o{ Criteri_Alumne_Evidencia : "avalua"

``` 
## Registre automàtic d'evidències per a nous alumnes

Cada vegada que es registra un alumne nou, cal que automàticament es registre un valor a la taula `Criteri_Alumne_Evidencia` amb una evidència com "Avaluació Zero" associada a tots els criteris.

## Càlcul del Progrés i Aconseguit

- **Progrés de cada RA**: És igual al sumatori dels aconseguits dels criteris.
- **Aconseguit de cada criteri**: És igual al sumatori de les notes de les evidències que tenen nota dividit pel nombre d'aquestes, tot multiplicat per la ponderació de cada criteri.

### Fórmules

- **Aconseguit de cada criteri**:
  \[
  \text{Aconseguit\_Criteri} = \left( \frac{\sum \text{Nota\_Evidencia}}{\text{Nombre\_Evidencies}} \right) \times \text{Ponderacio\_Criteri}
  \]

- **Progrés de cada RA**:
  \[
  \text{Progrés\_RA} = \sum \text{Aconseguit\_Criteri}
  \]

- **Nota del mòdul**:
  \[
  \text{Nota\_Modul} = \sum \left( \text{Aconseguit\_RA} \times \text{Ponderacio\_RA} \right)
  \]

Aquestes fórmules ajuden a clarificar com es calculen les notes i els progressos dins del sistema.