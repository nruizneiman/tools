// Game state
const gameState = {
    teams: 0,
    goal: 0,
    scores: [],
    history: [],
    winner: null,
    teamNames: [],
    continuePlaying: false,
    lastRound: null,
    darkMode: false,
    language: 'es'
};

// Translations
const translations = {
    en: {
        title: "🃏 Buraco Score Counter",
        numTeams: "Number of Teams",
        goalPoints: "Goal Points",
        startGame: "Start Game",
        goal: "Goal",
        round: "Round",
        total: "Total",
        addPoints: "Add Points",
        renameTeams: "Rename Teams",
        reset: "Reset",
        undo: "Undo",
        enterPoints: "Enter Round Points",
        submitRound: "Submit Round",
        confirmReset: "Are you sure?",
        resetWarning: "This will reset all scores and game settings.",
        yesReset: "Yes, Reset",
        cancel: "Cancel",
        saveChanges: "Save Changes",
        team: "Team",
        teamWins: "Team Wins!",
        resetGame: "Reset Game",
        continuePlaying: "Continue Playing",
        export: "Export",
        import: "Import",
        gameExported: "Game exported successfully!",
        gameImported: "Game imported successfully!",
        hasReached: "has reached",
        points: "points",
        continueQuestion: "Would you like to continue playing or reset the game?"
    },
    pt: {
        title: "🃏 Marcador de Buraco",
        numTeams: "Número de Times",
        goalPoints: "Pontos Objetivo",
        startGame: "Iniciar Jogo",
        goal: "Objetivo",
        round: "Rodada",
        total: "Total",
        addPoints: "Adicionar Pontos",
        renameTeams: "Renomear Times",
        reset: "Reiniciar",
        undo: "Desfazer",
        enterPoints: "Pontos da Rodada",
        submitRound: "Enviar Rodada",
        confirmReset: "Tem certeza?",
        resetWarning: "Isso reiniciará todas as pontuações e configurações.",
        yesReset: "Sim, Reiniciar",
        cancel: "Cancelar",
        saveChanges: "Salvar Alterações",
        team: "Time",
        teamWins: "Time Venceu!",
        resetGame: "Reiniciar Jogo",
        continuePlaying: "Continuar Jogando",
        export: "Exportar",
        import: "Importar",
        gameExported: "Jogo exportado com sucesso!",
        gameImported: "Jogo importado com sucesso!",
        hasReached: "alcançou",
        points: "pontos",
        continueQuestion: "Você gostaria de continuar jogando ou reiniciar o jogo?"
    },
    es: {
        title: "🃏 Anotador de Buraco",
        numTeams: "Número de Equipos",
        goalPoints: "Puntos Objetivo",
        startGame: "Comenzar Juego",
        goal: "Objetivo",
        round: "Ronda",
        total: "Total",
        addPoints: "Añadir Puntos",
        renameTeams: "Renombrar Equipos",
        reset: "Reiniciar",
        undo: "Deshacer",
        enterPoints: "Puntos de la Ronda",
        submitRound: "Enviar Ronda",
        confirmReset: "¿Estás seguro?",
        resetWarning: "Esto reiniciará todos los puntajes y configuraciones.",
        yesReset: "Sí, Reiniciar",
        cancel: "Cancelar",
        saveChanges: "Guardar Cambios",
        team: "Equipo",
        teamWins: "¡Equipo Gana!",
        resetGame: "Reiniciar Juego",
        continuePlaying: "Continuar Jugando",
        export: "Exportar",
        import: "Importar",
        gameExported: "¡Juego exportado con éxito!",
        gameImported: "¡Juego importado con éxito!",
        hasReached: "ha alcanzado",
        points: "puntos",
        continueQuestion: "¿Te gustaría continuar jugando o reiniciar el juego?"
    }
};

// DOM elements
const setupForm = document.getElementById('setup-form');
const gameContainer = document.getElementById('game-container');
const gameSetupForm = document.getElementById('game-setup');
const updateScoresForm = document.getElementById('update-scores-form');
const renameTeamsForm = document.getElementById('rename-teams-form');
const confirmResetBtn = document.getElementById('confirm-reset');
const confirmResetWinnerBtn = document.getElementById('confirm-reset-winner');
const continuePlayingBtn = document.getElementById('continue-playing');
const undoBtn = document.getElementById('undo-btn');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');
const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));

