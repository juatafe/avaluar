-- Esborra totes les taules si existeixen
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS Criteri_Evidencia;
DROP TABLE IF EXISTS Evidencia_Descriptor;
DROP TABLE IF EXISTS Modul_Alumne;
DROP TABLE IF EXISTS Descriptor;
DROP TABLE IF EXISTS Alumne;
DROP TABLE IF EXISTS Evidencia;
DROP TABLE IF EXISTS Criteri;
DROP TABLE IF EXISTS RA;
DROP TABLE IF EXISTS Modul;
DROP TABLE IF EXISTS Cicle;

PRAGMA foreign_keys = ON;

-- Entitat Cicle
CREATE TABLE Cicle (
    id_cicle INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL
);

-- Entitat Mòdul
CREATE TABLE Modul (
    id_modul INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    id_cicle INTEGER NOT NULL,
    FOREIGN KEY (id_cicle) REFERENCES Cicle(id_cicle) ON DELETE CASCADE
);

-- Entitat RA
CREATE TABLE RA (
    id_ra INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    ponderacio REAL,
    id_modul INTEGER NOT NULL,
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul) ON DELETE CASCADE
);

-- Entitat Criteri
CREATE TABLE Criteri (
    id_criteri INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    ponderacio REAL,
    id_ra INTEGER NOT NULL,
    FOREIGN KEY (id_ra) REFERENCES RA(id_ra) ON DELETE CASCADE
);

-- Entitat Evidència
CREATE TABLE Evidencia (
    id_evidencia INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL
);

-- Entitat Alumne
CREATE TABLE Alumne (
    nia INTEGER PRIMARY KEY,
    nom TEXT NOT NULL
);

-- Entitat Descriptor
CREATE TABLE Descriptor (
    id_descriptor INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    valor REAL
);

-- Relació molts a molts entre Mòdul i Alumne
CREATE TABLE Modul_Alumne (
    id_modul INTEGER NOT NULL,
    nia INTEGER NOT NULL,
    PRIMARY KEY (id_modul, nia),
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul) ON DELETE CASCADE,
    FOREIGN KEY (nia) REFERENCES Alumne(nia) ON DELETE CASCADE
);

-- Relació molts a molts entre Evidència i Descriptor
CREATE TABLE Evidencia_Descriptor (
    id_evidencia INTEGER NOT NULL,
    id_descriptor INTEGER NOT NULL,
    PRIMARY KEY (id_evidencia, id_descriptor),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE,
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor) ON DELETE CASCADE
);

CREATE TABLE Criteri_Evidencia (
    id_criteri INTEGER NOT NULL,
    id_evidencia INTEGER NOT NULL,
    PRIMARY KEY (id_criteri, id_evidencia),
    FOREIGN KEY (id_criteri) REFERENCES Criteri(id_criteri) ON DELETE CASCADE,
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE
);

-- Inserir dades inicials

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

-- Inserir dades a la relació molts a molts Modul_Alumne
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (2, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 654321);

-- Inserir dades a la taula Evidencia_Descriptor
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES (1, 1);
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES (2, 2);

-- Missatge d'informació
SELECT 'Base de dades creada i dades inserides correctament!' AS resultat;
