# avaluar
Aplicació per aconseguir posar notes als mòduls sense ponderar instruments 

flowchart TD
    %% Entitat Cicle
    Cicle["🟦 Cicle"] -->|id_cicle| CicleID["⚪ id_cicle"]
    Cicle -->|nom| CicleNom["⚪ nom"]

    %% Entitat Modul
    Modul["🟦 Modul"] -->|id_modul| ModulID["⚪ id_modul"]
    Modul -->|nom| ModulNom["⚪ nom"]
    Modul -->|id_cicle| ModulCicle["⚪ id_cicle"]

    %% Entitat RA
    RA["🟦 RA"] -->|id_ra| RAID["⚪ id_ra"]
    RA -->|nom| RANom["⚪ nom"]
    RA -->|ponderacio| RAPonderacio["⚪ ponderacio"]
    RA -->|id_modul| RAModul["⚪ id_modul"]

    %% Entitat Criteri
    Criteri["🟦 Criteri"] -->|id_criteri| CriteriID["⚪ id_criteri"]
    Criteri -->|descripcio| CriteriDescripcio["⚪ descripcio"]
    Criteri -->|ponderacio| CriteriPonderacio["⚪ ponderacio"]
    Criteri -->|id_ra| CriteriRA["⚪ id_ra"]

    %% Relació entre entitats
    Cicle --- Relacio1["⬥ Inclou"] --- Modul
    Modul --- Relacio2["⬥ Defineix"] --- RA
    RA --- Relacio3["⬥ Avalua"] --- Criteri

    %% Entitat Alumne
    Alumne["🟦 Alumne"] -->|nia| AlumneID["⚪ nia"]
    Alumne -->|nom| AlumneNom["⚪ nom"]
    Alumne -->|cognoms| AlumneCognoms["⚪ cognoms"]

    %% Entitat Evidencia
    Evidencia["🟦 Evidencia"] -->|id| EvidenciaID["⚪ id"]
    Evidencia -->|descripcio| EvidenciaDescripcio["⚪ descripcio"]

    %% Relació amb evidències i descriptors
    Evidencia --- Relacio4["⬥ Té descriptors"] --- Descriptor["🟦 Descriptor"]
    Descriptor -->|id| DescriptorID["⚪ id"]
    Descriptor -->|nom| DescriptorNom["⚪ nom"]
    Descriptor -->|valor| DescriptorValor["⚪ valor"]

    %% Relació entre Alumne, Criteri i Evidència
    Alumne --- Relacio5["⬥ Avalua"] --- Criteri
    Alumne --- Relacio6["⬥ Presenta"] --- Evidencia