// Initialize the game
function initGame() {
    // Load preferences
    loadPreferences();
    
    // Load from localStorage if available
    const savedGame = localStorage.getItem('buracoGame');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        Object.assign(gameState, parsed);
        
        if (gameState.continuePlaying) {
            gameState.winner = null;
            gameState.continuePlaying = false;
            saveGameState();
        }
        
        if (gameState.teams > 0) {
            showGame();
            return;
        }
    }
    
    // Show setup form if no saved game
    setupForm.style.display = 'block';
    translatePage(gameState.language);
    updateLanguageSelectorFlag();
}

// Load user preferences
function loadPreferences() {
    // Dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
        gameState.darkMode = true;
        themeToggle.textContent = '☀️';
    }
    
    // Language
    const savedLang = localStorage.getItem('language') || 'es';
    gameState.language = savedLang;
    languageSelect.value = savedLang;
}

// Update language selector flag
function updateLanguageSelectorFlag() {
    const selectedOption = languageSelect.options[languageSelect.selectedIndex];
    const flag = selectedOption.getAttribute('data-flag');
    languageSelect.previousElementSibling = flag;
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('buracoGame', JSON.stringify(gameState));
}

// Start the game
function startGame(teams, goal) {
    gameState.teams = teams;
    gameState.goal = goal;
    gameState.scores = new Array(teams).fill(0);
    gameState.history = [];
    gameState.winner = null;
    gameState.teamNames = Array.from({length: teams}, (_, i) => `${translations[gameState.language].team} ${i + 1}`);
    gameState.continuePlaying = false;
    gameState.lastRound = null;
    
    saveGameState();
    showGame();
}

// Show the game interface
function showGame() {
    setupForm.style.display = 'none';
    gameContainer.style.display = 'block';
    
    updateUI();
}

// Reset the game
function resetGame() {
    localStorage.removeItem('buracoGame');
    gameState.teams = 0;
    gameState.goal = 0;
    gameState.scores = [];
    gameState.history = [];
    gameState.winner = null;
    gameState.teamNames = [];
    gameState.continuePlaying = false;
    gameState.lastRound = null;
    
    gameContainer.style.display = 'none';
    setupForm.style.display = 'block';
}

// Update the UI based on game state
function updateUI() {
    // Update goal display
    document.getElementById('goal-display').textContent = `${translations[gameState.language].goal}: ${gameState.goal} ${translations[gameState.language].points}`;
    
    // Update table header
    const tableHeader = document.getElementById('table-header');
    tableHeader.innerHTML = `<th data-i18n="round">${translations[gameState.language].round}</th>`;
    gameState.teamNames.forEach(name => {
        tableHeader.innerHTML += `<th>${name}</th>`;
    });
    
    // Update history body
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = '';
    gameState.history.forEach((round, roundIndex) => {
        let row = `<tr><td>${roundIndex + 1}</td>`;
        round.forEach(value => {
            row += `<td>${value}</td>`;
        });
        row += '</tr>';
        historyBody.innerHTML += row;
    });
    
    // Update totals row
    const totalRow = document.getElementById('total-row');
    totalRow.innerHTML = `<td data-i18n="total">${translations[gameState.language].total}</td>`;
    gameState.scores.forEach(score => {
        totalRow.innerHTML += `<td>${score}</td>`;
    });
    
    // Update points input modal
    updatePointsInputModal();
    
    // Update rename teams modal
    updateRenameTeamsModal();
    
    // Check for winner
    checkWinner();
}

// Update the points input modal
function updatePointsInputModal() {
    const container = document.getElementById('points-input-container');
    container.innerHTML = '';
    
    gameState.teamNames.forEach((name, i) => {
        container.innerHTML += `
            <div class="mb-3">
                <label class="form-label">${name} (${translations[gameState.language].team} ${i + 1})</label>
                <div class="input-group">
                    <div class="btn-group toggle-btn me-2" role="group">
                        <input type="radio" class="btn-check" name="signs[${i}]" id="neg${i}" value="negative">
                        <label class="btn btn-outline-danger rounded-pill" for="neg${i}">−</label>

                        <input type="radio" class="btn-check" name="signs[${i}]" id="pos${i}" value="positive" checked>
                        <label class="btn btn-outline-success rounded-pill" for="pos${i}">+</label>
                    </div>
                    <input type="number" name="round_points[${i}]" class="form-control" placeholder="0" required>
                </div>
            </div>
        `;
    });
}

// Update the rename teams modal
function updateRenameTeamsModal() {
    const container = document.getElementById('team-names-container');
    container.innerHTML = '';
    
    gameState.teamNames.forEach((name, i) => {
        container.innerHTML += `
            <div class="mb-3">
                <label class="form-label">${gameState.teamNames[i]} (${translations[gameState.language].team} ${i + 1})</label>
                <input type="text" name="team_names[${i}]" class="form-control" value="${name}">
            </div>
        `;
    });
}

