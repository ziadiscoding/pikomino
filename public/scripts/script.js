let gameData = {
    manchesJouees: 0,
    scores: {
        Pique: 0,
        Coeur: 0,
        Carreau: 0,
        Trefle: 0
    }
};

// Définir un objet pour stocker les tuiles récupérées par chaque joueur
let playerTiles = {
    Pique: new Set(),
    Coeur: new Set(),
    Carreau: new Set(),
    Trefle: new Set()
};

document.addEventListener('DOMContentLoaded', async function () {
    const response = await fetch('../public/data/data.json');
    const data = await response.json();
    initializePlayers(); // Initialisation des joueurs
    await displayRounds(data);
    displayAvailableTiles(data.tuilesDispo); // Affichage initial des tuiles disponibles
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculerPoints(desLances) {
    // Exemple de calcul basique : la somme des dés lancés
    return desLances.reduce((sum, val) => sum + val, 0);
}

async function displayRounds(data) {
    const roundsContainer = document.getElementById('rounds-container');

    for (let i = 0; i < data.historique.length; i++) {
        const round = data.historique[i];

        await sleep(1000); // Délai d'une seconde entre chaque manche (1000 ms = 1 seconde)

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
                const pointsObtenus = calculerPoints(action.desLances);
                updatePlayerScore(round.joueur, pointsObtenus); // Mettre à jour le score du joueur
                updatePlayerTiles(round.joueur, action.valConservee); // Mettre à jour les tuiles du joueur
                removeAvailableTile(action.valConservee); // Retirer la tuile disponible
            } else if (action.action === 'picore_tuile') {
                // Vérifier si la tuile est déjà récupérée par un autre joueur
                if (!isTuileDejaRecuperee(action.numero)) {
                    actionDiv.textContent = `Picore tuile: ${action.numero} de ${action.origine}`;
                    // Mettre à jour l'affichage uniquement pour le joueur actif qui picore la tuile
                    if (action.origine !== round.joueur) {
                        actionDiv.textContent += ` (par ${round.joueur})`;
                    }
                    picorerTuile(action.numero, action.origine); // Simuler la récupération de la tuile
                } else {
                    actionDiv.textContent = `Picore tuile: ${action.numero} de ${action.origine} (déjà récupérée)`;
                }
            } else if (action.action === 'rend_tuile') {
                actionDiv.textContent = `Rend tuile: ${action.TuileRetournee}`;
                returnAvailableTile(action.TuileRetournee); // Rendre la tuile disponible
                removePlayerTile(action.TuileRetournee); // Retirer la tuile du joueur
            }
            actionsContainer.appendChild(actionDiv);
        });

        roundDiv.appendChild(actionsContainer);
        roundsContainer.appendChild(roundDiv);

        gameData.manchesJouees++;

        console.log(`Scores après la manche ${gameData.manchesJouees}: Joueur Pique - ${gameData.scores.Pique}, Joueur Coeur - ${gameData.scores.Coeur}, Joueur Carreau - ${gameData.scores.Carreau}, Joueur Trefle - ${gameData.scores.Trefle}`);
    }

    if (estPartieTerminee()) {
        afficherGagnant();
    }
}

function initializePlayers() {
    const players = ['Pique', 'Coeur', 'Carreau', 'Trefle'];
    players.forEach(player => {
        const playerElement = document.getElementById(player);
        if (playerElement) {
            playerElement.textContent = `${player}: 0 points`;
        }
    });
}

function displayAvailableTiles(tuilesDispo) {
    const tuilesContainer = document.getElementById('tuiles-container');
    tuilesContainer.innerHTML = '';

    const tuilesDispoDiv = document.createElement('div');
    tuilesDispoDiv.classList.add('tuiles-dispo');

    Object.entries(tuilesDispo).forEach(([numero, tuile]) => {
        const tuileDiv = document.createElement('div');
        tuileDiv.classList.add('tuile');
        tuileDiv.setAttribute('data-tile-numero', numero); // Utilisation d'un attribut data pour identifier chaque tuile
        tuileDiv.textContent = `Tuile ${numero} (vers: ${tuile.vers}, active: ${tuile.active})`;
        tuileDiv.addEventListener('click', () => {
            // Simuler une action de picorer une tuile
            picorerTuile(numero, tuile.vers);
        });
        tuilesDispoDiv.appendChild(tuileDiv);
    });

    tuilesContainer.appendChild(tuilesDispoDiv);
}

