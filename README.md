# Avaluar per competències

L'objectiu d'aquesta aplicació és facilitar l'avaluació per competències en els mòduls, evitant la necessitat de ponderar específicament els instruments d'avaluació. Aquest sistema es basa en criteris, evidències i resultats d'aprenentatge (RA) per calcular automàticament el progrés i les notes dels alumnes.

## Registre Automàtic d'Evidències per a Nous Alumnes

Quan es registra un alumne nou, el sistema ha de crear automàticament una entrada a la taula `Criteri_Alumne_Evidencia` amb una evidència inicial, denominada **"Avaluació Zero"**, associada a tots els criteris. Aquesta funció garanteix que es mostren els mòduls matriculats de l'alumne ja que no existeix cap relació entre les taules Mòdul i Alumne per evitar resundància. 

## Descriptors Associats a Evidències

Cada evidència té una sèrie de descriptors predefinits que cal crear quan es registra l'evidència. Aquests descriptors inclouen una qualificació associada que obtenir una qualificació sumativa i la interpretació del progrés en una nota. Alguns exemples de descriptors són:

- **Assolit**: 5
- **Excel·lent**: 10
- **Notable**: 9
- **Suficient**: 6
- **Insuficient**: 4

Els descriptors permeten una avaluació més precisa i qualitativa, afegint significat a les notes numèriques.

### Exemple d'ús dels descriptors
1. Una evidència denominada **"Projecte 1"** pot tenir els següents descriptors:
   - `Excel·lent`: 10 punts
   - `Bé`: 8 punts
   - `Suficient`: 6 punts
   - `Insuficient`: 4 punts

2. Quan a un alumne se li associa un descriptor a una evidència, s'assigna directament el valor associat al descriptor escollit, simplificant el càlcul i mantenint la coherència.

## Càlcul del Progrés i Aconseguit

Amb el NIA de l'estudiant s'accedeix al llistat de mòduls on té registres de valors d'evidències a la taula `Criteri_Alumne_Evidencia` . Com que l'app està preparada (encara no) per a crear una evidència com a avaluació zero apareixen tots els mòduls matriculats. 

En accedir a un mòdul es pot observar el llistat dels RAs amb la ponderació, el progrés i l'aconseguit. A peu de taula es tenen els resultats totals. La nota del mòdul és el total de la columna aconseguit. 

En cada RA es pot accedir mitjançant un link `Posar Nota` al detall de cada criteri. En altra pàgina es llisten tots els criteris associats a l'RA. En aquesta vista s'obté una taula amb la ponderació, aconseguit i progrés de cada criteri i a peu de taula els totals. 

### Conceptes Clau
1. **Progrés de cada RA**: El progrés d'un resultat d'aprenentatge es determina pel sumatori dels valors aconseguits dels criteris associats.
2. **Aconseguit de cada criteri**: Representa la mitjana ponderada de les notes de les evidències associades a aquest criteri.

### Fórmules
- **Càlcul de l'Aconseguit de cada criteri**:
  $`
  \text{Aconseguit\_Criteri} = \left( \frac{\sum \text{Nota\_Evidencia}}{\text{Nombre\_Evidencies}} \right) \times \text{Ponderacio\_Criteri}
  `$

  - `Nota_Evidencia`: Valor de cada evidència registrada segons el descriptor.
  - `Nombre_Evidencies`: Nombre total d'evidències associades al criteri.
  - `Ponderacio_Criteri`: Pes específic del criteri en el resultat d'aprenentatge.

- **Càlcul del Progrés de cada RA**:
  $`\text{Progrés\_RA} = \sum \text{Aconseguit\_Criteri}`$

- **Càlcul de la Nota del mòdul**:
  $`\text{Nota\_Modul} = \sum \left( \text{Aconseguit\_RA} \times \text{Ponderacio\_RA} \right)`$

  - `Ponderacio_RA`: Pes assignat a cada resultat d'aprenentatge dins del mòdul.

## Avantatges del Sistema
- **Automatització**: Els càlculs són automàtics, reduint l'error humà i estalviant temps al professorat.
- **Descriptors predefinits**: Els descriptors estandarditzen les notes i faciliten una interpretació coherent entre professors i alumnes.
- **Flexibilitat**: Permet avaluar els alumnes basant-se en els criteris establerts, sense necessitat de ponderar manualment cada instrument.
- **Claredat**: Les fórmules proporcionen un marc transparent per al càlcul de les notes i del progrés dels alumnes.

## Exemple d'Aplicació
1. Un alumne té associades tres evidències per a un criteri amb una ponderació del 30%. Les seves notes són:
   - Evidència 1: Descriptor **"Excel·lent"** (10 punts).
   - Evidència 2: Descriptor **"Bé"** (8 punts).
   - Evidència 3: Descriptor **"Suficient"** (6 punts).

   - Aconseguit del criteri:
      
     $`\text{Aconseguit\_Criteri} = \left( \frac{10 + 8 + 6}{3} \right) \times 0.3 = 7.2`$

2. Si el RA té tres criteris, el progrés es calcula sumant els `Aconseguit_Criteri` dels tres.

3. Finalment, la nota del mòdul es calcula integrant el progrés de tots els RA amb les seves ponderacions.

Aquest sistema facilita l'avaluació contínua i orientada a competències, assegurant que els alumnes avancen en base als resultats establerts.

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
    Alumne ||--o{ Criteri_Alumne_Evidencia : "avalua"
    Evidencia ||--o{ Evidencia_Descriptor : "té descriptors"
    Descriptor ||--o{ Evidencia_Descriptor : "defineix"
    Criteri ||--o{ Criteri_Alumne_Evidencia : "especifica"
    Evidencia ||--o{ Criteri_Alumne_Evidencia : "avalua"

``` 