// Add a new round of scores
function addRound(points) {
    gameState.lastRound = [...gameState.scores]; // Store previous state for undo
    
    const round = [];
    points.forEach((value, i) => {
        const sign = document.querySelector(`input[name="signs[${i}]"]:checked`).value;
        const pointsValue = sign === 'negative' ? -Math.abs(value) : Math.abs(value);
        gameState.scores[i] += pointsValue;
        round.push(pointsValue);
    });
    
    gameState.history.push(round);
    saveGameState();
    updateUI();
}

// Undo last round
function undoLastRound() {
    if (gameState.lastRound) {
        gameState.scores = [...gameState.lastRound];
        gameState.history.pop();
        gameState.lastRound = null;
        gameState.winner = null;
        saveGameState();
        updateUI();
        showToast(translations[gameState.language].undo + " " + translations[gameState.language].success);
    }
}

// Rename teams
function renameTeams(names) {
    gameState.teamNames = names.map((name, i) => name.trim() || `${translations[gameState.language].team} ${i + 1}`);
    saveGameState();
    updateUI();
}

// Check if there's a winner
function checkWinner() {
    if (gameState.winner !== null) return;
    
    for (let i = 0; i < gameState.scores.length; i++) {
        if (gameState.scores[i] >= gameState.goal) {
            gameState.winner = i;
            showWinnerModal(i);
            saveGameState();
            break;
        }
    }
}

// Show winner modal
function showWinnerModal(winnerIndex) {
    document.getElementById('winner-title').innerHTML = `🏆 ${gameState.teamNames[winnerIndex]} <span data-i18n="teamWins">${translations[gameState.language].teamWins}</span>`;
    document.getElementById('winner-message').textContent = 
        `${gameState.teamNames[winnerIndex]} ${translations[gameState.language].hasReached} ${gameState.scores[winnerIndex]} ${translations[gameState.language].points}.\n${translations[gameState.language].continueQuestion}`;
    
    winnerModal.show();
}

// Show toast notification
function showToast(message) {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Translate the page
function translatePage(lang) {
    gameState.language = lang;
    localStorage.setItem('language', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    
    // Update UI if game is in progress
    if (gameState.teams > 0) {
        updateUI();
    }
}

// Export game data
function exportGame() {
    const data = JSON.stringify(gameState);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `buraco-game-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    showToast(translations[gameState.language].gameExported);
}

// Import game data
function importGame(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            Object.assign(gameState, data);
            saveGameState();
            showGame();
            showToast(translations[gameState.language].gameImported);
        } catch (err) {
            console.error('Invalid game file', err);
            showToast("Error: " + translations[gameState.language].invalidFile);
        }
    };
    reader.readAsText(file);
}

// Event listeners
gameSetupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const teams = parseInt(document.getElementById('teams').value);
    const goal = parseInt(document.getElementById('goal').value);
    startGame(teams, goal);
});

updateScoresForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const points = [];
    
    for (let i = 0; i < gameState.teams; i++) {
        points.push(parseInt(formData.get(`round_points[${i}]`)));
    }
    
    addRound(points);
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPointsModal'));
    modal.hide();
    
    // Reset form
    this.reset();
});

renameTeamsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const names = [];
    
    for (let i = 0; i < gameState.teams; i++) {
        names.push(formData.get(`team_names[${i}]`));
    }
    
    renameTeams(names);
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('renameTeamsModal'));
    modal.hide();
});

confirmResetBtn.addEventListener('click', function() {
    resetGame();
    const modal = bootstrap.Modal.getInstance(document.getElementById('resetConfirmModal'));
    modal.hide();
});

confirmResetWinnerBtn.addEventListener('click', function() {
    resetGame();
    winnerModal.hide();
});

continuePlayingBtn.addEventListener('click', function() {
    gameState.continuePlaying = true;
    saveGameState();
    winnerModal.hide();
    updateUI();
});

undoBtn.addEventListener('click', function() {
    undoLastRound();
});

themeToggle.addEventListener('click', function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        gameState.darkMode = false;
        this.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        gameState.darkMode = true;
        this.textContent = '☀️';
    }
    localStorage.setItem('darkMode', gameState.darkMode);
});

languageSelect.addEventListener('change', function() {
    translatePage(this.value);
    updateLanguageSelectorFlag();
});

exportBtn.addEventListener('click', function() {
    exportGame();
});

importBtn.addEventListener('click', function() {
    importInput.click();
});

importInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        importGame(this.files[0]);
        this.value = ''; // Reset input
    }
});

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame); 