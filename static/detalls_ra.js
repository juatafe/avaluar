let evidences = [];
let evidencesAfegides = [];
let criteris = [];
let savedData = [];
// Defineix raId al carregar la pàgina
const raId = window.location.pathname.split('/').pop();
const nia = document.querySelector('input[name="nia"]').value;

console.log("raId obtingut:", raId);

async function fetchEvidences() {
    try {
        const response = await fetch('/api/evidences');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Evidències carregades des de l'API:", data);
        return data;
    } catch (error) {
        console.error('Error fetching evidences:', error);
        return [];
    }
}

async function fetchCriteris(id_ra) {
    try {
        const response = await fetch(`/get_criteris/${id_ra}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Ponderacions dels criteris carregades des de l'API:", data);
        return data.criteris || []; // Retorna la llista de criteris o una llista buida
    } catch (error) {
        console.error('Error fetching criteris:', error);
        return [];
    }
}


async function updateEvidenceDropdown() {
    const select = document.getElementById('evidence-select');
    
    try {
        // Carrega les evidències des de l'API
        const evidences = await fetchEvidences();

        // Buida el desplegable abans d'afegir noves opcions
        select.innerHTML = '<option value="" disabled selected>Selecciona una evidència</option>';

        // Afegeix cada evidència com a opció
        evidences.forEach(evidence => {
            const option = document.createElement('option');
            option.value = evidence.id; // ID de l'evidència
            option.textContent = evidence.nom; // Nom de l'evidència
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error actualitzant el desplegable d'evidències:", error);
    }
}



function manualUpdate(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0 || value > 10) {
        input.value = ''; // Reinicia el valor si és invàlid
    } else {
        input.value = value.toFixed(2); // Limitar a 2 decimals
    }
    calculateTotals(); // Actualitzar els totals
}

function processRow(row) {
    const evidences = [];
    const nia = row.dataset.nia;
    const idCriteri = row.dataset.idCriteri;
    let ponderacio = null;

    console.log("Processant fila amb nia:", nia);

    // Capturar la ponderació
    const ponderacioInput = row.querySelector('.ponderacio');
    if (ponderacioInput) {
        ponderacio = parseFloat(ponderacioInput.value) || 0; // Si està buit, assumir 0
        console.log(`Ponderació capturada: ${ponderacio}`);
    }

    row.querySelectorAll('[data-id-evidencia]').forEach(evidenceElem => {
        const idEvidencia = evidenceElem.dataset.idEvidencia;
        const descriptorSelect = evidenceElem.querySelector('select');
        const input = evidenceElem.querySelector('input');

        const valorDescriptor = descriptorSelect?.value || null;
        const valorInput = input?.value ? parseFloat(input.value) : null;

        // Si el descriptor és "Selecciona descriptor" o no hi ha valor, enviar com a eliminació
        if (!idEvidencia || valorDescriptor === "" || valorDescriptor === "Selecciona descriptor") {
            console.warn(`Afegint per eliminar: idEvidencia=${idEvidencia}, valorDescriptor=${valorDescriptor}`);
            evidences.push({
                id_evidencia: idEvidencia,
                id_criteri: idCriteri,
                nia: nia,
                valor: null // Es marca com a nul per eliminar al backend
            });
            return;
        }

        // Afegir una entrada vàlida
        evidences.push({
            id_evidencia: idEvidencia,
            id_criteri: idCriteri,
            nia: nia,
            valor: valorInput || valorDescriptor,
        });

        console.log(`Afegit: id_criteri=${idCriteri}, id_evidencia=${idEvidencia}, valor=${valorInput || valorDescriptor}`);
    });

    return { id_criteri: idCriteri, nia: nia, ponderacio: ponderacio, evidencies: evidences };
}

async function guardarDetalls() {
    const rows = document.querySelectorAll('tr[data-id-criteri]');
    const detalls = [];
    const ponderacions = [];

    rows.forEach(row => {
        const idCriteri = row.dataset.idCriteri;
        const nia = row.dataset.nia;

        // Captura de la ponderació
        const ponderacioInput = row.querySelector('.ponderacio');
        const ponderacio = ponderacioInput ? parseFloat(ponderacioInput.value) || 0 : null;

        // Afegir ponderació si és vàlida
        if (ponderacio !== null) {
            ponderacions.push({ id_criteri: idCriteri, valor: ponderacio });
        }

        // Processar evidències per fila
        const evidencies = row.querySelectorAll('td[data-id-evidencia]');
        evidencies.forEach(evidenciaCell => {
            const idEvidencia = evidenciaCell.dataset.idEvidencia;
            const input = evidenciaCell.querySelector('input');
            const select = evidenciaCell.querySelector('select');

            if (select && select.value === "seleccionar descriptor") {
                // Si es selecciona "seleccionar descriptor", esborra la nota i marca per eliminar
                if (input) {
                    input.value = "";
                }
                detalls.push({
                    id_criteri: idCriteri,
                    id_evidencia: idEvidencia,
                    nia: nia,
                    valor: null,
                    eliminar: true
                });
            } else {
                // Si no es selecciona "seleccionar descriptor", desa la nota
                const valor = input ? parseFloat(input.value) || 0 : 0;
                detalls.push({
                    id_criteri: idCriteri,
                    id_evidencia: idEvidencia,
                    nia: nia,
                    valor: valor
                });
            }
        });
    });

    console.log("Dades a enviar (detalls):", detalls);
    console.log("Dades a enviar (ponderacions):", ponderacions);

    try {
        // Enviar dades al backend
        const response = await fetch('/update-detalls-ra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ra_id: raId, // Assegura que raId està definit correctament
                detalls: detalls,
                ponderacions: ponderacions,
            }),
        });

        const result = await response.json();
        console.log("Resposta del servidor:", result);

        if (!result.success) {
            throw new Error(result.error);
        }

        alert("Dades desades correctament!");
    } catch (error) {
        console.error("Error desant dades:", error);
        alert("Error desant dades.");
    }
    calculateTotals(); // Recalcula els totals després de desar
}

function updateNota(select) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = parseFloat(selectedOption.dataset.nota) || 0;
    const input = select.parentElement.querySelector('input');

    if (!select.value) {
        input.value = '';
    } else {
        input.value = nota.toFixed(2);
    }

    const row = select.closest('tr');
    const idCriteri = row.dataset.idCriteri;
    const idEvidencia = select.closest('td').dataset.idEvidencia;
    let nia = row.dataset.nia;

    if (!nia) {
        const rowZero = document.querySelector('tr[data-id-criteri][data-nia]');
        if (rowZero) {
            nia = rowZero.dataset.nia;
            console.log("NIA obtingut de l'evidència 'Avaluació Zero':", nia);
        }
    }

    if (!idCriteri || !idEvidencia || !nia) {
        console.warn('Alguna dada no està definida:', { idCriteri, idEvidencia, nia });
        return;
    }

    console.log(`Actualitzant nota: Criteri=${idCriteri}, Evidència=${idEvidencia}, NIA=${nia}, Valor=${nota}`);
    calculateTotals();
}



function calculateTotals() {
    const table = document.querySelector('.table-wrapper table');
    if (!table) {
        console.error("Error: No s'ha trobat la taula.");
        return;
    }

    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) {
        console.error("Error: No hi ha files al cos de la taula.");
        return;
    }

    const totalsRow = table.querySelector('tfoot tr');
    if (!totalsRow) {
        console.error("Error: No s'ha trobat la fila de totals.");
        return;
    }

    // Calcular els totals per cada columna d'evidències
    const totals = Array.from(totalsRow.querySelectorAll('.evidence-total'));
    totals.forEach((totalCell, colIndex) => {
        let sum = 0;
        let count = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const cell = cells[colIndex + 4]; // Saltar les primeres columnes (criteris, ponderació, etc.)

            if (cell) {
                const input = cell.querySelector('input');
                const select = cell.querySelector('select');
                const value = input ? parseFloat(input.value) || 0 : 0;

                if (select && select.value && !isNaN(value)) {
                    sum += value;
                    count++;
                }
            }
        });

        const average = count > 0 ? (sum / count).toFixed(2) : 0;
        totalCell.textContent = average;
    });

    // Actualitzar "Progrés" i "Aconseguit" per cada criteri
    rows.forEach(row => {
        const ponderacio = parseFloat(row.querySelector('.ponderacio').value) || 0;
        const inputs = row.querySelectorAll('td input');
        let sum = 0;
        let count = 0;

        inputs.forEach(input => {
            const value = parseFloat(input.value);
            const select = input.parentElement.querySelector('select');
            if (!isNaN(value) && select && select.value) {
                sum += value;
                count++;
            }
        });

        const progressCell = row.querySelector('.progress');
        const aconseguitCell = row.querySelector('.aconseguit');
        const progressValue = count > 0 ? (sum / count).toFixed(2) : 0;
        const aconseguitValue = (ponderacio * (progressValue / 100)).toFixed(2);

        progressCell.textContent = progressValue;
        aconseguitCell.textContent = aconseguitValue;
    });

    // Calcular totals globals
    const totalPonderacio = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.ponderacio').value) || 0), 0);
    const totalAconseguit = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.aconseguit').textContent) || 0), 0);
    const totalProgres = Array.from(rows).reduce(
        (acc, row) => acc + (parseFloat(row.querySelector('.progress').textContent) || 0),
        0
    );

    totalsRow.querySelector('.total-ponderacio').textContent = totalPonderacio.toFixed(2);
    totalsRow.querySelector('.total-aconseguit').textContent = totalAconseguit.toFixed(2);
    totalsRow.querySelector('.total-progres').textContent = (totalProgres / rows.length).toFixed(2);
}


document.addEventListener('input', (event) => {
    if (event.target.classList.contains('ponderacio')) {
        let value = parseFloat(event.target.value);

        if (value < 0 || value > 100) {
            alert("El valor ha d'estar entre 0 i 100.");
            event.target.value = value < 0 ? 0 : 100;
        }
    }
});

function populateTable(criteris) {
    criteris.forEach(criteri => {
        const row = document.querySelector(`tr[data-id-criteri="${criteri.id_criteri}"]`);
        if (row) {
            const inputPonderacio = row.querySelector('.ponderacio');
            if (inputPonderacio) {
                inputPonderacio.value = criteri.ponderacio;
            }
        }
    });
    calculateTotals();
}


async function fetchEvidences() {
    try {
        const response = await fetch('/api/evidences');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Evidències disponibles:", data);
        return data;
    } catch (error) {
        console.error('Error carregant evidències:', error);
        return [];
    }
}

async function fetchCriteris(id_ra) {
    try {
        const response = await fetch(`/get_criteris/${id_ra}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        criteris = data.criteris || []; // Assigna el resultat a la variable global
        console.log("Criteris carregats:", criteris);
        return criteris;
    } catch (error) {
        console.error('Error carregant criteris:', error);
        return [];
    }
}


/* function updateEvidenceDropdown() {
    const select = document.getElementById('evidence-select');
    select.innerHTML = evidences
        .map(e => `<option value="${e.id}">${e.nom}</option>`)
        .join('');
}
 */
function createTable(evidences, savedData = [], criteris = [], raId) {
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = ''; // Reset de la taula

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Criteris</th>
                <th>Ponderació (%)</th>
                <th>Aconseguit</th>
                <th>Progrés</th>
                ${evidences.map(e => `
                    <th>${e.nom || "Sense nom"}
                        <button class="close-button" onclick="eliminarEvidenciaDeCapçalera('${e.id}', '${raId}')">&times;</button>
                    </th>
                `).join('')}
            </tr>
        </thead>
        <tbody>
            ${criteris.map(criteri => `
                <tr data-id-criteri="${criteri.id_criteri}" data-nia="${criteri.nia || ''}">
                    <td>${criteri.descripcio}</td>
                    <td><input type="number" class="ponderacio" value="${criteri.ponderacio || 0}" oninput="calculateTotals()"></td>
                    <td class="aconseguit">0.00</td>
                    <td class="progress">0.00</td>
                    ${evidences.map(evidence => {
                        const saved = savedData.find(d => d.id_criteri === criteri.id_criteri && d.id_evidencia === evidence.id);
                        const descriptors = evidence.descriptors || [];
                        const nia = criteri.nia || saved?.nia || '';
                        return `
                            <td data-id-evidencia="${evidence.id}">
                                ${descriptors.length > 0
                                    ? `
                                        <select onchange="updateNota(this)">
                                            <option value="">Selecciona descriptor</option>
                                            ${descriptors.map(desc => `
                                                <option value="${desc.valor}" data-nota="${desc.valor}" ${saved?.valor === desc.valor ? 'selected' : ''}>
                                                    ${desc.nom}
                                                </option>`).join('')}
                                        </select>
                                    `
                                    : `<span class="no-descriptor">Sense descripció</span>`}
                                <input type="number" value="${saved?.valor || ''}" min="0" max="10" oninput="manualUpdate(this)">
                                <button class="close-button" onclick="eliminarEvidencia('${evidence.id}', '${criteri.id_criteri}', '${nia}', '${raId}')">&times;</button>
                            </td>`;
                    }).join('')}
                </tr>`).join('')}
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALS</td>
                <td class="total-ponderacio">0</td>
                <td class="total-aconseguit">0.00</td>
                <td class="total-progres">0.00</td>
                ${evidences.map(() => '<td class="evidence-total">0.00</td>').join('')}
            </tr>
        </tfoot>
    `;

    tableWrapper.appendChild(table);
    calculateTotals();
}

function eliminarEvidenciaDeCapçalera(idEvidencia, raId) {
    console.log("Eliminant evidència de capçalera amb id:", idEvidencia);

    // Actualitzar dades locals
    evidencesAfegides = evidencesAfegides.filter(e => e.id !== idEvidencia);
    savedData = savedData.filter(d => d.id_evidencia !== idEvidencia);

    // Cridar l'API per persistir l'eliminació
    fetch('/update-detalls-ra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ra_id: raId,
            detalls: [{ id_evidencia: idEvidencia, valor: null, eliminar: true }] // Afegir el camp eliminar
        })
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert("Evidència eliminada correctament!");
                // Tornar a renderitzar la taula
                createTable(evidencesAfegides, savedData, criteris, raId);
            } else {
                throw new Error(result.error);
            }
        })
        .catch(error => {
            console.error("Error eliminant l'evidència de capçalera:", error);
            alert("Error eliminant l'evidència.");
        });
}


document.getElementById('add-evidence').addEventListener('click', () => {
    const select = document.getElementById('evidence-select');
    const evidenceId = parseInt(select.value, 10);
    const evidence = evidences.find(e => e.id === evidenceId);

    if (!evidence) {
        alert('Evidència no vàlida!');
        return;
    }

    if (evidencesAfegides.some(e => e.id === evidenceId)) {
        alert('Evidència ja afegida!');
        return;
    }

    evidencesAfegides.push(evidence);

    // Passa `criteris` com a paràmetre
    addEvidenceToAllCriteris(evidence, criteris);

    createTable(evidencesAfegides, savedData, criteris);
});


function addEvidenceToAllCriteris(evidence, criteris) {
    if (!criteris || criteris.length === 0) {
        console.warn("No hi ha criteris disponibles per associar la evidència.");
        return;
    }

    // Si `savedData` no és un array, inicialitzar-lo com a tal
    if (!Array.isArray(savedData)) {
        console.warn("savedData no és un array, inicialitzant-lo com a array.");
        savedData = [];
    }
    const niaDisponible = savedData.find(d => d.nia)?.nia || null; // Agafar un NIA existent

    // Per cada criteri, afegeix una entrada a `savedData` si no existeix
    criteris.forEach(criteri => {
        const existingRelation = savedData.find(
            d => d.id_criteri === criteri.id_criteri && d.id_evidencia === evidence.id
        );

        if (!existingRelation) {
            savedData.push({
                id_criteri: criteri.id_criteri,
                id_evidencia: evidence.id,
                nia: niaDisponible, // Pot ser definit segons el context
                valor: null // Sense valor inicial
            });
        }
    });

    console.log("Relacions actualitzades a savedData:", savedData);
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log('Pàgina carregada.');

    const raId = window.location.pathname.split('/').pop();
    console.log("raId obtingut:", raId);

    try {
        // 1. Carregar totes les evidències disponibles
        evidences = await fetchEvidences();
        updateEvidenceDropdown(); // Actualitzar el desplegable

        // 2. Carregar criteris i dades guardades
        criteris = await fetchCriteris(raId);
        const savedDataResponse = await fetch(`/api/ra/${raId}`);
        const savedDataRaw = await savedDataResponse.json();

        // Assegura que `savedData` és un array
        savedData = savedDataRaw.detalls || [];

        // 3. Filtrar només les evidències assignades segons les dades desades
        evidencesAfegides = evidences.filter(e =>
            savedData.some(d => d.id_evidencia === e.id)
        );

        // 4. Cridar createTable amb només les evidències assignades
        createTable(evidencesAfegides, savedData, criteris, raId);

        // 5. Afegir esdeveniments als botons d'eliminació
        const eliminarButtons = document.querySelectorAll('.eliminar-evidencia');
        eliminarButtons.forEach(button => {
            button.addEventListener('click', eliminarEvidencia);
        });
    } catch (error) {
        console.error('Error inicialitzant la pàgina:', error);
        alert('Error carregant dades!');
    }
});


async function eliminarEvidencia(event) {
    const button = event.target;
    const row = button.closest('tr[data-id-criteri]');
    // const idCriteri = row.dataset.idCriteri;
    //const nia = row.dataset.nia;
    const evidenciaCell = button.closest('td[data-id-evidencia]');
    const idEvidencia = evidenciaCell.dataset.idEvidencia;

    // Assegura't que raId està definit correctament
    //const raId = document.querySelector('input[name="ra_id"]').value;
    //const nia = document.querySelector('input[name="nia"]').value;

    if (!idEvidencia || !nia || !raId) {
        console.warn('Alguna dada no està definida:', { idEvidencia, nia, raId });
        return;
    }

    const detalls = [{
        
        id_evidencia: idEvidencia,
        nia: nia,
        valor: null,
        eliminar: true
    }];

    console.log("Dades a enviar per eliminar:", detalls);

    try {
        // Enviar dades al backend
        const response = await fetch('/update-detalls-ra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ra_id: raId, // Assegura que raId està definit correctament
                detalls: detalls,
            }),
        });

        const result = await response.json();
        console.log("Resposta del servidor:", result);

        if (!result.success) {
            throw new Error(result.error);
        }

        alert("Evidència eliminada correctament!");
        // Recarregar la taula
        window.location.reload();
    } catch (error) {
        console.error("Error eliminant evidència:", error);
        alert("Error eliminant evidència.");
    }
}

