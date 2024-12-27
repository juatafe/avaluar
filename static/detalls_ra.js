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
    const idCriteri = row.dataset.idCriteri;
    const nia = row.dataset.nia;

    if (!idCriteri || !nia) {
        console.warn('Fila sense dades bàsiques:', { idCriteri, nia });
        return [];
    }

    return Array.from(row.querySelectorAll('td[data-id-evidencia]')).map(cell => {
        const idEvidencia = cell.dataset.idEvidencia || null;
        const valorInput = cell.querySelector('input');
        const valor = valorInput ? parseFloat(valorInput.value) || 0 : 0;

        if (idEvidencia) {
            return { id_criteri: idCriteri, id_evidencia: idEvidencia, nia, valor };
        } else {
            console.warn('Cèl·lula sense idEvidencia:', cell);
            return null;
        }
    }).filter(Boolean);
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

/* async function guardarDetalls() {
    const rows = document.querySelectorAll('.table-wrapper table tbody tr');
    const detalls = Array.from(rows).flatMap(processRow);

    if (detalls.length === 0) {
        alert('No hi ha dades vàlides per desar.');
        return;
    }

    try {
        const response = await fetch('/update-detalls-ra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detalls }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        alert('Dades desades correctament!');
    } catch (error) {
        console.error('Error desant els detalls:', error);
        alert('Error desant els detalls.');
    }
} */

async function guardarDetalls() {
    const rows = document.querySelectorAll('.table-wrapper table tbody tr');
    const detalls = Array.from(rows).flatMap(processRow);

    if (detalls.length === 0) {
        alert('No hi ha dades vàlides per desar.');
        return;
    }

    console.log('Dades a enviar al servidor:', detalls); // Afegir per depuració

    try {
        const response = await fetch('/update-detalls-ra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detalls }), // Converteix a JSON
        });

        console.log('Resposta del servidor:', response);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resultat del servidor:', result);

        if (!result.success) throw new Error(result.error);
        alert('Dades desades correctament!');
    } catch (error) {
        console.error('Error desant els detalls:', error);
        alert('Error desant els detalls.');
    }
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



function createTable(evidences, savedData = []) {
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = '';

    const criterios = [
        { criteri: 'Criteri 1', valor: 20, aconseguit: 0, progres: 0, id_criteri: 1, nia: 123456 }
    ];

    const table = document.createElement('table');
    table.innerHTML = `
            <thead>
                <tr>
                    <th>Criteris</th>
                    <th>Ponderació (%)</th>
                    <th>Aconseguit</th>
                    <th>Progrés</th>
                    ${evidences.map(evidence => `<th>${evidence.nom}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${criterios.map(row => `
                    <tr data-id-criteri="${row.id_criteri}" data-nia="${row.nia}">
                        <td>${row.criteri}</td>
                        <td><input type="number" class="ponderacio" value="${row.valor}" oninput="calculateTotals()"></td>
                        <td class="aconseguit">${row.aconseguit.toFixed(2)}</td>
                        <td class="progress">${row.progres}</td>
                        ${evidences.map(evidence => {
        const savedValue = savedData.find(
            d => d.id_criteri == row.id_criteri && d.id_evidencia == evidence.id
        )?.valor || 0;

        return `
                                <td data-id-evidencia="${evidence.id}">
                                    ${evidence.descriptors && evidence.descriptors.length > 0 ? `
    <select onchange="updateNota(this)">
        <option value="" ${!savedValue ? 'selected' : ''}>Seleccionar descriptor</option>
        ${evidence.descriptors.map(desc => `
            <option value="${desc.nom}" data-nota="${desc.valor}" ${savedValue && desc.valor == savedValue ? 'selected' : ''}>
                ${desc.nom}
            </option>
        `).join('')}
    </select>
` : `<span class="no-descriptor">Sense descripció</span>`}

                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="10" 
                                        value="${savedValue}" 
                                        placeholder="Nota" 
                                        oninput="manualUpdate(this)"
                                    >
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

    tableWrapper.appendChild(table);

    // Recalcular els totals després de generar la taula
    calculateTotals();
}



// Funció per inicialitzar la pàgina
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
        .then(([evidences, savedData]) => {
            console.log('Evidències carregades:', evidences);
            console.log('Dades desades carregades:', savedData);

            createTable(evidences, savedData.detalls || []);
        })
        .catch(error => {
            console.error('Error carregant dades:', error);
            alert('No s’han pogut carregar les dades.');
        });
});
