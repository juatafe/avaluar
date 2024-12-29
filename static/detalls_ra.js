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

        if (ponderacio !== null) {
            ponderacions.push({ id_criteri: idCriteri, valor: ponderacio });
        }

        row.querySelectorAll('[data-id-evidencia]').forEach(evidenceElem => {
            const idEvidencia = evidenceElem.dataset.idEvidencia;
            const descriptorSelect = evidenceElem.querySelector('select');
            const valor = descriptorSelect ? descriptorSelect.value : null;

            detalls.push({
                id_criteri: idCriteri,
                id_evidencia: idEvidencia,
                nia: nia,
                valor: valor || null
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
}



function updateNota(select) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = selectedOption.dataset.nota || 0;
    const input = select.parentElement.querySelector('input');
    if (select.value === '') {
        input.value = ''; // Si no hi ha cap valor seleccionat
    } else {
        input.value = nota; // Assignar el valor corresponent
    }
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

function createTable(evidences, savedData = []) {
    console.log("Iniciant la creació de la taula...");
    console.log("Evidències rebudes:", evidences);
    console.log("Dades desades rebudes:", savedData);

    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = '';

    // Generar dinàmicament els criteris a partir de savedData
    const criterios = savedData.map(data => ({
        criteri: data.criteri_descripcio, // Usa el nom del criteri
        valor: data.ponderacio || 0, // Usa la ponderació del criteri o 0 per defecte
        aconseguit: data.aconseguit || 0, // Usa el valor aconseguit o 0
        progres: data.progres || 0, // Usa el progrés o 0
        id_criteri: data.id_criteri, // Identificador del criteri
        nia: data.nia // Identificador d'alumne
    }));

    console.log("Criteris definits dinàmicament:", criterios);

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
            ${criterios.map(row => {
        console.log("Processant criteri:", row);
        return `
                <tr data-id-criteri="${row.id_criteri}" data-nia="${row.nia}">
                    <td>${row.criteri}</td>
                    <td><input type="number" class="ponderacio" min="0" max="100" value="${row.valor}" oninput="calculateTotals()"></td>
                    <td class="aconseguit">${row.aconseguit.toFixed(2)}</td>
                    <td class="progress">${row.progres}</td>
                    ${evidences.map(evidence => {
            console.log("Processant evidència:", evidence);
            const savedValue = savedData.find(
                d => d.id_criteri == row.id_criteri && d.id_evidencia == evidence.id
            )?.valor || "";

            console.log(`Valor desat per a evidència ${evidence.id}:`, savedValue);

            const descriptors = evidence.descriptors || [];
            console.log(`Descriptors disponibles per a evidència ${evidence.id}:`, descriptors);

            return `
    <td data-id-evidencia="${evidence.id || 'undefined'}">
        ${descriptors.length > 0
                    ? `
            <select onchange="updateNota(this)">
                <option value="" ${!savedValue ? 'selected' : ''}>Seleccionar descriptor</option>
                ${descriptors.map(desc => {
                        const isSelected = parseFloat(savedValue) === parseFloat(desc.valor) ? 'selected' : '';
                        return `
                        <option value="${desc.valor}" data-nota="${desc.valor}" ${isSelected}>
                            ${desc.nom}
                        </option>
                    `;
                    }).join('')}
            </select>
            `
                    : `<span class="no-descriptor">Sense descripció</span>`
                }

        <input 
            type="number" 
            min="0" 
            max="10" 
            value="${savedValue || ''}" 
            placeholder="Nota" 
            oninput="manualUpdate(this)"
        >
    </td>
`;

        }).join('')}
                </tr>
            `;
    }).join('')}
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
        })
        .catch(error => {
            console.error('Error carregant dades:', error);
            alert('No s’han pogut carregar les dades.');
        });
});
