-- Desactivar claus foranes per modificar la base de dades
PRAGMA foreign_keys = OFF;
PRAGMA encoding = "UTF-8";

-- Esborrar totes les taules si existeixen
DROP TABLE IF EXISTS Criteri_Alumne_Evidencia;
DROP TABLE IF EXISTS Evidencia_Descriptor;
DROP TABLE IF EXISTS Descriptor;
DROP TABLE IF EXISTS Alumne;
DROP TABLE IF EXISTS Modul_Alumne;
DROP TABLE IF EXISTS Evidencia;
DROP TABLE IF EXISTS Criteri;
DROP TABLE IF EXISTS RA;
DROP TABLE IF EXISTS Modul;
DROP TABLE IF EXISTS Cicle;

-- Tornar a activar les claus foranes
PRAGMA foreign_keys = ON;

-- Crear taula Cicle
CREATE TABLE Cicle (
    id_cicle INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL
);

-- Crear taula Modul
CREATE TABLE Modul (
    id_modul INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    id_cicle INTEGER,
    FOREIGN KEY (id_cicle) REFERENCES Cicle(id_cicle)
);

-- Crear taula RA
CREATE TABLE RA (
    id_ra INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio REAL NOT NULL,
    id_modul INTEGER,
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul)
);

-- Crear taula Criteri
CREATE TABLE Criteri (
    id_criteri INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcio TEXT NOT NULL,
    ponderacio REAL NOT NULL,
    id_ra INTEGER,
    FOREIGN KEY (id_ra) REFERENCES RA(id_ra)
);

-- Crear taula Alumne
CREATE TABLE Alumne (
    nia INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    cognoms TEXT NOT NULL
);

-- Crear taula Modul_Alumne
/* CREATE TABLE Modul_Alumne (
    id_modul INTEGER,
    nia INTEGER,
    PRIMARY KEY (id_modul, nia),
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul),
    FOREIGN KEY (nia) REFERENCES Alumne(nia)
); */

-- Crear taula Evidencia
CREATE TABLE Evidencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcio TEXT NOT NULL
);

-- Crear taula Descriptor
CREATE TABLE Descriptor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    valor REAL NOT NULL
);

-- Crear taula Evidencia_Descriptor
CREATE TABLE Evidencia_Descriptor (
    id_evidencia INTEGER,
    id_descriptor INTEGER,
    PRIMARY KEY (id_evidencia, id_descriptor),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id),
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id)
);

-- Crear taula Criteri_Alumne_Evidencia
CREATE TABLE Criteri_Alumne_Evidencia (
    id_criteri INTEGER,
    id_evidencia INTEGER,
    nia INTEGER,
    valor REAL DEFAULT 0,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_criteri, id_evidencia, nia),
    FOREIGN KEY (id_criteri) REFERENCES Criteri(id_criteri),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id),
    FOREIGN KEY (nia) REFERENCES Alumne(nia)
);

/* -- Crear taula Alumne_RA (necessita id_ra i nia)
CREATE TABLE Alumne_RA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nia INTEGER NOT NULL,
    id_ra INTEGER NOT NULL,
    aconseguit REAL DEFAULT 0,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nia) REFERENCES Alumne(nia) ON DELETE CASCADE,
    FOREIGN KEY (id_ra) REFERENCES RA(id_ra) ON DELETE CASCADE
); */

-- Inserir dades a la taula Cicle
INSERT INTO Cicle (nom) VALUES ('ASIX');
INSERT INTO Cicle (nom) VALUES ('Cicle 2');

-- Inserir dades a la taula Modul
INSERT INTO Modul (nom, id_cicle) VALUES ('Fonaments Hardware', 1);
INSERT INTO Modul (nom, id_cicle) VALUES ('XAL', 2);

-- Inserir dades a la taula RA
INSERT INTO RA (nom, ponderacio, id_modul) VALUES ('RA 1', 0.5, 1);
INSERT INTO RA (nom, ponderacio, id_modul) VALUES ('RA 2', 0.5, 2);

-- Inserir dades a la taula Criteri
INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES ('Criteri 1', 0.3, 1);
INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES ('Criteri 2', 0.7, 2);

-- Inserir dades a la taula Alumne
INSERT INTO Alumne (nia, nom, cognoms) VALUES (123456, 'Joan', 'Garcia');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (654321, 'Maria', 'Martínez');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (789012, 'Pere', 'López');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (345678, 'Anna', 'Sánchez');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (901234, 'Laura', 'Gómez');

/* -- Inserir dades a la taula Modul_Alumne
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (2, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 654321); */

-- Inserir dades a la taula Evidencia
INSERT INTO Evidencia (descripcio) VALUES ('Examen 1');
INSERT INTO Evidencia (descripcio) VALUES ('Projecte 1');
INSERT INTO Evidencia (descripcio) VALUES ('Observació 1');
INSERT INTO Evidencia (descripcio) VALUES ('Treball 1');
INSERT INTO Evidencia (descripcio) VALUES ('Pregunta 3');
INSERT INTO Evidencia (descripcio) VALUES ('Mapa Conceptual 1');

-- Inserir dades a la taula Descriptor
INSERT INTO Descriptor (nom, valor) VALUES ('Excel·lent', 10.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Notable', 9.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Bé', 8.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Suficient', 6.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Insuficient', 4.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Assolit', 10);
INSERT INTO Descriptor (nom, valor) VALUES ('No assolit', 0);
INSERT INTO Descriptor (nom, valor) VALUES ('Superat', 10);
INSERT INTO Descriptor (nom, valor) VALUES ('No superat', 0);
INSERT INTO Descriptor (nom, valor) VALUES ('Aprovat', 5);
INSERT INTO Descriptor (nom, valor) VALUES ('No aprovat', 0);
INSERT INTO Descriptor (nom, valor) VALUES ('Aprovat amb nota', 7);
INSERT INTO Descriptor (nom, valor) VALUES ('No aprovat amb nota', 4);
INSERT INTO Descriptor (nom, valor) VALUES ('Aprovat amb excel·lència', 9);

-- Inserir dades a la taula Evidencia_Descriptor
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES 
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
    (2, 6), (2, 7),
    (3, 8), (3, 9),
    (4, 10), (4, 11),
    (5, 10), (5, 11),
    (6, 11), (6, 12), (6, 13), (6, 14);

-- Inserir dades a la taula Criteri_Alumne_Evidencia
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia) VALUES (1, 1, 123456);
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia) VALUES (1, 2, 123456);
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia) VALUES (2, 1, 654321);
