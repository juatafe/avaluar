let evidences = [];

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
        const ponderacioInput = row.querySelector('.ponderacio');
        const ponderacio = ponderacioInput ? parseFloat(ponderacioInput.value) || 0 : null;

        // Guardar ponderacions
        if (ponderacio !== null) {
            ponderacions.push({ id_criteri: idCriteri, valor: ponderacio });
        }

        // Processar evidències per fila
        row.querySelectorAll('[data-id-evidencia]').forEach(evidenceElem => {
            const idEvidencia = evidenceElem.dataset.idEvidencia;
            const descriptorSelect = evidenceElem.querySelector('select');
            const valorInput = evidenceElem.querySelector('input');

            let valor = null;
            if (descriptorSelect && descriptorSelect.value) {
                valor = descriptorSelect.value; // Prioritzar el valor del select
            } else if (valorInput && valorInput.value) {
                valor = parseFloat(valorInput.value); // Si no hi ha valor al select, usar l'input
            }

            // Afegir al detall, encara que el valor sigui nul
            detalls.push({
                id_criteri: idCriteri,
                id_evidencia: idEvidencia,
                nia: nia,
                valor: valor || null // Assegurar que nul es tracta correctament
            });
        });
    });

    console.log("Dades a enviar (detalls):", detalls);
    console.log("Dades a enviar (ponderacions):", ponderacions);

    try {
        const response = await fetch('/update-detalls-ra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detalls, ponderacions }),
        });
        console.log('Dades a enviar guardarDetalls():', JSON.stringify(detalls)); // on 'data' és l'objecte enviat al backend


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
    calculateTotals();
}

function updateNota(select) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = selectedOption.dataset.nota || 0; // Obté el valor de la nota
    const input = select.parentElement.querySelector('input');
    
    if (select.value === '') {
        input.value = ''; // Si no hi ha cap valor seleccionat
    } else {
        input.value = nota; // Assigna el valor corresponent al camp d'entrada
    }

    // Marca el valor per enviar-lo al backend
    const row = select.closest('tr');
    const idCriteri = row.dataset.idCriteri;
    const idEvidencia = select.closest('td').dataset.idEvidencia;
    const nia = row.dataset.nia;

    console.log(`Actualitzant nota: Criteri=${idCriteri}, Evidència=${idEvidencia}, NIA=${nia}, Valor=${nota}`);
    //guardarDetalls(); // Desem automàticament després d'una actualització
    calculateTotals(); // Actualitzar els totals
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
            const cell = cells[colIndex + 4]; // Ajust per saltar les primeres 4 columnes (Criteri, Ponderació, etc.)

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

    // Actualitzar la columna de "Progrés" i "Aconseguit" per cada criteri
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

    // Calcular els totals globals de Ponderació, Aconseguit i Progrés
    const totalPonderacio = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.ponderacio').value) || 0), 0);
    const totalAconseguit = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.aconseguit').textContent) || 0), 0);

    const totalProgres = Array.from(rows).reduce(
        (acc, row) => {
            const progressCell = row.querySelector('.progress');
            const progressValue = progressCell ? parseFloat(progressCell.textContent) || 0 : 0;

            const hasValidEvidence = Array.from(row.querySelectorAll('td')).some(cell => {
                const input = cell.querySelector('input');
                const select = cell.querySelector('select');
                const value = input ? parseFloat(input.value) || 0 : 0;
                return select && select.value && value > 0;
            });

            if (hasValidEvidence) {
                acc.sum += progressValue;
                acc.count++;
            }
            return acc;
        },
        { sum: 0, count: 0 }
    );

    const totalProgresAverage = totalProgres.count > 0
        ? (totalProgres.sum / totalProgres.count).toFixed(2)
        : 0;

    totalsRow.querySelector('.total-ponderacio').textContent = totalPonderacio.toFixed(2);
    totalsRow.querySelector('.total-aconseguit').textContent = totalAconseguit.toFixed(2);
    totalsRow.querySelector('.total-progres').textContent = totalProgresAverage;
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

