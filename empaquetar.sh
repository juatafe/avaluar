# empaquetar.sh
pyinstaller --onefile --add-data "templates:templates" --add-data "static:static" app.py
cp avaluar.db dist/

