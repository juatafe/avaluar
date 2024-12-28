# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for, jsonify, abort
import sqlite3
import os
import sys

app = Flask(__name__)

# Determinar el directori base
BASE_DIR = getattr(sys, 'frozen', False) and os.path.dirname(sys.executable) or os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'avaluar.db')

# Funció per establir connexió amb la base de dades
def db_query(query, params=(), fetchone=False, fetchall=False, commit=False):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            if commit:
                conn.commit()
            if fetchone:
                return cursor.fetchone()
            if fetchall:
                return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"Error amb la base de dades: {e}")
        return None

# Pàgina inicial
@app.route('/')
def index():
    return render_template('index.html')

# Formulari per donar d'alta alumnes
@app.route('/alta-alumnes', methods=['GET', 'POST'])
def alta_alumnes():
    if request.method == 'POST':
        nia = request.form.get('nia')
        nom = request.form.get('nom')
        cognoms = request.form.get('cognoms')

        if not nia or not nom or not cognoms:
            return render_template('alta_alumnes.html', message="Falten camps obligatòris.")

        try:
            db_query("INSERT INTO Alumne (nia, nom, cognoms) VALUES (?, ?, ?)", (nia, nom, cognoms), commit=True)
            return redirect(url_for('index'))
        except sqlite3.Error as e:
            return render_template('alta_alumnes.html', message=f"Error: {e}")

    return render_template('alta_alumnes.html')

# API: Obtenir evidències
@app.route('/api/evidences', methods=['GET'])
def get_evidences():
    try:
        evidences = db_query("""
            SELECT e.id AS id_evidencia, e.descripcio AS evidencia_nom, 
                   d.nom AS descriptor_nom, d.valor AS descriptor_valor
            FROM Evidencia e
            LEFT JOIN Evidencia_Descriptor ed ON e.id = ed.id_evidencia
            LEFT JOIN Descriptor d ON ed.id_descriptor = d.id
        """, fetchall=True)

        if not evidences:
            return jsonify([])  # Retornem una llista buida si no hi ha dades

        # Processar les dades agrupant-les per evidència
        result = {}
        for evidencia in evidences:
            id_evidencia = evidencia['id_evidencia']
            nom_evidencia = evidencia['evidencia_nom']
            descriptor_nom = evidencia['descriptor_nom']
            descriptor_valor = evidencia['descriptor_valor']

            if id_evidencia not in result:
                result[id_evidencia] = {
                    'id': id_evidencia,
                    'nom': nom_evidencia,
                    'descriptors': []
                }

            # Afegim descriptors només si són vàlids
            if descriptor_nom and descriptor_valor is not None:
                result[id_evidencia]['descriptors'].append({
                    'nom': descriptor_nom,
                    'valor': descriptor_valor
                })

        # Retornem les evidències agrupades
        return jsonify(list(result.values()))
    except sqlite3.Error as e:
        print(f"Error obtenint evidències: {e}")
        return jsonify(error="Error amb la base de dades."), 500

# Mostrar detalls d'un RA
@app.route('/ra/<int:id_ra>')
def veure_ra(id_ra):
    try:
        ra = db_query("SELECT * FROM RA WHERE id_ra = ?", (id_ra,), fetchone=True)
        if ra is None:
            abort(404, description=f"RA amb id {id_ra} no trobat.")

        detalls = db_query("""
            SELECT 
                Criteri.id_criteri AS id_criteri,
                Evidencia.id AS id_evidencia,
                Alumne.nia AS nia,
                Criteri.descripcio AS criteri_descripcio, 
                Evidencia.descripcio AS evidencia_descripcio, 
                Alumne.nom AS alumne_nom, 
                Alumne.cognoms AS alumne_cognoms, 
                Criteri_Alumne_Evidencia.valor AS valor
            FROM 
                Criteri_Alumne_Evidencia
            JOIN Criteri ON Criteri_Alumne_Evidencia.id_criteri = Criteri.id_criteri
            JOIN Evidencia ON Criteri_Alumne_Evidencia.id_evidencia = Evidencia.id
            JOIN Alumne ON Criteri_Alumne_Evidencia.nia = Alumne.nia
            WHERE 
                Criteri.id_ra = ?
        """, (id_ra,), fetchall=True)

        return render_template('detalls_ra.html', ra=ra, detalls=detalls)
    except sqlite3.Error as e:
        print("Error carregant els detalls:", e)
        abort(500, description=f"Error: {e}")


