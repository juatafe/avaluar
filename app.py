from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# Ruta principal
@app.route('/')
def index():
    conn = sqlite3.connect('avaluar.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Cicle")
    cicles = cursor.fetchall()
    conn.close()
    return render_template('index.html', cicles=cicles)

# Ruta per afegir un cicle
@app.route('/add', methods=['POST'])
def add_cicle():
    nom = request.form['nom']
    conn = sqlite3.connect('avaluar.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Cicle (nom) VALUES (?)", (nom,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

# Inici de l'aplicació
if __name__ == '__main__':
    app.run(debug=True)

