-- Esborra totes les taules si existeixen (SQLite no té DROP DATABASE, però podem eliminar les taules)
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS Evidencia_Descriptor;
DROP TABLE IF EXISTS Criteri_Alumne_Evidencia;
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

-- Relació ternària entre Criteri, Alumne i Evidència
CREATE TABLE Criteri_Alumne_Evidencia (
    id_criteri INTEGER NOT NULL,
    nia INTEGER NOT NULL,
    id_evidencia INTEGER NOT NULL,
    PRIMARY KEY (id_criteri, nia, id_evidencia),
    FOREIGN KEY (id_criteri) REFERENCES Criteri(id_criteri) ON DELETE CASCADE,
    FOREIGN KEY (nia) REFERENCES Alumne(nia) ON DELETE CASCADE,
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE
);

-- Relació molts a molts entre Evidència i Descriptor
CREATE TABLE Evidencia_Descriptor (
    id_evidencia INTEGER NOT NULL,
    id_descriptor INTEGER NOT NULL,
    PRIMARY KEY (id_evidencia, id_descriptor),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE,
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor) ON DELETE CASCADE
);

-- Missatge d'informació
SELECT 'Base de dades creada correctament!' AS resultat;
