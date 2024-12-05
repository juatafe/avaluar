from flask import Flask, render_template, request, redirect, url_for
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
    if request.method == 'POST':
        # Obté les dades del formulari
        tipus = request.form['tipus']
        nom = request.form['nom']

        # Insereix a la base de dades segons el tipus
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        if tipus == 'Cicle':
            cursor.execute("INSERT INTO Cicle (nom) VALUES (?)", (nom,))
        elif tipus == 'Modul':
            cicle_id = request.form.get('cicle_id')
            if not cicle_id:
                conn.close()
                return "Error: Cal seleccionar un cicle per al mòdul.", 400
            cursor.execute("INSERT INTO Modul (nom, id_cicle) VALUES (?, ?)", (nom, cicle_id))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    return render_template('alta_entitats.html')

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
    conn.close()
    return render_template('detalls_ra.html', detalls=detalls)

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Canvia el port si el 5000 està ocupat
