const generalaCategories = ["ones", "twos", "threes", "fours", "fives", "sixes", "escalera", "full", "poker", "generala", "dobleGenerala"];

const gameState = {
    numPlayers: 0,
    playerNames: [],
    generalaScores: {}, // Will hold scores for each player and category, e.g., { player1: { ones: 1, twos: null, ...}, player2: {} }
    language: 'es', // Default to Spanish
    darkMode: false,
};

const translations = {
    en: {
        title: "🎲 Generala Scorer",
        numPlayers: "Number of Players",
        startGame: "Start Game",
        renamePlayers: "Rename Players",
        resetGame: "Reset Game",
        renamePlayersTitle: "Rename Players",
        saveChanges: "Save Changes",
        confirmResetTitle: "Confirm Reset",
        confirmResetBody: "Are you sure you want to reset the game? All current scores will be lost.",
        cancel: "Cancel",
        yesReset: "Yes, Reset",
        player: "Player", // For default player names
        generalaGridPlaceholder: "Generala scoring grid will be displayed here.", // Will be removed by board
        categoryHeader: "Category",
        ones: "Ones",
        twos: "Twos",
        threes: "Threes",
        fours: "Fours",
        fives: "Fives",
        sixes: "Sixes",
        escalera: "Straight",
        full: "Full House",
        poker: "Poker (4 of a kind)",
        generala: "Generala (5 of a kind)",
        dobleGenerala: "Double Generala",
        total: "Total",
        gameResetMsg: "Game has been reset."
    },
    es: {
        title: "🎲 Anotador de Generala",
        numPlayers: "Número de Jugadores",
        startGame: "Comenzar Juego",
        renamePlayers: "Renombrar Jugadores",
        resetGame: "Reiniciar Juego",
        renamePlayersTitle: "Renombrar Jugadores",
        saveChanges: "Guardar Cambios",
        confirmResetTitle: "Confirmar Reinicio",
        confirmResetBody: "¿Estás seguro de que quieres reiniciar el juego? Se perderán todas las puntuaciones actuales.",
        cancel: "Cancelar",
        yesReset: "Sí, Reiniciar",
        player: "Jugador",
        generalaGridPlaceholder: "La grilla de puntuación de Generala se mostrará aquí.", // Will be removed by board
        categoryHeader: "Categoría",
        ones: "1 (Balas)",
        twos: "2 (Tontos)",
        threes: "3 (Trenes)",
        fours: "4 (Cuadras)",
        fives: "5 (Quinas)",
        sixes: "6 (Sextas)",
        escalera: "Escalera",
        full: "Full",
        poker: "Poker",
        generala: "Generala",
        dobleGenerala: "Doble Generala",
        total: "Total",
        gameResetMsg: "El juego ha sido reiniciado."
    },
    pt: {
        title: "🎲 Marcador de Generala",
        numPlayers: "Número de Jogadores",
        startGame: "Começar Jogo",
        renamePlayers: "Renomear Jogadores",
        resetGame: "Reiniciar Jogo",
        renamePlayersTitle: "Renomear Jogadores",
        saveChanges: "Salvar Alterações",
        confirmResetTitle: "Confirmar Reinício",
        confirmResetBody: "Tem certeza que deseja reiniciar o jogo? Todas as pontuações atuais serão perdidas.",
        cancel: "Cancelar",
        yesReset: "Sim, Reiniciar",
        player: "Jogador",
        generalaGridPlaceholder: "A grade de pontuação da Generala será exibida aqui.", // Will be removed by board
        categoryHeader: "Categoria",
        ones: "Uns", 
        twos: "Dois",
        threes: "Três",
        fours: "Quatros", 
        fives: "Cincos", 
        sixes: "Seis",
        escalera: "Escada", 
        full: "Full House", 
        poker: "Poker",
        generala: "Generala", 
        dobleGenerala: "Generala Dupla",
        total: "Total",
        gameResetMsg: "O jogo foi reiniciado."
    }
};

