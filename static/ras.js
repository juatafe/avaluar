async function guardarPonderacions() {
    // Selecciona tots els inputs de ponderació
    const inputs = document.querySelectorAll('.ponderacio-input');
    const ras = Array.from(inputs).map(input => ({
        id_ra: input.dataset.id, // ID del RA
        ponderacio: parseFloat(input.value), // Assegura que és un número
    }));


    try {
        // Envia les dades al backend
        const response = await fetch('/update-ras', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Especifica JSON
            },
            body: JSON.stringify({ ras }), // Converteix l'objecte a JSON
        });

        // Processa la resposta del servidor
        const result = await response.json();

        if (!result.success) throw new Error(result.error); // Si hi ha error, llança excepció

        // Mostra un missatge d'èxit
        alert('Ponderacions desades correctament!');
        location.reload(); // Recàrrega la pàgina per actualitzar dades
    } catch (error) {
        // Captura i mostra els errors
        console.error('Error desant les ponderacions:', error);
        alert('Error desant les ponderacions. Revisa la consola per més detalls.');
    }
}

document.addEventListener('input', (event) => {
    if (event.target.classList.contains('ponderacio-input')) {
        let value = parseFloat(event.target.value);

        if (value < 0 || value > 100) {
            alert("El valor ha d'estar entre 0 i 100.");
            event.target.value = value < 0 ? 0 : 100;
        }
    }
});

function redirigirAmbNIA(nia) {
    if (nia) {
        window.location.href = `/visualitzar?nia=${nia}`;
    } else {
        alert("El NIA no està disponible.");
    }
}





// Afegir l'event listener quan el document està llest
document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.querySelector('.save-button');
    saveButton.addEventListener('click', guardarPonderacions);
});
