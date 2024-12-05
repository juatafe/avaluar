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

-- Missatge d'informació
SELECT 'Dades inserides correctament!' AS resultat;
