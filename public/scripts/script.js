// script.js
document.addEventListener('DOMContentLoaded', function() {
    fetch('../public/data/data.json')
        .then(response => response.json())
        .then(data => renderGame(data));
});

function renderGame(data) {
    const roundsContainer = document.getElementById('rounds-container');
    data.historique.forEach(round => {
        const roundDiv = document.createElement('div');
        roundDiv.classList.add('round');

        const roundHeader = document.createElement('h2');
        roundHeader.textContent = `Manche ${round.manche} - Joueur: ${round.joueur}`;
        roundDiv.appendChild(roundHeader);

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('actions');

        round.actions.forEach(action => {
            const actionDiv = document.createElement('div');
            actionDiv.classList.add('action');
            if (action.action === 'conserve_de') {
                actionDiv.textContent = `Conserve le dé: ${action.valConservee} (Lancé: ${action.desLances.join(', ')}, Conservé: ${action.desConserves.join(', ')})`;
            } else if (action.action === 'picore_tuile') {
                actionDiv.textContent = `Picore tuile: ${action.numero} de ${action.origine}`;
            } else if (action.action === 'rend_tuile') {
                actionDiv.textContent = `Rend tuile: ${action.TuileRetournee}`;
            }
            actionsContainer.appendChild(actionDiv);
        });

        roundDiv.appendChild(actionsContainer);

        const tuilesContainer = document.createElement('div');
        tuilesContainer.classList.add('tuiles');

        for (const [numero, tuile] of Object.entries(round.tuilesDispo)) {
            const tuileDiv = document.createElement('div');
            tuileDiv.classList.add('tuile');
            tuileDiv.textContent = `Tuile ${numero} (vers: ${tuile.vers}, active: ${tuile.active})`;
            tuilesContainer.appendChild(tuileDiv);
        }

        roundDiv.appendChild(tuilesContainer);
        roundsContainer.appendChild(roundDiv);
    });
}
