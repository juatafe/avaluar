async function fetchEvidences() {
    try {
        const response = await fetch('/api/evidences');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data; // Estructura: { 1: { nom: "Evidència 1", descriptors: [{ nom: "Descriptor 1", nota: 4 }, ...] }, ... }
    } catch (error) {
        console.error('Error fetching evidences:', error);
        return {};
    }
}

function createTable(evidences) {
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.innerHTML = ''; // Limpiar contenido previo

    // Criterios de evaluación
    const criterios = [
        { criteri: 'CE A', valor: 20, aconseguit: '15%', progres: '75%' },
        { criteri: 'CE B', valor: 10, aconseguit: '5%', progres: '50%' },
        { criteri: 'CE C', valor: 20, aconseguit: '13%', progres: '63%' },
        { criteri: 'CE D', valor: 50, aconseguit: '50%', progres: '100%' }
    ];

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Criteris</th>
                <th>Ponderació</th>
                <th>Aconseguit</th>
                <th>Progrés</th>
                ${Object.values(evidences).map(evidence => `<th>${evidence.nom}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${criterios.map(row => `
                <tr>
                    <td>${row.criteri}</td>
                    <td class="ponderacio">${row.valor}</td>
                    <td class="aconseguit">${row.aconseguit}</td>
                    <td class="progress">${row.progres}</td>
                    ${Object.values(evidences).map(evidence => `
                        <td>
                            <select onchange="updateNota(this)">
                                <option value="">Seleccionar descriptor</option>
                                ${evidence.descriptors.map(desc => `
                                    <option value="${desc.id}" data-nota="${desc.nota}">${desc.nom}</option>
                                `).join('')}
                            </select>
                            <input type="number" value="" placeholder="Nota" oninput="manualUpdate(this)">
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALS</td>
                <td class="total-ponderacio">0</td>
                <td class="total-aconseguit">0</td>
                <td class="total-progres">0</td>
                ${Object.values(evidences).map(() => `<td><span class="evidence-total">0</span></td>`).join('')}
            </tr>
        </tfoot>
    `;

    tableWrapper.appendChild(table);
    calculateTotals();
}

function updateNota(select) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = selectedOption.dataset.nota || "";
    const input = select.parentElement.querySelector('input');
    input.value = nota;
    calculateTotals(); // Recalcular los totales cuando se actualiza una nota
}

function manualUpdate(input) {
    input.value = parseFloat(input.value) || "";
    calculateTotals(); // Recalcular los totales cuando se actualiza manualmente una nota
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
            const input = row.querySelectorAll('td input')[colIndex];
            const value = input ? parseFloat(input.value) : NaN;
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        });
        const average = count > 0 ? (sum / count).toFixed(2) : 0;
        totalCell.textContent = average;
    });

    // Actualitzar la columna de "Progrés" per cada criteri
    rows.forEach(row => {
        const inputs = row.querySelectorAll('td input');
        let sum = 0;
        let count = 0;

        inputs.forEach(input => {
            const select = input.previousElementSibling;
            const value = parseFloat(input.value);
            if (select && select.value && !isNaN(value)) {
                sum += value;
                count++;
            }
        });

        const progressCell = row.querySelector('.progress');
        const progressValue = count > 0 ? (sum / count).toFixed(2) : 0; // Mitjana de les notes
        progressCell.textContent = progressValue; // Actualitzar la cel·la de Progrés
    });

    // Calcular els totals globals de Ponderació, Aconseguit i Progrés
    const totalPonderacio = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.ponderacio').textContent) || 0), 0);
    const totalAconseguit = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.aconseguit').textContent) || 0), 0);
    const totalProgres = Array.from(rows).reduce((acc, row) => acc + (parseFloat(row.querySelector('.progress').textContent) || 0), 0);

    totalsRow.querySelector('.total-ponderacio').textContent = totalPonderacio.toFixed(2);
    totalsRow.querySelector('.total-aconseguit').textContent = totalAconseguit.toFixed(2);
    totalsRow.querySelector('.total-progres').textContent = totalProgres.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEvidences().then(evidences => {
        createTable(evidences);
    }).catch(error => console.error('Error initializing table:', error));
});