// DOM Elements
const setupFormDiv = document.getElementById('setup-form');
const gameContainerDiv = document.getElementById('game-container');
const confirmResetButton = document.getElementById('confirm-reset-btn'); // Defined here for clarity
const gameSetupForm = document.getElementById('game-setup');
const languageSelect = document.getElementById('language-select');
const themeToggleBtn = document.getElementById('theme-toggle');
const playerNamesInputContainer = document.getElementById('player-names-input-container');
const renamePlayersForm = document.getElementById('rename-players-form');
let renamePlayersModalInstance;
let resetConfirmModalInstance; // For the new modal

function saveGameState() {
    localStorage.setItem('generalaCounterState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('generalaCounterState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(gameState, parsedState); 
        return true; 
    }
    return false; 
}

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️'; // Sun icon for light mode
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode
    }
}

function translatePage(lang) {
    gameState.language = lang; 
    if (!translations[lang]) {
        console.warn(`No translations found for language: ${lang}`);
        return;
    }
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translations[lang][key];
            } else if (element.placeholder && translations[lang][key]) {
                 element.placeholder = translations[lang][key];
            }
            else {
                element.textContent = translations[lang][key];
            }
        } else {
            console.warn(`Missing translation for key: ${key} in language: ${lang}`);
        }
    });
}

function initGame() {
    if (loadGameState()) {
        // A saved state was loaded.
        // Ensure language from saved state is applied, or default to 'es'.
        if (!gameState.language) { 
            gameState.language = 'es';
        }
        languageSelect.value = gameState.language;
        
        applyTheme(gameState.darkMode); // Apply loaded theme

        if (gameState.numPlayers > 0) { 
            showGame(); 
        } else { 
            setupFormDiv.style.display = 'block';
            gameContainerDiv.style.display = 'none';
            translatePage(gameState.language); 
        }
    } else {
        // No saved state found, set default language and theme.
        gameState.language = 'es';
        languageSelect.value = gameState.language;
        gameState.darkMode = false; // Default to light mode
        applyTheme(gameState.darkMode);
        
        setupFormDiv.style.display = 'block';
        gameContainerDiv.style.display = 'none';
        translatePage(gameState.language);
    }
}

function startGame(numPlayers) { 
    gameState.numPlayers = parseInt(numPlayers, 10);
    gameState.playerNames = Array.from({ length: gameState.numPlayers }, (_, i) => `${translations[gameState.language].player} ${i + 1}`);
    
    gameState.generalaScores = {}; 
    for (let i = 0; i < gameState.numPlayers; i++) {
        const playerScores = {};
        generalaCategories.forEach(category => {
            playerScores[category] = { score: null, crossedOut: false };
        });
        gameState.generalaScores[i] = playerScores; // Using player index as key
    }
    
    saveGameState();
    showGame();
}