@app.route('/api/ra/<int:id_ra>')
def get_ra_details(id_ra):
    try:
        detalls = db_query("""
            SELECT 
                Criteri.id_criteri,
                Evidencia.id AS id_evidencia,
                Alumne.nia,
                Criteri.descripcio AS criteri_descripcio, 
                Evidencia.descripcio AS evidencia_descripcio, 
                Alumne.nom AS alumne_nom, 
                Alumne.cognoms AS alumne_cognoms, 
                Criteri_Alumne_Evidencia.valor AS valor
            FROM 
                Criteri_Alumne_Evidencia
            JOIN Criteri ON Criteri_Alumne_Evidencia.id_criteri = Criteri.id_criteri
            JOIN Evidencia ON Criteri_Alumne_Evidencia.id_evidencia = Evidencia.id
            JOIN Alumne ON Criteri_Alumne_Evidencia.nia = Alumne.nia
            WHERE 
                Criteri.id_ra = ?
        """, (id_ra,), fetchall=True)
        
        # Retorna els resultats en format JSON
        return jsonify({'detalls': [dict(row) for row in detalls]})
    except Exception as e:
        print(f"Error recuperant dades per al RA {id_ra}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/visualitzar', methods=['GET', 'POST'])
def visualitzar():
    if request.method == 'POST':
        nia = request.form['nia']  # Obtenir el NIA introduït per l'usuari
        try:
            # Consulta SQL per obtenir els mòduls de l'alumne
            moduls = db_query("""
                SELECT DISTINCT Modul.id_modul, Modul.nom
                FROM Modul
                JOIN RA ON Modul.id_modul = RA.id_modul
                JOIN Criteri ON RA.id_ra = Criteri.id_ra
                LEFT JOIN Criteri_Alumne_Evidencia ON Criteri.id_criteri = Criteri_Alumne_Evidencia.id_criteri
                WHERE Criteri_Alumne_Evidencia.nia = ? 
                    OR EXISTS (
                        SELECT 1
                        FROM Criteri_Alumne_Evidencia cae
                        WHERE cae.id_criteri = Criteri.id_criteri
                    )
            """, (nia,), fetchall=True)

            # Renderitzar la plantilla amb els mòduls i el NIA
            return render_template('moduls.html', moduls=moduls, nia=nia)

        except sqlite3.Error as e:
            # Retornar un missatge d'error si falla la consulta
            return render_template('visualitzar.html', message=f"Error: {e}")

    # Si és GET, mostrar la pàgina inicial
    return render_template('visualitzar.html')

@app.route('/alta-entitats', methods=['GET', 'POST'])
def alta_entitats():
    cicles = db_query("SELECT id_cicle, nom FROM Cicle", fetchall=True)
    moduls = db_query("SELECT id_modul, nom FROM Modul", fetchall=True)
    evidencies = db_query("SELECT id, descripcio FROM Evidencia", fetchall=True)
    ras = db_query("SELECT id_ra, nom FROM RA", fetchall=True)
    criteris = db_query("SELECT id_criteri, descripcio FROM Criteri", fetchall=True)

    message = None
    if request.method == 'POST':
        tipus = request.form.get('tipus')
        nom = request.form.get('nom')
        params = ()
        query = ""

        try:
            if tipus == 'Cicle':
                query, params = "INSERT INTO Cicle (nom) VALUES (?)", (nom,)
            elif tipus == 'Modul':
                id_cicle = request.form.get('id_cicle')
                query, params = "INSERT INTO Modul (nom, id_cicle) VALUES (?, ?)", (nom, id_cicle)
            elif tipus == 'RA':
                id_modul = request.form.get('id_modul')
                ponderacio = request.form.get('ponderacio', 0)
                query, params = "INSERT INTO RA (nom, ponderacio, id_modul) VALUES (?, ?, ?)", (nom, ponderacio, id_modul)
            elif tipus == 'Criteri':
                id_ra = request.form.get('id_ra')
                ponderacio = request.form.get('ponderacio', 0)
                query, params = "INSERT INTO Criteri (descripcio, ponderacio, id_ra) VALUES (?, ?, ?)", (nom, ponderacio, id_ra)
            elif tipus == 'Evidencia':
                query, params = "INSERT INTO Evidencia (descripcio) VALUES (?)", (nom,)
            
            if query:
                db_query(query, params, commit=True)
                message = f"L'entitat {tipus} '{nom}' s'ha guardat correctament!"
            else:
                message = "Error: Tipus d'entitat desconegut."

        except Exception as e:
            message = f"Error al guardar l'entitat: {e}"

    return render_template(
        'alta_entitats.html',
        cicles=cicles,
        moduls=moduls,
        evidencies=evidencies,
        ras=ras,
        criteris=criteris,
        message=message
    )


@app.route('/modul/<int:id_modul>/<int:nia>')
def veure_modul_per_alumne(id_modul, nia):
    try:
        # Consulta SQL amb filtre pel NIA
        ras = db_query("""
            WITH EvidenciesPerCriteri AS (
                SELECT 
                    Criteri.id_criteri,
                    Criteri.id_ra,
                    Criteri.ponderacio AS ponderacio_criteri, 
                    AVG(CAE.valor) AS mitjana_evidencies
                FROM 
                    Criteri
                LEFT JOIN 
                    Criteri_Alumne_Evidencia CAE ON Criteri.id_criteri = CAE.id_criteri
                WHERE 
                    CAE.nia = ?
                GROUP BY 
                    Criteri.id_criteri, Criteri.id_ra, Criteri.ponderacio
            )
            SELECT 
                RA.id_ra,
                RA.nom AS nom_ra,
                RA.ponderacio AS ponderacio_ra,
                COALESCE(SUM(EvidenciesPerCriteri.mitjana_evidencies * EvidenciesPerCriteri.ponderacio_criteri / 100), 0) AS progress
            FROM 
                RA
            LEFT JOIN 
                EvidenciesPerCriteri ON RA.id_ra = EvidenciesPerCriteri.id_ra
            WHERE 
                RA.id_modul = ?
            GROUP BY 
                RA.id_ra, RA.nom, RA.ponderacio;
        """, (nia, id_modul), fetchall=True)

        # Imprimir resultats de manera llegible
        if not ras:
            print(f"No s'han trobat dades per al NIA {nia} i el Mòdul {id_modul}")
        else:
            print(f"Dades obtingudes per al NIA {nia} i el Mòdul {id_modul}:")
            for fila in ras:
                print(dict(fila))  # Converteix cada fila a diccionari

        # Retornar dades al frontend
        ras_llegible = [
            {
                **dict(row),
                'progress': round(row['progress'], 2),
                'aconseguit': round(row['progress'] * row['ponderacio_ra'] / 100, 2),
                'nom_ra': row['nom_ra']
            }
            for row in ras
        ]
        return render_template('ras.html', ras=ras_llegible, id_modul=id_modul, nia=nia)

    except sqlite3.Error as e:
        print(f"Error amb la base de dades: {e}")
        abort(500, description=f"Error amb la base de dades: {e}")

@app.route('/update-detalls-ra', methods=['POST'])
def update_detalls_ra():
    try:
        data = request.json
        print("Dades rebudes pel servidor:", data)  # Per depuració

        for detall in data.get('detalls', []):
            print("Processant detall:", detall)  # Per depuració
            db_query(
                """
                UPDATE Criteri_Alumne_Evidencia
                SET valor = ?
                WHERE id_criteri = ? AND id_evidencia = ? AND nia = ?
                """,
                (detall['valor'], detall['id_criteri'], detall['id_evidencia'], detall['nia']),
                commit=True
            )

        return jsonify(success=True)
    except Exception as e:
        print("Error desant les dades al servidor:", e)
        return jsonify(success=False, error=str(e))

@app.route('/update-ras', methods=['POST'])
def update_ras():
    try:
        # Llegeix les dades JSON de la petició
        data = request.get_json()
        print("Dades rebudes pel backend:", data)  # Depuració
        print("RAs a actualitzar:", data.get('ras', []))  # Depuració

        # Itera per actualitzar les ponderacions
        for ra in data.get('ras', []):
            print(f"Actualitzant RA amb id {ra['id_ra']} a ponderació {ra['ponderacio']}")  # Depuració
            db_query("""
                UPDATE RA
                SET ponderacio = ?
                WHERE id_ra = ?;
            """, (ra['ponderacio'], ra['id_ra']))

        # Retorna una resposta JSON correcta
        return jsonify({"success": True, "message": "Ponderacions actualitzades"})
    except Exception as e:
        print("Error desant les ponderacions:", e)
        return jsonify({"success": False, "message": str(e)}), 500




# Manejo d'errors personalitzats
@app.errorhandler(404)
def resource_not_found(e):
    return render_template('404.html', error=e), 404

if __name__ == '__main__':
    app.run(debug=True, port=5002)
