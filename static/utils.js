async function guardarDades(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        alert('Dades desades correctament!');
        location.reload(); // Recàrrega la pàgina si cal
    } catch (error) {
        console.error('Error desant les dades:', error);
        alert('Error desant les dades.');
    }
}

function toggleSpinner(show) {
    const spinner = document.querySelector('.spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
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
