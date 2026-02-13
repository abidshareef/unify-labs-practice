// Game variables
let randomNumber;
let attemptsLeft;
let guessCount;
let guessList;
const MAX_ATTEMPTS = 10;

// DOM elements
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const messageDiv = document.getElementById('message');
const attemptsSpan = document.getElementById('attempts');
const guessCountSpan = document.getElementById('guessCount');
const guessListDiv = document.getElementById('guessList');
const restartButton = document.getElementById('restartButton');

// Initialize game
function initGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = MAX_ATTEMPTS;
    guessCount = 0;
    guessList = [];
    
    // Reset UI
    attemptsSpan.textContent = attemptsLeft;
    guessCountSpan.textContent = guessCount;
    guessListDiv.innerHTML = '';
    messageDiv.textContent = '';
    messageDiv.className = 'message';
    guessInput.value = '';
    guessInput.disabled = false;
    guessButton.disabled = false;
    restartButton.style.display = 'none';
    guessInput.focus();
}

// Update UI with guess history
function updateGuessList(guess) {
    const guessItem = document.createElement('div');
    guessItem.className = 'guess-item';
    guessItem.textContent = guess;
    guessListDiv.appendChild(guessItem);
}

// Display message with appropriate styling
function displayMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
}

// End game
function endGame(won) {
    guessInput.disabled = true;
    guessButton.disabled = true;
    restartButton.style.display = 'block';
    
    if (won) {
        displayMessage(`🎉 Congratulations! You guessed it in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}!`, 'correct');
    } else {
        displayMessage(`💔 Game Over! The number was ${randomNumber}. Try again!`, 'game-over');
    }
}

// Process user's guess
function makeGuess() {
    // Get and validate input
    const userGuess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        displayMessage('⚠️ Please enter a valid number!', 'game-over');
        return;
    }
    
    if (userGuess < 1 || userGuess > 100) {
        displayMessage('⚠️ Please enter a number between 1 and 100!', 'game-over');
        return;
    }
    
    // Check if already guessed
    if (guessList.includes(userGuess)) {
        displayMessage('⚠️ You already guessed that number! Try a different one.', 'game-over');
        return;
    }
    
    // Update game state
    guessCount++;
    attemptsLeft--;
    guessList.push(userGuess);
    
    // Update UI
    attemptsSpan.textContent = attemptsLeft;
    guessCountSpan.textContent = guessCount;
    updateGuessList(userGuess);
    
    // Check the guess
    if (userGuess === randomNumber) {
        // Correct guess - player wins!
        endGame(true);
    } else if (attemptsLeft === 0) {
        // No attempts left - game over
        endGame(false);
    } else {
        // Give hint
        if (userGuess > randomNumber) {
            displayMessage('📉 Too High! Try a lower number.', 'too-high');
        } else {
            displayMessage('📈 Too Low! Try a higher number.', 'too-low');
        }
    }
    
    // Clear input for next guess
    guessInput.value = '';
    guessInput.focus();
}

// Event listeners
guessButton.addEventListener('click', makeGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

restartButton.addEventListener('click', initGame);

// Start the game when page loads
initGame();