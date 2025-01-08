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


-- Inserir dades a la taula Criteri
-- INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES ('Criteri 1', 30, 1);
-- INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES ('Criteri 2', 40, 2);

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
INSERT INTO Evidencia (id, descripcio) VALUES (1, 'Avaluació Zero');
INSERT INTO Evidencia (descripcio) VALUES ('Examen 1');
INSERT INTO Evidencia (descripcio) VALUES ('Projecte 1');
INSERT INTO Evidencia (descripcio) VALUES ('Observació 1');
INSERT INTO Evidencia (descripcio) VALUES ('Treball 1');
INSERT INTO Evidencia (descripcio) VALUES ('Pregunta 3');
INSERT INTO Evidencia (descripcio) VALUES ('Mapa Conceptual 1');
INSERT INTO Evidencia (descripcio) VALUES ('Sprint 1');
INSERT INTO Evidencia (descripcio) VALUES ('Sprint 2');
INSERT INTO Evidencia (descripcio) VALUES ('Sprint 3');
INSERT INTO Evidencia (descripcio) VALUES ('Sprint 4');
INSERT INTO Evidencia (descripcio) VALUES ('Sprint 5');
INSERT INTO Evidencia (descripcio) VALUES ('Presentació');

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
    (6, 11), (6, 12), (6, 13), (6, 14),
    (7, 1), (7, 2), (7, 3), (7, 4), (7, 5), -- Sprint 1
    (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), -- Sprint 2
    (9, 1), (9, 2), (9, 3), (9, 4), (9, 5), -- Sprint 3
    (10, 1), (10, 2), (10, 3), (10, 4), (10, 5), -- Sprint 4
    (11, 1), (11, 2), (11, 3), (11, 4), (11, 5), -- Sprint 5
    (12, 6), (12, 7); -- Presentació

-- Inserir Resultats d'Aprenentatge FH amb numeració i descripció
INSERT INTO RA (nom, ponderacio, id_modul) VALUES 
('RA1- Configura equips microinformàtics, components i perifèrics, analitzant les seues característiques i relació amb el conjunt.', 33, 1),
('RA2- Instal·la programari de propòsit general, avaluant-ne les característiques i entorns d''aplicació.', 22, 1),
('RA3- Executa procediments per recuperar el programari base d''un equip, analitzant-los i utilitzant imatges emmagatzemades en memòria auxiliar.', 11, 1),
('RA4- Implanta maquinari específic de centres de processament de dades (CPD), analitzant-ne les característiques i aplicacions.', 17, 1),
('RA5- Compleix les normes de prevenció de riscos laborals i de protecció ambiental, identificant els riscos associats, les mesures i equips per prevenir-los.', 17, 1);

-- Inserir tots els criteris per cada RA amb lletra i descripció
INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES 
-- Criteris per al RA1
('a) S''han identificat i caracteritzat els dispositius que constitueixen els blocs funcionals d''un equip microinformàtic.', 10, 1),
('b) S''ha descrit el paper dels elements físics i lògics que intervenen en el procés de posada en marxa d''un equip.', 10, 1),
('c) S''ha analitzat l''arquitectura general d''un equip i els mecanismes de connexió entre dispositius.', 10, 1),
('d) S''han establert els paràmetres de configuració (maquinari i programari) d''un equip microinformàtic amb les utilitats específiques.', 10, 1),
('e) S''han avaluat les prestacions de l''equip.', 10, 1),
('f) S''han executat utilitats de comprovació i diagnòstic.', 10, 1),
('g) S''han identificat avaries i les seues causes.', 10, 1),
('h) S''han classificat els dispositius perifèrics i els seus mecanismes de comunicació.', 10, 1),
('i) S''han utilitzat protocols estàndard de comunicació sense fils entre dispositius.', 10, 1),

