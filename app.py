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

# Formularis per donar d'alta entitats
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

# Formulari per donar d'alta alumnes
@app.route('/alta-alumnes', methods=['GET', 'POST'])
def alta_alumnes():
    if request.method == 'POST':
        nia = request.form['nia']
        nom = request.form['nom']
        cognoms = request.form['cognoms']

        try:
            db_query("INSERT INTO Alumne (nia, nom, cognoms) VALUES (?, ?, ?)", (nia, nom, cognoms), commit=True)
            return redirect(url_for('index'))
        except sqlite3.Error as e:
            return render_template('alta_alumnes.html', message=f"Error: {e}")

    return render_template('alta_alumnes.html')

# Visualitzar dades d'alumnes i mòduls associats
@app.route('/visualitzar', methods=['GET', 'POST'])
def visualitzar():
    if request.method == 'POST':
        nia = request.form['nia']
        try:
            moduls = db_query("""
                SELECT Modul.id_modul, Modul.nom
                FROM Alumne
                JOIN Modul_Alumne ON Alumne.nia = Modul_Alumne.nia
                JOIN Modul ON Modul_Alumne.id_modul = Modul.id_modul
                WHERE Alumne.nia = ?
            """, (nia,), fetchall=True)
            return render_template('moduls.html', moduls=moduls, nia=nia)
        except sqlite3.Error as e:
            return render_template('visualitzar.html', message=f"Error: {e}")

    return render_template('visualitzar.html')

# Mostrar els RAs d'un mòdul
@app.route('/modul/<int:id_modul>')
def veure_modul(id_modul):
    try:
        ras = db_query("""
            SELECT RA.id_ra, RA.nom, RA.ponderacio
            FROM RA
            WHERE RA.id_modul = ?
        """, (id_modul,), fetchall=True)
        return render_template('ras.html', ras=ras, id_modul=id_modul)
    except sqlite3.Error as e:
        abort(500, description=f"Error: {e}")

# Mostrar detalls d'un RA
@app.route('/ra/<int:id_ra>')
def veure_ra(id_ra):
    try:
        ra = db_query("SELECT * FROM RA WHERE id_ra = ?", (id_ra,), fetchone=True)
        if ra is None:
            abort(404, description=f"RA amb id {id_ra} no trobat.")

        detalls = db_query("""
            SELECT 
                Criteri.descripcio AS criteri_descripcio, 
                Evidencia.descripcio AS evidencia_descripcio, 
                Alumne.nom AS alumne_nom, 
                Alumne.cognoms AS alumne_cognoms, 
                Descriptor.nom AS descriptor_nom, 
                Descriptor.valor AS descriptor_valor
            FROM 
                Criteri_Alumne_Evidencia
            JOIN Criteri ON Criteri_Alumne_Evidencia.id_criteri = Criteri.id_criteri
            JOIN Evidencia ON Criteri_Alumne_Evidencia.id_evidencia = Evidencia.id
            JOIN Alumne ON Criteri_Alumne_Evidencia.nia = Alumne.nia
            JOIN Evidencia_Descriptor ON Evidencia.id = Evidencia_Descriptor.id_evidencia
            JOIN Descriptor ON Evidencia_Descriptor.id_descriptor = Descriptor.id
            WHERE 
                Criteri.id_ra = ?
        """, (id_ra,), fetchall=True)
        return render_template('detalls_ra.html', ra=ra, detalls=detalls)
    except sqlite3.Error as e:
        abort(500, description=f"Error: {e}")

# Obtenir descriptors per evidència (API)
@app.route('/get_descriptors/<evidencia>')
def get_descriptors(evidencia):
    descriptors = db_query("""
        SELECT Descriptor.nom
        FROM Descriptor
        JOIN Evidencia_Descriptor ON Descriptor.id = Evidencia_Descriptor.id_descriptor
        JOIN Evidencia ON Evidencia_Descriptor.id_evidencia = Evidencia.id
        WHERE Evidencia.descripcio = ?
    """, (evidencia,), fetchall=True)
    return jsonify(descriptors=[row['nom'] for row in descriptors])

# API: Obtenir evidències
@app.route('/api/evidences', methods=['GET'])
def get_evidences():
    evidences = db_query("""
        SELECT e.id, e.descripcio, d.nom AS descriptor, d.valor
        FROM Evidencia e
        LEFT JOIN Evidencia_Descriptor ed ON e.id = ed.id_evidencia
        LEFT JOIN Descriptor d ON ed.id_descriptor = d.id
    """, fetchall=True)

    result = {}
    for evidencia in evidences:
        id_evidencia = evidencia['id']
        nom_evidencia = evidencia['descripcio']
        descriptor = evidencia['descriptor']
        valor = evidencia['valor']

        if id_evidencia not in result:
            result[id_evidencia] = {
                'nom': nom_evidencia,
                'descriptors': []
            }
        if descriptor and valor is not None:
            result[id_evidencia]['descriptors'].append({
                'nom': descriptor,
                'valor': valor
            })

    return jsonify(result)

# Manejo d'errors personalitzats
@app.errorhandler(404)
def resource_not_found(e):
    return render_template('404.html', error=e), 404

if __name__ == '__main__':
    app.run(debug=True, port=5004)