function createTable(evidences, savedData = [], criteris = []) {
    console.log("Iniciant la creació de la taula...");
    console.log("Evidències rebudes:", evidences);
    console.log("Dades desades rebudes:", savedData);
    console.log("Criteris rebuts:", criteris);

    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = '';

    const uniqueCriterios = {}; // Inicialitzar l'objecte

    // Processar dades guardades
    savedData.forEach(data => {
        if (!uniqueCriterios[data.id_criteri]) {
            uniqueCriterios[data.id_criteri] = {
                criteri: data.criteri_descripcio, // Descripció del criteri
                valor: data.ponderacio || 0, // Ponderació del criteri
                id_criteri: data.id_criteri,
                nia: data.nia // ID del criteri
            };
        }
    });
    
    // Actualitzar ponderació i descripció si cal
    criteris.forEach(data => {
        if (uniqueCriterios[data.id_criteri]) {
            uniqueCriterios[data.id_criteri].criteri = data.descripcio || uniqueCriterios[data.id_criteri].criteri;
            uniqueCriterios[data.id_criteri].valor = data.ponderacio || uniqueCriterios[data.id_criteri].valor;
        }
    });
    
    // Convertir objecte a array si es requereix per ús posterior
    const uniqueCriteriosArray = Object.values(uniqueCriterios);
    console.log("Criteris processats amb ponderació i descripció:", uniqueCriteriosArray);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Criteris</th>
                <th>Ponderació (%)</th>
                <th>Aconseguit</th>
                <th>Progrés</th>
                ${evidences.map(evidence => `<th>${evidence.nom || "Sense nom"}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${uniqueCriteriosArray.map(row => `
                <tr data-id-criteri="${row.id_criteri}" data-nia="${row.nia}">
                    <td>${row.criteri}</td>
                    <td><input type="number" class="ponderacio" min="0" max="100" value="${row.valor}" oninput="calculateTotals()"></td>
                    <td class="aconseguit">${row.aconseguit ? row.aconseguit.toFixed(2) : '0.00'}</td>
                    <td class="progress">${row.progres ? row.progres.toFixed(2) : '0.00'}</td>
                    ${evidences.map(evidence => {
                        const savedValue = savedData.find(
                            d => d.id_criteri === row.id_criteri && d.id_evidencia === evidence.id
                        )?.valor || "";

                        const descriptors = evidence.descriptors || [];
                        return `
                            <td data-id-evidencia="${evidence.id}">
                                ${descriptors.length > 0
                                    ? `
                                        <select onchange="updateNota(this)">
                                            <option value="" ${!savedValue ? 'selected' : ''}>Seleccionar descriptor</option>
                                            ${descriptors.map(desc => `
                                                <option value="${desc.valor}" data-nota="${desc.valor}" ${parseFloat(savedValue) === parseFloat(desc.valor) ? 'selected' : ''}>
                                                    ${desc.nom}
                                                </option>
                                            `).join('')}
                                        </select>
                                    `
                                    : `<span class="no-descriptor">Sense descripció</span>`
                                }
                                <input type="number" min="0" max="10" value="${savedValue || ''}" placeholder="Nota" oninput="manualUpdate(this)">
                            </td>
                        `;
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALS</td>
                <td class="total-ponderacio">0</td>
                <td class="total-aconseguit">0.00</td>
                <td class="total-progres">0.00</td>
                ${evidences.map(() => `<td><span class="evidence-total">0.00</span></td>`).join('')}
            </tr>
        </tfoot>
    `;

    console.log("HTML de la taula generat:", table.innerHTML);

    tableWrapper.appendChild(table);

    console.log("Taula afegida al DOM, recalculant totals...");
    calculateTotals();
    console.log("Finalitzada la creació de la taula.");
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pàgina carregada.');

    const id_ra = window.location.pathname.split('/').pop();
    console.log(`ID RA carregat: ${id_ra}`);

    Promise.all([
        fetchEvidences(),
        fetch(`/api/ra/${id_ra}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.status}`);
                }
                return response.json();
            })
    ])
        .then(([loadedEvidences, savedData]) => {
            evidences = loadedEvidences; // Desa les evidències globalment
            console.log('Evidències carregades:', evidences);
            console.log('Dades desades carregades:', savedData);

            createTable(evidences, savedData.detalls || []);
            return fetchCriteris(id_ra);
        })
        .then(criteris => {
            console.log("Criteris recuperats del backend:", criteris);
            populateTable(criteris);
        })
        .catch(error => {
            console.error('Error carregant dades:', error);
            alert('No s’han pogut carregar les dades.');
        });


    
});