-- Criteris per al RA2
('a) S''han catalogat els tipus de programari segons la seua llicència, distribució i propòsit.', 5, 2),
('b) S''han analitzat les necessitats específiques de programari associades a l''ús de sistemes informàtics en diferents entorns productius.', 10, 2),
('c) S''han instal·lat i avaluat utilitats per a la gestió d''arxius, recuperació de dades, manteniment i optimització del sistema.', 10, 2),
('d) S''han instal·lat i avaluat utilitats de seguretat bàsica.', 10, 2),
('e) S''ha instal·lat i avaluat programari ofimàtic i de propòsit general.', 10, 2),
('f) S''ha consultat la documentació i les ajudes interactives.', 5, 2),
('g) S''ha verificat la repercussió de l''eliminació, modificació i/o actualització de les utilitats instal·lades al sistema.', 5, 2),
('h) S''han provat i comparat aplicacions portables i no portables.', 5, 2),
('i) S''han realitzat inventaris del programari instal·lat i les característiques de la seua llicència.', 5, 2),

-- Criteris per al RA3
('a) S''han identificat els suports de memòria auxiliar adequats per a l''emmagatzematge i restauració d''imatges de programari.', 10, 3),
('b) S''ha reconegut la diferència entre una instal·lació estàndard i una preinstal·lació o imatge de programari.', 10, 3),
('c) S''han identificat i provat les diferents seqüències d''arrencada configurables en un equip.', 10, 3),
('d) S''han utilitzat eines per al particionat de discos.', 10, 3),
('e) S''han emprat diferents utilitats i suports per a realitzar imatges.', 10, 3),
('f) S''han restaurat imatges des de diferents ubicacions.', 10, 3),

-- Criteris per al RA4
('a) S''han reconegut les diferències entre les configuracions maquinari de tipus personal i empresarial.', 10, 4),
('b) S''han analitzat entorns que requereixen implantar solucions maquinari específiques.', 10, 4),
('c) S''han detallat components maquinari específics per a solucions empresarials.', 10, 4),
('d) S''han analitzat els requeriments bàsics de seguretat física, organització i condicions ambientals d''un CPD.', 10, 4),
('e) S''han implantat sistemes d''alimentació ininterrompuda i estabilitzadors de tensió.', 10, 4),
('f) S''han manipulat correctament dispositius maquinari per a emmagatzematge i alimentació amb connexió en calent.', 10, 4),
('g) S''han documentat procediments, incidències i paràmetres utilitzats en la instal·lació i configuració de dispositius maquinari.', 10, 4),
('h) S''han utilitzat eines d''inventariat, registrant les característiques dels dispositius maquinari.', 10, 4),
('i) S''ha classificat i organitzat la documentació tècnica, controladors, utilitats i accessoris del maquinari.', 10, 4),

-- Criteris per al RA5
('a) S''han identificat els riscos i el nivell de perillositat que suposen la manipulació dels materials, eines, útils, màquines i mitjans de transport.', 10, 5),
('b) S''han operat les màquines respectant les normes de seguretat.', 10, 5),
('c) S''han identificat les causes més freqüents d''accidents en la manipulació de materials i eines, entre altres.', 10, 5),
('d) S''han descrit els elements de seguretat (proteccions, alarmes, i passos d''emergència, entre altres) de les màquines i els equips de protecció individual (calçat, protecció ocular i indumentària, entre altres).', 10, 5),
('e) S''ha relacionat la manipulació de materials, eines i màquines amb les mesures de seguretat i protecció personal requerits.', 10, 5),
('f) S''han identificat les possibles fonts de contaminació de l''entorn ambiental.', 10, 5),
('g) S''han classificat els residus generats per a la seua retirada selectiva.', 10, 5),
('h) S''ha valorat l''ordre i la neteja d''instal·lacions i equips com a primer factor de prevenció de riscos.', 10, 5);


-- Inserir dades a la taula RA
INSERT INTO RA (nom, ponderacio, id_modul) VALUES ('RA 2', 30, 2);
