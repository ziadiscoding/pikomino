// Sélectionnez le conteneur des tuiles
const tilesContainer = document.querySelector('.tiles-container');

// Générer les tuiles numérotées de 21 à 36 avec des classes correspondantes
for (let i = 21; i <= 36; i++) {
    // Créer un élément div pour chaque tuile
    const tile = document.createElement('div');
    tile.classList.add('tile', `tile-${i}`); // Ajouter une classe dynamique tile-21, tile-22, ..., tile-36
    tile.textContent = i; // Assigner le numéro à la tuile

    // Ajouter la tuile au conteneur des tuiles
    tilesContainer.appendChild(tile);
}

// Fonction pour animer une tuile vers un joueur spécifique
const animateTileToPlayer = (tileNumber, player) => {
    return new Promise((resolve) => {
        // Sélectionner la tuile spécifiée
        const tile = document.querySelector(`.tile-${tileNumber}`);

        if (tile) {
            // Définir les coordonnées pour chaque joueur
            let top, left;

            switch (player) {
                case 1: // Pique
                    top = '10%';
                    left = '10%';
                    break;
                case 2: // Coeur
                    top = '10%';
                    left = '80%';
                    break;
                case 3: // Carreaux
                    top = '80%';
                    left = '10%';
                    break;
                case 4: // Treffle
                    top = '80%';
                    left = '80%';
                    break;
                default:
                    resolve(); // Si le joueur est invalide, résoudre immédiatement
                    return;
            }

            // Appliquer les transformations CSS pour animer la tuile vers le joueur spécifié
            tile.style.position = 'absolute';
            tile.style.transition = 'transform 1s ease';
            tile.style.top = top;
            tile.style.left = left;

            // Résoudre la promesse après 1 seconde (durée de l'animation)
            setTimeout(() => {
                resolve();
            }, 7000);
        } else {
            resolve(); // Résoudre immédiatement si la tuile n'est pas trouvée
        }
    });
}

// Fonction pour traiter une action spécifique
const handleAction = async (action, tuilesDispo, tuilesDuCentre, joueur) => {
    switch (action.action) {
        case 'conserve_de':
            // Récupérer les dés conservés et mettre à jour l'état des tuiles
            action.desConserves.forEach(numero => {
                if (tuilesDispo[numero]) {
                    tuilesDispo[numero].active = false;
                }
            });
            break;
        case 'picore_tuile':
            const tileNumero = action.numero;
            const playerNumber = joueurToPlayerNumber(joueur); // Convertir le nom du joueur en numéro de joueur

            // Animer la tuile vers le joueur spécifié
            await animateTileToPlayer(tileNumero, playerNumber);

            // Mettre à jour l'état de la tuile picorée
            if (tuilesDuCentre[tileNumero]) {
                tuilesDuCentre[tileNumero].active = false;
            }
            break;
        default:
            break;
    }
}

// Fonction pour convertir le nom du joueur en numéro de joueur
const joueurToPlayerNumber = (nomJoueur) => {
    switch (nomJoueur.toLowerCase()) {
        case 'pique':
            return 1;
        case 'coeur':
            return 2;
        case 'carreau':
            return 3;
        case 'trefle':
            return 4;
        default:
            return 0; // Retourne 0 pour les cas non reconnus
    }
}

// Charger le JSON et traiter les manches
const fetchDataAndProcessManches = async () => {
    try {
        const response = await fetch('data.json'); // Adapter l'URL en fonction de votre structure de projet
        const data = await response.json();

        // Vérifier si le JSON contient un tableau "historique"
        if (!Array.isArray(data.historique)) {
            throw new Error('Le JSON ne contient pas de tableau "historique".');
        }

        // Parcourir chaque manche
        for (const manche of data.historique) {
            const { actions, tuilesDispo, tuilesDuCentre, joueur } = manche;

            // Vérifier si "actions" est un tableau
            if (!Array.isArray(actions)) {
                throw new Error('Les actions de la manche ne sont pas définies correctement.');
            }

            // Parcourir toutes les actions de la manche
            for (const action of actions) {
                await handleAction(action, tuilesDispo, tuilesDuCentre, joueur);
            }
        }

    } catch (error) {
        console.error('Erreur lors du chargement ou du traitement du fichier JSON :', error);
    }
}


