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
                <th>Items</th>
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
                    <td>${row.valor}</td>
                    <td>${row.aconseguit}</td>
                    <td>${row.progres}</td>
                    ${Object.values(evidences).map(evidence => `
                        <td>
                            <select onchange="updateNote(this, ${evidence.id})">
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
                <td colspan="4">TOTALS</td>
                ${Object.values(evidences).map(() => `<td><span class="evidence-total">0</span></td>`).join('')}
            </tr>
        </tfoot>
    `;

    tableWrapper.appendChild(table);
    calculateTotals();
}

function updateNote(select, evidenceId) {
    const selectedOption = select.options[select.selectedIndex];
    const nota = selectedOption.dataset.nota || "";
    const input = select.parentElement.querySelector('input');
    input.value = nota;
}

function manualUpdate(input) {
    input.value = parseFloat(input.value) || "";
}

function calculateTotals() {
    const table = document.querySelector('.table-wrapper table');
    const rows = table.querySelectorAll('tbody tr');
    const totalsRow = table.querySelector('tfoot tr');

    const totals = Array.from(totalsRow.querySelectorAll('.evidence-total'));

    totals.forEach((totalCell, colIndex) => {
        let sum = 0;
        rows.forEach(row => {
            const input = row.querySelectorAll('td input')[colIndex];
            const value = input ? parseFloat(input.value) || 0 : 0;
            sum += value;
        });
        totalCell.textContent = sum.toFixed(2);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEvidences().then(evidences => {
        createTable(evidences);
    }).catch(error => console.error('Error initializing table:', error));
});
