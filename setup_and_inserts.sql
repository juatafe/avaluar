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
    id_cicle INT NOT NULL,
    FOREIGN KEY (id_cicle) REFERENCES Cicle(id_cicle) ON DELETE CASCADE
);

-- Crear taula RA
CREATE TABLE RA (
    id_ra INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL CHECK (ponderacio >= 0 AND ponderacio <= 100),
    id_modul INT NOT NULL,
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul) ON DELETE CASCADE
);

-- Crear taula Criteri
CREATE TABLE Criteri (
    id_criteri INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL CHECK (ponderacio >= 0 AND ponderacio <= 100),
    id_ra INT NOT NULL,
    FOREIGN KEY (id_ra) REFERENCES RA(id_ra) ON DELETE CASCADE
);

-- Crear taula Alumne
CREATE TABLE Alumne (
    nia INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    cognoms TEXT NOT NULL
);

-- Crear taula Mòdul_Alumne per associar alumnes amb mòduls
CREATE TABLE Modul_Alumne (
    id_modul INT NOT NULL,
    nia INTEGER NOT NULL,
    PRIMARY KEY (id_modul, nia),
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul) ON DELETE CASCADE,
    FOREIGN KEY (nia) REFERENCES Alumne(nia) ON DELETE CASCADE
);

-- Crear taula Evidencia
CREATE TABLE Evidencia (
    id_evidencia INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcio TEXT NOT NULL
);

-- Crear taula Descriptor (ara amb la columna 'nota')
CREATE TABLE Descriptor (
    id_descriptor INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    valor REAL NOT NULL
);

-- Crear taula Evidencia_Descriptor (noms per relacionar Evidencia amb Descriptor)
CREATE TABLE Evidencia_Descriptor (
    id_evidencia INT NOT NULL,
    id_descriptor INT NOT NULL,
    PRIMARY KEY (id_evidencia, id_descriptor),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE,
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor) ON DELETE CASCADE
);

-- Crear taula Criteri_Alumne_Evidencia
CREATE TABLE Criteri_Alumne_Evidencia (
    id_criteri INT NOT NULL,
    id_alumne INT NOT NULL,
    id_evidencia INT NOT NULL,
    id_descriptor INT NOT NULL,
    PRIMARY KEY (id_criteri, id_alumne, id_evidencia, id_descriptor),
    FOREIGN KEY (id_criteri) REFERENCES Criteri(id_criteri) ON DELETE CASCADE,
    FOREIGN KEY (id_alumne) REFERENCES Alumne(nia) ON DELETE CASCADE,
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia) ON DELETE CASCADE,
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor) ON DELETE CASCADE
);

-- Inserir dades a la taula Cicle
INSERT INTO Cicle (nom) VALUES 
    ('ASIX'), 
    ('DAW'), 
    ('DAM');

-- Inserir dades a la taula Modul
INSERT INTO Modul (nom, id_cicle) VALUES 
    ('M01', 1), ('M02', 1), ('M03', 1),
    ('M01', 2), ('M02', 2), ('M03', 2),
    ('M01', 3), ('M02', 3), ('M03', 3);

-- Inserir dades a la taula RA
INSERT INTO RA (nom, ponderacio, id_modul) VALUES 
    ('RA1', 20.00, 1), ('RA2', 30.00, 1), ('RA3', 50.00, 1),
    ('RA1', 25.00, 2), ('RA2', 35.00, 2), ('RA3', 40.00, 2),
    ('RA1', 15.00, 3), ('RA2', 45.00, 3), ('RA3', 40.00, 3);

-- Inserir dades a la taula Criteri
INSERT INTO Criteri (nom, ponderacio, id_ra) VALUES 
    ('CE A', 10.00, 1), ('CE B', 20.00, 1), ('CE C', 30.00, 1),
    ('CE A', 15.00, 2), ('CE B', 25.00, 2), ('CE C', 35.00, 2),
    ('CE A', 20.00, 3), ('CE B', 30.00, 3), ('CE C', 40.00, 3);

-- Inserir dades a la taula Alumne
INSERT INTO Alumne (nia, nom, cognoms) VALUES (123456, 'Joan', 'Garcia');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (654321, 'Maria', 'Martínez');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (789012, 'Pere', 'López');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (345678, 'Anna', 'Sánchez');
INSERT INTO Alumne (nia, nom, cognoms) VALUES (901234, 'Laura', 'Gómez');

-- Inserir dades a la taula Modul_Alumne
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (2, 123456);
INSERT INTO Modul_Alumne (id_modul, nia) VALUES (1, 654321);

-- Inserir dades a la taula Evidencia
INSERT INTO Evidencia (descripcio) VALUES ('Examen 1');
INSERT INTO Evidencia (descripcio) VALUES ('Projecte 1');

-- Inserir dades a la taula Descriptor (ara incloent 'nota')
INSERT INTO Descriptor (nom, valor) VALUES ('Excel·lent', 10.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Notable', 9.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Bé', 8.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Suficient', 6.0);
INSERT INTO Descriptor (nom, valor) VALUES ('Insuficient', 4.0);

-- Inserir dades a la taula Evidencia_Descriptor
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor) VALUES 
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
    (2, 6), (2, 7),
    (3, 8), (3, 9),
    (4, 10), (4, 11);

-- Inserir dades a la taula Criteri_Evidencia
INSERT INTO Criteri_Evidencia (id_criteri, id_evidencia) VALUES (1, 1);
INSERT INTO Criteri_Evidencia (id_criteri, id_evidencia) VALUES (1, 2);
INSERT INTO Criteri_Evidencia (id_criteri, id_evidencia) VALUES (2, 1);