function updateUI() {
    const generalaBoardContainer = document.getElementById('generala-board-container');
    if (!generalaBoardContainer) return; // Should not happen
    generalaBoardContainer.innerHTML = ''; // Clear previous board

    const currentLangTranslations = translations[gameState.language] || translations.en;

    const table = document.createElement('table');
    table.className = 'table table-bordered text-center align-middle';

    // Table Head (Thead)
    const thead = document.createElement('thead');
    thead.className = 'table-dark'; // Dark header for better contrast
    const headerRow = document.createElement('tr');
    
    const categoryHeaderCell = document.createElement('th');
    categoryHeaderCell.setAttribute('data-i18n', 'categoryHeader');
    categoryHeaderCell.textContent = currentLangTranslations.categoryHeader || "Category";
    headerRow.appendChild(categoryHeaderCell);

    for (let i = 0; i < gameState.numPlayers; i++) {
        const playerHeaderCell = document.createElement('th');
        playerHeaderCell.textContent = gameState.playerNames[i] || `${currentLangTranslations.player} ${i + 1}`;
        headerRow.appendChild(playerHeaderCell);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table Body (Tbody)
    const tbody = document.createElement('tbody');
    generalaCategories.forEach(categoryKey => {
        const tr = document.createElement('tr');
        
        const categoryNameCell = document.createElement('td');
        categoryNameCell.textContent = currentLangTranslations[categoryKey] || categoryKey;
        tr.appendChild(categoryNameCell);

        for (let pIdx = 0; pIdx < gameState.numPlayers; pIdx++) {
            const td = document.createElement('td');
            const scoreData = gameState.generalaScores[pIdx] ? (gameState.generalaScores[pIdx][categoryKey] || { score: null, crossedOut: false }) : { score: null, crossedOut: false };

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control form-control-sm mx-auto';
            input.style.width = '70px';
            input.value = scoreData.score !== null ? scoreData.score : '';
            
            if (scoreData.crossedOut) {
                input.classList.add('crossed-out-input');
                input.disabled = true; // Also ensure it's disabled if crossed out
            } else {
                input.classList.remove('crossed-out-input');
                input.disabled = false; // Ensure it's enabled if not crossed out
            }

            input.dataset.playerIndex = pIdx;
            input.dataset.categoryKey = categoryKey;
            input.addEventListener('change', (event) => handleScoreChange(pIdx, categoryKey, event.target.value));

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input mt-0 ms-1 align-middle'; // Added align-middle
            checkbox.checked = scoreData.crossedOut;
            checkbox.disabled = scoreData.score !== null && scoreData.score !== '';
            checkbox.dataset.playerIndex = pIdx;
            checkbox.dataset.categoryKey = categoryKey;
            checkbox.addEventListener('change', (event) => handleCrossOut(pIdx, categoryKey, event.target.checked));
            
            const cellWrapper = document.createElement('div'); // For better layout of input & checkbox
            cellWrapper.className = 'd-flex align-items-center justify-content-center';
            cellWrapper.appendChild(input);
            cellWrapper.appendChild(checkbox);
            td.appendChild(cellWrapper);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Table Foot (Tfoot)
    const tfoot = document.createElement('tfoot');
    tfoot.className = 'table-secondary fw-bold';
    const footerRow = document.createElement('tr');
    
    const totalHeaderCell = document.createElement('td');
    totalHeaderCell.setAttribute('data-i18n', 'total');
    totalHeaderCell.textContent = currentLangTranslations.total || "Total";
    footerRow.appendChild(totalHeaderCell);

    for (let pIdx = 0; pIdx < gameState.numPlayers; pIdx++) {
        let playerTotal = 0;
        if(gameState.generalaScores[pIdx]){
            generalaCategories.forEach(categoryKey => {
                const scoreData = gameState.generalaScores[pIdx][categoryKey];
                if (scoreData && scoreData.score !== null && !scoreData.crossedOut) {
                    playerTotal += parseInt(scoreData.score, 10) || 0;
                }
            });
        }
        const totalCell = document.createElement('td');
        totalCell.id = `total_player_${pIdx}`;
        totalCell.textContent = playerTotal;
        footerRow.appendChild(totalCell);
    }
    tfoot.appendChild(footerRow);
    table.appendChild(tfoot);

    generalaBoardContainer.appendChild(table);
    translatePage(gameState.language); // Ensure static parts of the new structure are translated
}

function handleScoreChange(playerIndex, categoryKey, value) {
    const newScore = parseInt(value, 10);

    if (value === '' || isNaN(newScore)) {
        gameState.generalaScores[playerIndex][categoryKey].score = null;
    } else {
        gameState.generalaScores[playerIndex][categoryKey].score = newScore;
        gameState.generalaScores[playerIndex][categoryKey].crossedOut = false; // Entering a score un-crosses it
    }
    
    saveGameState();
    updateUI(); // This will refresh the board, totals, and input/checkbox states
}

function handleCrossOut(playerIndex, categoryKey, isChecked) {
    gameState.generalaScores[playerIndex][categoryKey].crossedOut = isChecked;
    if (isChecked) {
        gameState.generalaScores[playerIndex][categoryKey].score = null; // Crossing out clears any score
    }
    
    saveGameState();
    updateUI(); // This will refresh the board, totals, and input/checkbox states
}

function showGame() {
    setupFormDiv.style.display = 'none';
    gameContainerDiv.style.display = 'block';
    updateUI(); 
}

function updateRenamePlayersModal() {
    playerNamesInputContainer.innerHTML = ''; 
    const currentLangTranslations = translations[gameState.language] || translations.en;
    for (let i = 0; i < gameState.numPlayers; i++) {
        const playerName = gameState.playerNames[i] || `${currentLangTranslations.player} ${i + 1}`;
        const labelText = gameState.playerNames[i] ? gameState.playerNames[i] : `${currentLangTranslations.player} ${i + 1}`;
        const inputGroupHtml = `
            <div class="mb-3">
                <label for="player_name_input_${i}" class="form-label">${labelText}</label>
                <input type="text" id="player_name_input_${i}" name="player_name_${i}" class="form-control" value="${playerName}" required>
            </div>
        `;
        playerNamesInputContainer.insertAdjacentHTML('beforeend', inputGroupHtml);
    }
}

function renamePlayers(newNames) {
    const currentLangTranslations = translations[gameState.language] || translations.en;
    
    // Simply update the playerNames array. 
    // gameState.generalaScores uses player *indices* (0, 1, ...) as keys,
    // so its structure is unaffected by name changes.
    gameState.playerNames = newNames.map((name, i) => name.trim() || `${currentLangTranslations.player} ${i + 1}`);
    
    saveGameState();
    updateUI(); // This will re-render player names in the table header
    showToast(currentLangTranslations.playerRenamedMsg || "Player names updated.", 'success');
}

// Event Listeners
gameSetupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const numPlayersInput = document.getElementById('num-players');
    startGame(numPlayersInput.value);
});

languageSelect.addEventListener('change', function(event) {
    const newLang = event.target.value;
    translatePage(newLang); 
    if (gameContainerDiv.style.display === 'block') { 
        updateUI(); 
    }
    saveGameState(); 
});

renamePlayersForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const updatedNames = [];
    for (let i = 0; i < gameState.numPlayers; i++) {
        const input = renamePlayersForm.querySelector(`input[name="player_name_${i}"]`);
        updatedNames.push(input.value);
    }
    renamePlayers(updatedNames);
    renamePlayersModalInstance.hide();
});

