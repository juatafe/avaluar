# -*- coding: utf-8 -*-

"""
Aquest mòdul implementa una aplicació web Flask per a la gestió de registres i avaluacions d'estudiants.
Inclou rutes per a renderitzar plantilles, gestionar enviaments de formularis i proporcionar punts finals d'API.
Rutes:
- `/`: Renderitza la pàgina principal.
- `/alta-alumnes`: Gestiona el formulari per a afegir nous estudiants.
- `/api/evidences`: Proporciona un punt final d'API per a recuperar dades d'evidències.
- `/ra/<int:id_ra>`: Mostra els detalls d'un RA (Resultat d'Aprenentatge) específic.
- `/get_criteris/<int:id_ra>`: Proporciona un punt final d'API per a recuperar criteris per a un RA específic.
- `/api/ra/<int:id_ra>`: Proporciona un punt final d'API per a recuperar dades detallades per a un RA específic.
- `/visualitzar`: Gestiona el formulari per a visualitzar els mòduls d'estudiants.
- `/alta-entitats`: Gestiona el formulari per a afegir noves entitats (Cicle, Mòdul, RA, Criteri, Evidència).
- `/modul/<int:id_modul>/<int:nia>`: Mostra els detalls del mòdul per a un estudiant específic.
- `/update-detalls`: Punt final d'API per a actualitzar detalls.
- `/update-detalls-ra`: Punt final d'API per a actualitzar detalls de RA.
- `/update-ras`: Punt final d'API per a actualitzar les ponderacions de RA.
- `/ras/<int:id_modul>`: Mostra els RA per a un mòdul específic.
Funcions:
- `open_browser()`: Obri el navegador web per defecte a l'URL de l'aplicació.
- `format_date(value, format='%d/%m/%Y')`: Filtre Jinja2 per a formatar dates.
- `db_query(query, params=(), fetchone=False, fetchall=False, commit=False)`: Executa una consulta a la base de dades.
- `handle_exit(signum, frame)`: Gestiona l'eixida de l'aplicació per a un tancament net.
Base de dades:
- L'aplicació utilitza SQLite per a l'emmagatzematge de dades, amb el fitxer de base de dades situat a `avaluar.db`.
Plantilles:
- L'aplicació utilitza plantilles Jinja2 per a renderitzar pàgines HTML.
Gestió d'errors:
- L'aplicació inclou gestió d'errors per a operacions de base de dades i errors HTTP.
Seguretat:
- L'aplicació inclou mesures de seguretat bàsiques com la validació d'entrades i la gestió d'errors.
Ús:
- Executa l'aplicació a la carpeta dist/ amb `./app o amb app.exe`.
- L'aplicació s'obrirà en el navegador web per defecte a `http://127.0.0.1:5004/`.
"""


import webbrowser
from threading import Timer
from flask import Flask, render_template, request, redirect, url_for, jsonify, abort
import sqlite3
import os
import sys
from datetime import datetime
import signal  # Per capturar el tancament del procés

app = Flask(__name__)
app.config['DEBUG'] = False 

# Funció per obrir el navegador
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5004/")

# Registra el filtre `date` per a Jinja2
@app.template_filter('date')
def format_date(value, format='%d/%m/%Y'):
    if value is None:
        return 'No registrada'
    try:
        # Converteix el valor en un objecte datetime
        date_value = datetime.strptime(value, '%Y-%m-%d')
        return date_value.strftime(format)
    except ValueError:
        return value  # Retorna el valor sense modificar si no és vàlid


# Determinar el directori base
BASE_DIR = getattr(sys, 'frozen', False) and os.path.dirname(sys.executable) or os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'avaluar.db')

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
        # Recollir els valors del formulari
        nia = request.form.get('nia')
        nom = request.form.get('nom')
        cognoms = request.form.get('cognoms')
        id_moduls = request.form.getlist('id_moduls')  # IDs de mòduls seleccionats

        # Validació dels camps
        if not nia or not nom or not cognoms or not id_moduls:
            return render_template('alta_alumnes.html', message="Falten camps obligatoris.")

        try:
            # Inserir l'alumne a la taula `Alumne`
            db_query(
                "INSERT INTO Alumne (nia, nom, cognoms) VALUES (?, ?, ?)",
                (nia, nom, cognoms),
                commit=True
            )

            # Crear l'evidència inicial "Avaluació Zero" per als criteris de cada mòdul seleccionat
            for id_modul in id_moduls:
                criteris = db_query("""
                    SELECT id_criteri 
                    FROM Criteri 
                    WHERE id_ra IN (
                        SELECT id_ra 
                        FROM RA 
                        WHERE id_modul = ?
                    )
                """, (id_modul,), fetchall=True)

                for criteri in criteris:
                    db_query(
                        """
                        INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia, valor) 
                        VALUES (?, ?, ?, ?)
                        """,
                        (criteri['id_criteri'], 1, nia, None),  # `1` és l'ID de l'evidència "Avaluació Zero"
                        commit=True
                    )

            return redirect(url_for('index'))

        except sqlite3.Error as e:
            return render_template('alta_alumnes.html', message=f"Error: {e}")

    # Carregar mòduls per al formulari GET
    moduls = db_query("SELECT id_modul, nom FROM Modul", fetchall=True)
    return render_template('alta_alumnes.html', moduls=moduls)


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

