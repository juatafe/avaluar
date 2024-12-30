# avaluar
Aplicació per aconseguir posar notes als mòduls sense ponderar instruments 

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