function picorerTuile(numero, origine) {
    const action = {
        action: 'picore_tuile',
        numero: numero,
        origine: origine
    };
    const round = {
        manche: gameData.manchesJouees + 1,
        joueur: origine,
        actions: [action]
    };

    // Mettre à jour l'affichage
    const roundsContainer = document.getElementById('rounds-container');
    const roundDiv = document.createElement('div');
    roundDiv.classList.add('round');
    const roundHeader = document.createElement('h2');
    roundHeader.textContent = `Manche ${round.manche} - Joueur: ${round.joueur}`;
    roundDiv.appendChild(roundHeader);
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('actions');
    const actionDiv = document.createElement('div');
    actionDiv.classList.add('action');
    actionDiv.textContent = `Picore tuile: ${action.numero} de ${action.origine}`;
    actionsContainer.appendChild(actionDiv);
    roundDiv.appendChild(actionsContainer);
    roundsContainer.appendChild(roundDiv);

    // Mettre à jour gameData (simulation pour l'exemple)
    gameData.manchesJouees++;
    console.log(`Scores après la manche ${gameData.manchesJouees}: Joueur Pique - ${gameData.scores.Pique}, Joueur Coeur - ${gameData.scores.Coeur}, Joueur Carreau - ${gameData.scores.Carreau}, Joueur Trefle - ${gameData.scores.Trefle}`);

    // Mettre à jour les tuiles du joueur
    updatePlayerTiles(origine, numero);
}

function removeAvailableTile(numero) {
    const tuileDiv = document.querySelector(`.tuile[data-tile-numero="${numero}"]`);
    if (tuileDiv) {
        tuileDiv.remove();
    }
}

function returnAvailableTile(numero) {
    const tuilesContainer = document.getElementById('tuiles-container');
    const tuileDiv = document.createElement('div');
    tuileDiv.classList.add('tuile');
    tuileDiv.setAttribute('data-tile-numero', numero);
    tuileDiv.textContent = `Tuile ${numero}`;
    tuileDiv.addEventListener('click', () => {
        // Logique pour picorer cette tuile
    });
    tuilesContainer.appendChild(tuileDiv);
}

function updatePlayerScore(joueur, points) {
    const playerScoreElement = document.getElementById(`${joueur}`);
    if (playerScoreElement) {
        const currentPoints = parseInt(playerScoreElement.textContent.split(':')[1].trim(), 10) || 0;
        const newPoints = currentPoints + points;
        playerScoreElement.textContent = `${joueur}: ${newPoints} points`;
        gameData.scores[joueur] = newPoints;
    } else {
        console.error(`Element with id "${joueur}" not found.`);
    }
}

// Fonction pour mettre à jour les tuiles du joueur
function updatePlayerTiles(joueur, tuileNumero) {
    const playerTilesContainer = document.getElementById(`${joueur}-tiles`);
    if (playerTilesContainer) {
        // Vérifier si le joueur n'a pas déjà cette tuile
        if (!playerTiles[joueur].has(tuileNumero)) {
            const tuileDiv = document.createElement('div');
            tuileDiv.classList.add('tuile');
            tuileDiv.textContent = `Tuile ${tuileNumero}`;
            playerTilesContainer.appendChild(tuileDiv);
            // Stocker la tuile récupérée par le joueur dans playerTiles (utilisation de Set)
            playerTiles[joueur].add(tuileNumero);
        } else {
            console.log(`La tuile ${tuileNumero} est déjà chez le joueur ${joueur}.`);
        }
    } else {
        console.error(`Element with id "${joueur}-tiles" not found.`);
    }
}

// Fonction pour vérifier si une tuile est déjà récupérée par un joueur
function isTuileDejaRecuperee(tuileNumero) {
    // Vérifier si la tuile est déjà dans le Set playerTiles pour au moins un joueur
    for (const joueur in playerTiles) {
        if (playerTiles[joueur].has(tuileNumero)) {
            return true;
        }
    }
    return false;
}

// Fonction pour retirer une tuile d'un joueur
function removePlayerTile(tuileNumero) {
    // Retirer la tuile du Set playerTiles pour tous les joueurs
    for (const joueur in playerTiles) {
        if (playerTiles[joueur].has(tuileNumero)) {
            playerTiles[joueur].delete(tuileNumero);
        }
    }
}