@app.route('/get_criteris/<int:id_ra>')
def get_criteris(id_ra):
    try:
        criteris = db_query(
            "SELECT id_criteri, descripcio, ponderacio FROM Criteri WHERE id_ra = ?",
            (id_ra,),
            fetchall=True
        )
        print("Criteris retornats:", criteris)
        return jsonify(criteris=[dict(row) for row in criteris])
    except Exception as e:
        print("Error recuperant criteris:", e)
        return jsonify(success=False, error=str(e))

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
        
        # Log per depurar
        print(f"Detalls retornats pel RA {id_ra}: {detalls}")
        
        # Retorna els resultats en format JSON
        return jsonify({'detalls': [dict(row) for row in detalls]})
    except Exception as e:
        print(f"Error recuperant dades per al RA {id_ra}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/visualitzar', methods=['GET', 'POST'])
def visualitzar():
    if request.method == 'POST':
        nia = request.args.get('nia') or request.form.get('nia') #request.form['nia']  # Obtenir el NIA introduït per l'usuari
        if nia:
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
                    AVG(CAE.valor) AS mitjana_evidencies,
                    MAX(CAE.data) AS ultima_data
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
                COALESCE(SUM(EvidenciesPerCriteri.mitjana_evidencies * EvidenciesPerCriteri.ponderacio_criteri / 100), 0) AS progress,
                MAX(EvidenciesPerCriteri.ultima_data) AS ultima_data
            FROM 
                RA
            LEFT JOIN 
                EvidenciesPerCriteri ON RA.id_ra = EvidenciesPerCriteri.id_ra
            WHERE 
                RA.id_modul = ?
            GROUP BY 
                RA.id_ra, RA.nom, RA.ponderacio;
        """, (nia, id_modul), fetchall=True)

        # Gestionar el cas de resultats buits
        if not ras:
            print(f"No s'han trobat dades per al NIA {nia} i el Mòdul {id_modul}")
            ras = []  # Assigna una llista buida per evitar errors

        # Processar els resultats per enviar al frontend
        ras_llegible = [
            {
                **dict(row),
                'progress': round(row['progress'], 2),
                'aconseguit': round(row['progress'] * row['ponderacio_ra'] / 100, 2),
                'nom_ra': row['nom_ra'],
                'ultima_data': row['ultima_data'] or 'No registrada'
            }
            for row in ras
        ]

        # Retornar el template amb les dades
        return render_template('ras.html', ras=ras_llegible, id_modul=id_modul, nia=nia)

    except sqlite3.Error as e:
        print(f"Error amb la base de dades: {e}")
        abort(500, description=f"Error amb la base de dades: {e}")

# Ruta per actualitzar els detalls
@app.route('/update-detalls', methods=['POST'])
def update_detalls():
    try:
        data = request.json
        for detall in data.get('detalls', []):
            id_criteri = detall['id_criteri']
            id_evidencia = detall['id_evidencia']
            nia = detall['nia']
            valor = detall['valor']
            criteri_p = detall['ponderacio']

            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.cursor()

                if not valor:  # Si el valor és buit, eliminem la fila
                    print(f"Eliminant entrada per id_criteri={id_criteri}, id_evidencia={id_evidencia}, nia={nia}")
                    cursor.execute("""
                        DELETE FROM Criteri_Alumne_Evidencia
                        WHERE id_criteri = ? AND id_evidencia = ? AND nia = ?
                    """, (id_criteri, id_evidencia, nia))
                else:  # Actualitzar o inserir
                    cursor.execute("""
                        UPDATE Criteri_Alumne_Evidencia
                        SET valor = ?
                        WHERE id_criteri = ? AND id_evidencia = ? AND nia = ?
                    """, (valor, id_criteri, id_evidencia, nia))

                    if cursor.rowcount == 0:  # Si no existeix, inserir
                        cursor.execute("""
                            INSERT INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia, valor)
                            VALUES (?, ?, ?, ?)
                        """, (id_criteri, id_evidencia, nia, valor))

                conn.commit()

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))

# Ruta per actualitzar els detalls de RA
@app.route('/update-detalls-ra', methods=['POST'])
def update_detalls_ra():
    try:
        data = request.json
        print("Dades rebudes per actualitzar detalls:", data)

        # Processar detalls
        for detall in data.get('detalls', []):
            id_criteri = detall['id_criteri']
            id_evidencia = detall['id_evidencia']
            nia = detall['nia']
            valor = detall['valor']

            if not valor:  # Si el valor és buit, eliminem la fila
                db_query("""
                    DELETE FROM Criteri_Alumne_Evidencia
                    WHERE id_criteri = ? AND id_evidencia = ? AND nia = ?
                """, (id_criteri, id_evidencia, nia), commit=True)
            else:  # Actualitzar o inserir
                db_query("""
                    UPDATE Criteri_Alumne_Evidencia
                    SET valor = ?
                    WHERE id_criteri = ? AND id_evidencia = ? AND nia = ?
                """, (valor, id_criteri, id_evidencia, nia), commit=True)

                # Inserir si no existeix
                db_query("""
                    INSERT OR IGNORE INTO Criteri_Alumne_Evidencia (id_criteri, id_evidencia, nia, valor)
                    VALUES (?, ?, ?, ?)
                """, (id_criteri, id_evidencia, nia, valor), commit=True)

        # Processar ponderacions
        for ponderacio in data.get('ponderacions', []):
            id_criteri = ponderacio['id_criteri']
            valor = ponderacio['valor']

            db_query("""
                UPDATE Criteri
                SET ponderacio = ?
                WHERE id_criteri = ?
            """, (valor, id_criteri), commit=True)

        # Processar criteris_p
        for item in data.get('criteri_p', []):
            db_query("""
                UPDATE Criteri
                SET ponderacio = ?
                WHERE id_criteri = ?
            """, (item['ponderacio'], item['id_criteri']), commit=True)

        return jsonify(success=True)

    except Exception as e:
        print("Error actualitzant els detalls:", e)
        return jsonify(success=False, error=str(e))


@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

# Ruta per actualitzar les ponderacions dels RAs
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

@app.route('/ras/<int:id_modul>')
def mostrar_ras(id_modul):
    try:
        # Obtenir el nom del mòdul
        modul = db_query("SELECT nom FROM Modul WHERE id_modul = ?", (id_modul,))
        if not modul:
            return "Mòdul no trobat", 404
        nom_modul = modul[0][0]

        # Obtenir els resultats d'aprenentatge (RA) del mòdul
        ras = db_query("""
            SELECT ra.id_ra, ra.nom AS nom_ra, ra.ponderacio AS ponderacio_ra, ra.progress, ra.aconseguit, ra.ultima_data
            FROM RA ra
            WHERE ra.id_modul = ?
        """, (id_modul,))

        # Renderitzar la plantilla amb les dades
        return render_template('ras.html', nom_modul=nom_modul, ras=ras)
    except Exception as e:
        print("Error mostrant els resultats d'aprenentatge:", e)
        return "Error mostrant els resultats d'aprenentatge", 500


@app.template_filter('date')
def format_date(value, format='%d/%m/%Y'):
    if value is None:
        return 'No registrada'
    try:
        date_value = datetime.strptime(value, '%Y-%m-%d')
        return date_value.strftime(format)
    except ValueError:
        return value



# Manejador per al tancament net
def handle_exit(signum, frame):
    print("\nTancant l'aplicació correctament...")
    # Aquí pots afegir qualsevol lògica de tancament, com tancar connexions a bases de dades.
    sys.exit(0)

if __name__ == '__main__':
    # Registrar el manejador per a SIGINT (Ctrl+C)
    signal.signal(signal.SIGINT, handle_exit)

    # Llança un temporitzador per obrir el navegador
    Timer(1, open_browser).start()

    # Inicia l'aplicació Flask
    try:
        app.run(debug=False, port=5004)
    except KeyboardInterrupt:
        handle_exit(None, None)


