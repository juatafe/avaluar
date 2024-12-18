-- Esborra totes les taules si existeixen
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS Criteri_Alumne_Evidencia;
DROP TABLE IF EXISTS Evidencia_Descriptor;
DROP TABLE IF EXISTS Descriptor;
DROP TABLE IF EXISTS Alumne;
DROP TABLE IF EXISTS Evidencia;
DROP TABLE IF EXISTS Criteri;
DROP TABLE IF EXISTS RA;
DROP TABLE IF EXISTS Modul;
DROP TABLE IF EXISTS Cicle;

PRAGMA foreign_keys = ON;

-- Creació de les taules
CREATE TABLE Cicle (
    id_cicle INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Modul (
    id_modul INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    id_cicle INT REFERENCES Cicle(id_cicle)
);

CREATE TABLE RA (
    id_ra INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL,
    id_modul INT REFERENCES Modul(id_modul)
);

CREATE TABLE Criteri (
    id_criteri INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL,
    id_ra INT REFERENCES RA(id_ra)
);

CREATE TABLE Evidencia (
    id_evidencia INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Descriptor (
    id_descriptor INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    valor DECIMAL(5, 2) NOT NULL
);

CREATE TABLE Alumne (
    nia INT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Criteri_Alumne_Evidencia (
    id_criteri INT REFERENCES Criteri(id_criteri),
    nia INT REFERENCES Alumne(nia),
    id_evidencia INT REFERENCES Evidencia(id_evidencia),
    PRIMARY KEY (id_criteri, nia, id_evidencia)
);

CREATE TABLE Evidencia_Descriptor (
    id_evidencia INT REFERENCES Evidencia(id_evidencia),
    id_descriptor INT REFERENCES Descriptor(id_descriptor),
    PRIMARY KEY (id_evidencia, id_descriptor)
);

-- Inserir dades a la taula Cicle
INSERT INTO Cicle (nom) VALUES ('ASIX');

-- Inserir dades a la taula Modul
INSERT INTO Modul (nom, id_cicle) VALUES ('Fonaments de Hardware', 1);
INSERT INTO Modul (nom, id_cicle) VALUES ('Administració de Sistemes', 1);

-- Inserir dades a la taula RA
INSERT INTO RA (nom, ponderacio, id_modul) VALUES ('Conèixer els components físics bàsics d’un ordinador', 0.4, 1);
INSERT INTO RA (nom, ponderacio, id_modul) VALUES ('Configurar equips microinformàtics', 0.6, 1);

-- Inserir dades a la taula Criteri
INSERT INTO Criteri (nom, ponderacio, id_ra) VALUES ('Identificar components físics', 0.3, 1);
INSERT INTO Criteri (nom, ponderacio, id_ra) VALUES ('Interpretar esquemes d’ordinadors', 0.7, 1);

-- Inserir dades a la taula Evidència
INSERT INTO Evidencia (nom) VALUES ('Pràctica 1: Reconèixer components físics');
INSERT INTO Evidencia (nom) VALUES ('Pràctica 2: Muntar un ordinador');

-- Inserir dades a la taula Alumne
INSERT INTO Alumne (nia, nom) VALUES (123456, 'Joan Martínez');
INSERT INTO Alumne (nia, nom) VALUES (654321, 'Anna García');

-- Inserir dades a la taula Descriptor
INSERT INTO Descriptor (nom, valor) VALUES ('Excel·lent', 10.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Bé', 8.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Suficient', 6.0);

-- Inserir dades a la taula Criteri_Alumne_Evidencia
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, nia, id_evidencia) VALUES (1, 123456, 1);
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, nia, id_evidencia) VALUES (2, 654321, 2);

-- Inserir dades a la taula Evidencia_Descriptor
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES (1, 1);
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES (2, 2);