// script.js

async function fetchEvidences() {
    try {
        const response = await fetch('/api/evidences');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching evidences:', error);
        return {};
    }
}

function createTable(evidences) {
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = '';

    const criterios = [
        { criteri: 'CE A', valor: 20, aconseguit: 0, progres: 0 },
        { criteri: 'CE B', valor: 10, aconseguit: 0, progres: 0 },
        { criteri: 'CE C', valor: 20, aconseguit: 0, progres: 0 },
        { criteri: 'CE D', valor: 50, aconseguit: 0, progres: 0 }
    ];

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Criteris</th>
                <th>Ponderació (%)</th>
                <th>Aconseguit</th>
                <th>Progrés</th>
                ${Object.values(evidences).map(evidence => `<th>${evidence.nom}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${criterios.map(row => `
                <tr>
                    <td>${row.criteri}</td>
                    <td><input type="number" class="ponderacio" value="${row.valor}" oninput="calculateTotals()"></td>
                    <td class="aconseguit">${row.aconseguit.toFixed(2)}</td>
                    <td class="progress">${row.progres}</td>
                    ${Object.values(evidences).map(evidence => `
                        <td>
                            ${evidence.descriptors.length > 0 ? `
                                <select onchange="updateNota(this)">
                                    <option value="">Seleccionar descriptor</option>
                                    ${evidence.descriptors.map(desc => `
                                        <option value="${desc.nom}" data-nota="${desc.valor || 0}">${desc.nom}</option>
                                    `).join('')}
                                </select>
                            ` : `<span class="no-descriptor">Sense descripció</span>`}
                            <input type="number" min="0" max="10" value="" placeholder="Nota" oninput="manualUpdate(this)">
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALS</td>
                <td class="total-ponderacio">0</td>
                <td class="total-aconseguit">0.00</td>
                <td class="total-progres">0.00</td>
                ${Object.values(evidences).map(() => `<td><span class="evidence-total">0.00</span></td>`).join('')}
            </tr>
        </tfoot>
    `;

    tableWrapper.appendChild(table);
    calculateTotals();
}

function updateNota(select) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = selectedOption.dataset.nota || 0;
    const input = select.parentElement.querySelector('input');
    if (select.value === '') {
        input.value = '';
    } else {
        input.value = nota;
    }
    calculateTotals();
}

function manualUpdate(input) {
    const value = parseFloat(input.value);
    input.value = isNaN(value) || value < 0 || value > 10 ? '' : value.toFixed(2);
    calculateTotals();
}

function calculateTotals() {
    const table = document.querySelector('.table-wrapper table');
    const rows = table.querySelectorAll('tbody tr');
    const totalsRow = table.querySelector('tfoot tr');

    // Calcular els totals per cada columna d'evidències
    const totals = Array.from(totalsRow.querySelectorAll('.evidence-total'));
    totals.forEach((totalCell, colIndex) => {
        let sum = 0;
        let count = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td'); // Obtenir cel·les
            const cell = cells[colIndex + 4]; // Ajust per saltar les primeres 4 columnes (Criteri, Ponderació, etc.)

            if (cell) {
                const input = cell.querySelector('input');
                const select = cell.querySelector('select');
                const value = input ? parseFloat(input.value) || 0 : 0;

                // Només incloure si s'ha seleccionat un descriptor
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

    // Calcular la mitjana global de Progrés
    const totalProgres = Array.from(rows).reduce(
        (acc, row) => {
            const progressCell = row.querySelector('.progress');
            const progressValue = progressCell ? parseFloat(progressCell.textContent) || 0 : 0;

            // Comprovar si la fila té evidències vàlides
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
        { sum: 0, count: 0 } // Inicialitzar la suma i el comptador
    );

    const totalProgresAverage = totalProgres.count > 0
        ? (totalProgres.sum / totalProgres.count).toFixed(2)
        : 0;


    totalsRow.querySelector('.total-ponderacio').textContent = totalPonderacio.toFixed(2);
    totalsRow.querySelector('.total-aconseguit').textContent = totalAconseguit.toFixed(2);
    totalsRow.querySelector('.total-progres').textContent = totalProgresAverage;
}





document.addEventListener('DOMContentLoaded', () => {
    fetchEvidences()
        .then(evidences => createTable(evidences))
        .catch(error => console.error('Error initializing table:', error));
});