themeToggleBtn.addEventListener('click', function() {
    gameState.darkMode = !gameState.darkMode;
    applyTheme(gameState.darkMode);
    saveGameState();
});

// Event listener for the actual reset confirmation button inside the modal
if(confirmResetButton) { // Ensure the button exists
    confirmResetButton.addEventListener('click', function() {
        // Preserve language and dark mode preferences
        const currentLang = gameState.language;
        const currentDarkMode = gameState.darkMode;

        localStorage.removeItem('generalaCounterState'); // Clear from local storage
        
        // Reset gameState properties (keeping language and darkMode)
        gameState.numPlayers = 0;
        gameState.playerNames = [];
        gameState.generalaScores = {};
        // gameState.language and gameState.darkMode are intentionally preserved by restoring them.
        
        // Re-initialize core gameState properties for a new game
        gameState.numPlayers = 0;
        gameState.playerNames = [];
        gameState.generalaScores = {};
        gameState.language = currentLang; // Restore
        gameState.darkMode = currentDarkMode; // Restore

        saveGameState(); // Save the effectively reset state with preferences intact
        
        // Update UI to reflect reset
        setupFormDiv.style.display = 'block';
        gameContainerDiv.style.display = 'none';
        
        if(resetConfirmModalInstance) { // Check if modal instance exists
            resetConfirmModalInstance.hide();
        }
        
        updateUI(); // Clear the game board display
        const currentLangTranslations = translations[gameState.language] || translations.en;
        showToast(currentLangTranslations.gameResetMsg || "Game has been reset.", 'info');
    });
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renamePlayersModalInstance = new bootstrap.Modal(document.getElementById('renamePlayersModal'));
    
    const resetModalElement = document.getElementById('resetConfirmModal');
    if(resetModalElement) { // Ensure the element exists before creating a modal instance
        resetConfirmModalInstance = new bootstrap.Modal(resetModalElement);
    }

    document.getElementById('renamePlayersModal').addEventListener('show.bs.modal', function () {
        updateRenamePlayersModal();
    });
    
    initGame(); 
}); 