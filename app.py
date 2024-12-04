from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os

app = Flask(__name__)

# Connexió a la base de dades
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'avaluar.db')

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
            cicle_id = request.form['cicle_id']
            cursor.execute("INSERT INTO Modul (nom, id_cicle) VALUES (?, ?)", (nom, cicle_id))
        # Afegeix altres tipus aquí

        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    # Per a GET: mostra el formulari
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

    # Per a GET: mostra el formulari
    return render_template('alta_alumnes.html')

# Visualitzar dades
@app.route('/visualitzar', methods=['GET'])
def visualitzar():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Alumne")
    alumnes = cursor.fetchall()
    conn.close()
    return render_template('visualitzar.html', alumnes=alumnes)

if __name__ == '__main__':
    app.run(debug=True)

