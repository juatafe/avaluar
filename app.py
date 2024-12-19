# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for, jsonify, abort
import sqlite3
import os
import sys

app = Flask(__name__)

# Determinar el directori base en funció de si s'executa com a executable o codi font
if getattr(sys, 'frozen', False):
    # Si l'aplicació està empaquetada amb PyInstaller
    BASE_DIR = os.path.dirname(sys.executable)
else:
    # Si s'executa com a codi Python
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ruta de la base de dades
DB_PATH = os.path.join(BASE_DIR, 'avaluar.db')
print("Path de la base de dades:", DB_PATH)

# Pàgina inicial
@app.route('/')
def index():
    return render_template('index.html')

# Formularis per donar d'alta entitats
@app.route('/alta-entitats', methods=['GET', 'POST'])
def alta_entitats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Obtenir opcions de cicles, evidències i altres entitats relacionades
    cursor.execute("SELECT id_cicle, nom FROM Cicle")
    cicles = cursor.fetchall()

    cursor.execute("SELECT id_modul, nom FROM Modul")
    moduls = cursor.fetchall()

    cursor.execute("SELECT id_evidencia, nom FROM Evidencia")
    evidencies = cursor.fetchall()

    cursor.execute("SELECT id_ra, nom FROM RA")
    ras = cursor.fetchall()

    cursor.execute("SELECT id_criteri, nom FROM Criteri")
    criteris = cursor.fetchall()

    message = None

    if request.method == 'POST':
        tipus = request.form['tipus']
        nom = request.form['nom']

        try:
            if tipus == 'Cicle':
                cursor.execute("INSERT INTO Cicle (nom) VALUES (?)", (nom,))
            elif tipus == 'Modul':
                id_cicle = request.form.get('id_cicle')
                cursor.execute("INSERT INTO Modul (nom, id_cicle) VALUES (?, ?)", (nom, id_cicle))
            elif tipus == 'RA':
                id_modul = request.form.get('id_modul')
                ponderacio = request.form.get('ponderacio')
                cursor.execute("INSERT INTO RA (nom, ponderacio, id_modul) VALUES (?, ?, ?)", (nom, ponderacio, id_modul))
            elif tipus == 'Criteri':
                id_ra = request.form.get('id_ra')
                ponderacio = request.form.get('ponderacio')
                cursor.execute("INSERT INTO Criteri (nom, ponderacio, id_ra) VALUES (?, ?, ?)", (nom, ponderacio, id_ra))
            elif tipus == 'Evidencia':
                cursor.execute("INSERT INTO Evidencia (nom) VALUES (?)", (nom,))
            elif tipus == 'Descriptor':
                id_evidencia = request.form.get('id_evidencia')
                valor = request.form.get('valor')
                cursor.execute("INSERT INTO Descriptor (nom, valor, id_evidencia) VALUES (?, ?, ?)", (nom, valor, id_evidencia))

            conn.commit()
            message = f"L'entitat {tipus} '{nom}' s'ha guardat correctament!"
        except Exception as e:
            message = f"Error al guardar l'entitat: {e}"
        finally:
            conn.close()

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
        # Obté les dades del formulari
        nia = request.form['nia']
        nom = request.form['nom']

        # Insereix a la base de dades
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Alumne (nia, nom) VALUES (?, ?)", (nia, nom))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    return render_template('alta_alumnes.html')

# Visualitzar dades
@app.route('/visualitzar', methods=['GET', 'POST'])
def visualitzar():
    if request.method == 'POST':
        nia = request.form['nia']
        # Recuperar els mòduls associats al NIA
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Modul.id_modul, Modul.nom
            FROM Alumne
            JOIN Modul_Alumne ON Alumne.nia = Modul_Alumne.nia
            JOIN Modul ON Modul_Alumne.id_modul = Modul.id_modul
            WHERE Alumne.nia = ?
        """, (nia,))
        moduls = cursor.fetchall()
        conn.close()
        return render_template('moduls.html', moduls=moduls, nia=nia)
    return render_template('visualitzar.html')

# Mostrar els RAs d'un mòdul
@app.route('/modul/<int:id_modul>')
def veure_modul(id_modul):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT RA.id_ra, RA.nom, RA.ponderacio
        FROM RA
        WHERE RA.id_modul = ?
    """, (id_modul,))
    ras = cursor.fetchall()
    conn.close()
    return render_template('ras.html', ras=ras, id_modul=id_modul)

# Mostrar detalls d'un RA
@app.route('/ra/<int:id_ra>')
def veure_ra(id_ra):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Obtener detalles del RA
    cursor.execute("SELECT * FROM RA WHERE id_ra = ?", (id_ra,))
    ra = cursor.fetchone()
    
    if ra is None:
        abort(404, description=f"RA con id {id_ra} no encontrado.")
    
    # Obtener detalles de criterios, evidencias y descriptores
    cursor.execute("""
        SELECT 
            Criteri.nom AS criteri_nom, 
            Criteri.ponderacio, 
            Evidencia.nom AS evidencia, 
            Descriptor.nom AS descriptor
        FROM 
            Criteri
        JOIN 
            Criteri_Evidencia ON Criteri.id_criteri = Criteri_Evidencia.id_criteri
        JOIN 
            Evidencia ON Criteri_Evidencia.id_evidencia = Evidencia.id_evidencia
        LEFT JOIN 
            Evidencia_Descriptor ON Evidencia.id_evidencia = Evidencia_Descriptor.id_evidencia
        LEFT JOIN 
            Descriptor ON Evidencia_Descriptor.id_descriptor = Descriptor.id_descriptor
        WHERE 
            Criteri.id_ra = ?
    """, (id_ra,))
    detalls = cursor.fetchall()

    cursor.execute("SELECT nom FROM Evidencia")
    evidencies = cursor.fetchall()

    conn.close()
    return render_template('detalls_ra.html', ra=ra, detalls=detalls, evidencies=evidencies)

@app.route('/get_descriptors/<evidencia>')
def get_descriptors(evidencia):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT Descriptor.nom
        FROM Descriptor
        JOIN Evidencia_Descriptor ON Descriptor.id_descriptor = Evidencia_Descriptor.id_descriptor
        JOIN Evidencia ON Evidencia_Descriptor.id_evidencia = Evidencia.id_evidencia
        WHERE Evidencia.nom = ?
    """, (evidencia,))
    descriptors = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(descriptors=descriptors)

@app.route('/api/evidences', methods=['GET'])
def get_evidences():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.id_evidencia, e.nom, d.nom AS descriptor, d.valor
        FROM Evidencia e
        LEFT JOIN Evidencia_Descriptor ed ON e.id_evidencia = ed.id_evidencia
        LEFT JOIN Descriptor d ON ed.id_descriptor = d.id_descriptor
    """)
    evidences = cursor.fetchall()

    result = {}
    for evidencia in evidences:
        id_evidencia = evidencia[0]
        nom_evidencia = evidencia[1]
        descriptor = evidencia[2]
        valor = evidencia[3]

        if id_evidencia not in result:
            result[id_evidencia] = {
                'nom': nom_evidencia,
                'descriptors': []
            }
        result[id_evidencia]['descriptors'].append({
            'nom': descriptor,
            'valor': valor
        })

    conn.close()
    return jsonify(result)

# Manejo de errores personalizados
@app.errorhandler(404)
def resource_not_found(e):
    return render_template('404.html', error=e), 404

if __name__ == '__main__':
    app.run(debug=True, port=5002)  # Executar l'aplicació en mode debug