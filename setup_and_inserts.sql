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
    id_cicle INT,
    FOREIGN KEY (id_cicle) REFERENCES Cicle(id_cicle)
);

CREATE TABLE RA (
    id_ra INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL,
    id_modul INT,
    FOREIGN KEY (id_modul) REFERENCES Modul(id_modul)
);

CREATE TABLE Criteri (
    id_criteri INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    ponderacio DECIMAL(5, 2) NOT NULL,
    id_ra INT,
    FOREIGN KEY (id_ra) REFERENCES RA(id_ra)
);

CREATE TABLE Alumne (
    id_alumne INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL,
    cognoms VARCHAR(255) NOT NULL
);

CREATE TABLE Evidencia (
    id_evidencia INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Descriptor (
    id_descriptor INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE Evidencia_Descriptor (
    id_evidencia INT,
    id_descriptor INT,
    nota DECIMAL(5, 2),
    PRIMARY KEY (id_evidencia, id_descriptor),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia),
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor)
);

CREATE TABLE Criteri_Alumne_Evidencia (
    id_criteri INT,
    id_alumne INT,
    id_evidencia INT,
    id_descriptor INT,
    PRIMARY KEY (id_criteri, id_alumne, id_evidencia, id_descriptor),
    FOREIGN KEY (id_criteri) REFERENCES Criteri(id_criteri),
    FOREIGN KEY (id_alumne) REFERENCES Alumne(id_alumne),
    FOREIGN KEY (id_evidencia) REFERENCES Evidencia(id_evidencia),
    FOREIGN KEY (id_descriptor) REFERENCES Descriptor(id_descriptor)
);

-- Inserir dades a la taula Cicle
INSERT INTO Cicle (nom) VALUES ('ASIX'), ('DAW'), ('DAM');

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
INSERT INTO Alumne (nom, cognoms) VALUES 
('Joan', 'Garcia'), ('Maria', 'Lopez'), ('Pere', 'Martinez'),
('Anna', 'Sanchez'), ('Josep', 'Rodriguez'), ('Laura', 'Fernandez');

-- Inserir dades a la taula Evidencia
INSERT INTO Evidencia (nom) VALUES 
('Exercici competencial'), ('Sprint 1'), ('Observació'), 
('Evidencia 4'), ('Evidencia 5'), ('Evidencia 6');

-- Inserir dades a la taula Descriptor
INSERT INTO Descriptor (nom) VALUES 
('Excel·lent'), ('Notable'), ('Bé'), ('Suficient'), ('Insuficient'),
('Assolit'), ('NO Assolit'),
('Completat'), ('No completat'),
('Sap Fer'), ('No sap fer');

-- Inserir dades a la taula Evidencia_Descriptor
INSERT INTO Evidencia_Descriptor (id_evidencia, id_descriptor, nota) VALUES 
(1, 1, 10.00), (1, 2, 8.00), (1, 3, 6.00), (1, 4, 5.00), (1, 5, 1.00),
(2, 1, 10.00), (2, 2, 0.00),
(3, 1, 10.00), (3, 2, 0.00),
(4, 1, 10.00), (4, 2, 0.00);

-- Inserir dades a la taula Criteri_Alumne_Evidencia
INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_alumne, id_evidencia, id_descriptor) VALUES 
(1, 1, 1, 1), (1, 1, 1, 2), (1, 1, 1, 3),
(1, 2, 2, 1), (1, 2, 2, 2),
(2, 1, 3, 1), (2, 1, 3, 2),
(2, 3, 4, 1), (2, 3, 4, 2),
(3, 2, 5, 1), (3, 2, 5, 2),
(3, 3, 6, 1), (3, 3, 6, 2),
(1, 4, 1, 1), (1, 4, 1, 2),
(1, 5, 2, 1), (1, 5, 2, 2),
(2, 4, 3, 1), (2, 4, 3, 2),
(2, 5, 4, 1), (2, 5, 4, 2),
(3, 6, 5, 1), (3, 6, 5, 2),
(3, 6, 6, 1), (3, 6, 6, 2);