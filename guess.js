const board = document.getElementById('game-board');
const messageBox = document.getElementById('game-message');
const keys = document.querySelectorAll('.key');
const langButtons = document.querySelectorAll('.lang-btn');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

let currentRow = 0;
let currentCol = 0;
let currentGuess = [];
let isGameOver = false;

let dictionary = [];
let solution = "";

function initBoard() {
    board.innerHTML = ''; 
    for (let i = 0; i < 30; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.setAttribute('id', `tile-${i}`);
        board.appendChild(tile);
    }
}
initBoard();

async function loadLanguage(languageFile) {
    try {
        const response = await fetch(`${languageFile}.txt`);
        if (!response.ok) throw new Error(`Could not find ${languageFile}.txt`);
        
        const text = await response.text();
        
        dictionary = text.split('\n')
                         .map(word => word.trim().toUpperCase())
                         .filter(word => word.length === 5); 

        solution = dictionary[Math.floor(Math.random() * dictionary.length)];
        
        resetGame();
    } catch (error) {
        showMessage(`Error loading ${languageFile}.txt`);
        console.error(error);
    }
}

function shakeCurrentRow() {
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow * 5 + i}`);
        tile.classList.add('shake');
        // rmv shake class after animation = done
        setTimeout(() => tile.classList.remove('shake'), 400); 
    }
}

function resetGame() {
    currentRow = 0;
    currentCol = 0;
    currentGuess = [];
    isGameOver = false;
    messageBox.classList.add('hidden');

    for (let i = 0; i < 30; i++) {
        const tile = document.getElementById(`tile-${i}`);
        tile.textContent = '';
        tile.className = 'tile';
    }

    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        langButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const fileToLoad = e.target.getAttribute('data-file');
        loadLanguage(fileToLoad);
    });
});

function showMessage(msg, duration = 2000) {
    messageBox.textContent = msg;
    messageBox.classList.remove('hidden');
    setTimeout(() => {
        if (!isGameOver) messageBox.classList.add('hidden');
    }, duration);
}

function handleKeyPress(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentCol < 5) {
        const tile = document.getElementById(`tile-${currentRow * 5 + currentCol}`);
        tile.textContent = letter;
        tile.classList.add('pop'); // pop animation
        currentGuess.push(letter);
        currentCol++;
    }
}

function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        const tile = document.getElementById(`tile-${currentRow * 5 + currentCol}`);
        tile.textContent = '';
        tile.classList.remove('pop'); // box state reset
        currentGuess.pop();
    }
}

function submitGuess() {
    if (currentCol !== 5) {
        showMessage("Not enough letters!");
        shakeCurrentRow(); // wordle shake row
        return;
    }

    const guessString = currentGuess.join('');
    
    if (!dictionary.includes(guessString)) {
        showMessage("Not in word list");
        shakeCurrentRow(); // wordle shake row
        return;
    }

    checkWinCondition();
}

function checkWinCondition() {
    const guessString = currentGuess.join('');
    const solutionArray = solution.split('');
    const tileColors = ['absent', 'absent', 'absent', 'absent', 'absent'];
    
    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === solutionArray[i]) {
            tileColors[i] = 'correct';
            solutionArray[i] = null; 
        }
    }

    for (let i = 0; i < 5; i++) {
        if (tileColors[i] === 'absent' && solutionArray.includes(currentGuess[i])) {
            tileColors[i] = 'present';
            const index = solutionArray.indexOf(currentGuess[i]);
            solutionArray[index] = null; 
        }
    }

    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow * 5 + i}`);
        const letter = currentGuess[i];
        
        setTimeout(() => {
            tile.classList.add(tileColors[i], 'flip'); 
            updateKeyboardColor(letter, tileColors[i]);
        }, i * 250);
    }

    // Check Win/Loss
    if (guessString === solution) {
        isGameOver = true;
        setTimeout(() => showMessage("Nice job!", 99999), 1200);
        return;
    }

    if (currentRow === 5) {
        isGameOver = true;
        setTimeout(() => showMessage(solution, 99999), 1200);
        return;
    }

    currentRow++;
    currentCol = 0;
    currentGuess = [];
}

function updateKeyboardColor(letter, color) {
    const key = Array.from(keys).find(k => k.getAttribute('data-key').toUpperCase() === letter);
    if (!key) return;

    if (color === 'correct') {
        key.classList.remove('present', 'absent');
        key.classList.add('correct');
    } else if (color === 'present' && !key.classList.contains('correct')) {
        key.classList.remove('absent');
        key.classList.add('present');
    } else if (color === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
        key.classList.add('absent');
    }
}

document.addEventListener('keydown', (e) => {
    let key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
});

keys.forEach(key => {
    key.addEventListener('click', () => {
        handleKeyPress(key.getAttribute('data-key').toUpperCase());
    });
});

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove('open');
    }
});

loadLanguage('english');