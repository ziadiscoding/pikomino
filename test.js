const diceContainer = document.querySelector('.dice-container');
const rollBtn = document.querySelector('.roll');
let actions = [];
let currentActionIndex = 0;
let currentMancheIndex = 0;
let historique = [];


const resetDice = () => {
    for (let i = 0; i < diceContainer.children.length; i++) {
        const die = diceContainer.children[i];
        die.style.transform = 'rotateX(0deg) rotateY(0deg)';
        die.classList.remove('toBeConserved', 'toTheRight');
        die.style.animation = 'none';
    }
}


const rollDiceForAction = (action) => {
    if (!action) {
        console.error('Action is undefined or null');
        return;
    }

    const desLances = action.desLances;
    const valConservee = action.valConservee;

    
    for (let i = 0; i < diceContainer.children.length; i++) {
        const die = diceContainer.children[i];
        if (!die.classList.contains('toTheRight')) {
            die.classList.remove('toBeConserved');
        }
    }

    
    desLances.sort((a, b) => b - a);

    let diceRolledIndex = 0;
    for (let i = 0; i < diceContainer.children.length; i++) {
        const die = diceContainer.children[i];

        if (!die.classList.contains('toTheRight')) {
            const dieValue = desLances[diceRolledIndex];
            console.log(`Rolling die ${i + 1} to value ${dieValue}`);
            diceRolledIndex++;
            die.style.animation = 'rolling 4s';

            switch (dieValue) {
                case 1:
                    die.style.transform = 'rotateX(0deg) rotateY(0deg)';
                    break;
                case 2:
                    die.style.transform = 'rotateX(-90deg) rotateY(0deg)';
                    break;
                case 3:
                    die.style.transform = 'rotateX(0deg) rotateY(90deg)';
                    break;
                case 4:
                    die.style.transform = 'rotateX(0deg) rotateY(-90deg)';
                    break;
                case 5:
                    die.style.transform = 'rotateX(90deg) rotateY(0deg)';
                    break;
                case 6:
                    die.style.transform = 'rotateX(180deg) rotateY(0deg)';
                    break;
                default:
                    break;
            }

            if (dieValue === valConservee) {
                die.classList.add('toBeConserved');
            }
        }
    }

    setTimeout(() => {
        for (let i = 0; i < diceContainer.children.length; i++) {
            const die = diceContainer.children[i];

            if (die.classList.contains('toBeConserved')) {
                die.style.animation = 'none';
                die.classList.remove('toBeConserved');
                die.classList.add('toTheRight');
            }
        }

        currentActionIndex++;
        if (currentActionIndex < actions.length) {
            setTimeout(() => {
                rollDiceForAction(actions[currentActionIndex]);
            }, 1000); // Delay before rolling the next set of dice
        } else {
            console.log("End of actions for current manche");
            currentMancheIndex++;
            if (currentMancheIndex < historique.length) {
                console.log(`Starting manche ${currentMancheIndex + 1}`);
                actions = historique[currentMancheIndex].actions.filter(action => action.action === "conserve_de");
                currentActionIndex = 0;
                setTimeout(() => {
                    resetDice(); // Reset the dice before starting the next manche
                    rollDiceForAction(actions[currentActionIndex]);
                }, 1000); // Delay before starting the next manche
            } else {
                setTimeout(() => {
                    resetDice();
                    rollBtn.disabled = false; // Re-enable the button after all actions are completed and dice are reset
                    console.log("All manches completed");
                }, 1000); // Short delay before resetting the dice
            }
        }
    }, 4000);
}

// Function to handle the button click event
const handleRollClick = () => {
    rollBtn.disabled = true; // Disable the button during the animation
    currentMancheIndex = 0; // Reset the manche index
    currentActionIndex = 0; // Reset the action index
    actions = historique[currentMancheIndex].actions.filter(action => action.action === "conserve_de"); // Load actions for the first manche
    if (actions.length > 0) {
        rollDiceForAction(actions[currentActionIndex]); // Start the sequence of actions
    } else {
        console.error('No valid actions available in the first manche');
        rollBtn.disabled = false;
    }
}

// Function to fetch JSON data and process manches
const fetchDataAndManches = async () => {
    try {
        const response = await fetch('data.json'); // Adapter l'URL en fonction de votre structure de projet
        const data = await response.json();

        // Vérifier si le JSON contient un tableau "historique"
        if (!Array.isArray(data.historique)) {
            throw new Error('Le JSON ne contient pas de tableau "historique".');
        }

        historique = data.historique;
        console.log("JSON data loaded successfully", historique);
    } catch (error) {
        console.error('Erreur lors du chargement ou du traitement du fichier JSON :', error);
    }
}

// Load JSON data when the page loads
window.addEventListener('DOMContentLoaded', fetchDataAndManches);

// Event listener for the roll button click
rollBtn.addEventListener('click', handleRollClick);