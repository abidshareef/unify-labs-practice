// Pet class implementation
class Pet {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this._health = 100;
        this._energy = 100;
    }
    
    // Getter for health with validation
    get health() {
        return this._health;
    }
    
    // Setter for health with bounds checking
    set health(value) {
        if (value > 100) {
            this._health = 100;
        } else if (value < 0) {
            this._health = 0;
        } else {
            this._health = value;
        }
    }
    
    // Getter for energy with validation
    get energy() {
        return this._energy;
    }
    
    // Setter for energy with bounds checking
    set energy(value) {
        if (value > 100) {
            this._energy = 100;
        } else if (value < 0) {
            this._energy = 0;
        } else {
            this._energy = value;
        }
    }
    
    // Method to feed the pet
    feed() {
        if (this.health >= 100 && this.energy >= 100) {
            return "Your pet is already full!";
        }
        
        this.health += 15;
        this.energy += 5;
        
        return `${this.name} enjoyed the meal! Health +15, Energy +5`;
    }
    
    // Method to play with the pet
    play() {
        if (this.energy < 20) {
            return `${this.name} is too tired to play!`;
        }
        
        this.energy -= 20;
        this.health += 10;
        
        return `${this.name} had fun playing! Energy -20, Health +10`;
    }
    
    // Method to rest the pet
    rest() {
        this.energy += 30;
        this.health += 5;
        
        return `${this.name} took a nap and feels refreshed! Energy +30, Health +5`;
    }
    
    // Method to get status
    getStatus() {
        if (this.health <= 20) {
            return `${this.name} is very unhealthy! Feed your pet immediately!`;
        } else if (this.energy <= 20) {
            return `${this.name} is exhausted! Let your pet rest!`;
        } else if (this.health >= 80 && this.energy >= 80) {
            return `${this.name} is happy and energetic!`;
        } else {
            return `${this.name} is doing okay.`;
        }
    }
    
    // Method to update pet's mood based on stats
    getMood() {
        if (this.health <= 20 || this.energy <= 20) return 'sad';
        if (this.health >= 80 && this.energy >= 80) return 'happy';
        return 'neutral';
    }
}

// Create a new pet instance
const myPet = new Pet("Buddy", "Dog");

// DOM elements
const petNameEl = document.getElementById('pet-name');
const petTypeEl = document.getElementById('pet-type');
const petFaceEl = document.getElementById('pet-face');
const healthValueEl = document.getElementById('health-value');
const energyValueEl = document.getElementById('energy-value');
const healthBarEl = document.getElementById('health-bar');
const energyBarEl = document.getElementById('energy-bar');
const statusMessageEl = document.getElementById('status-message');

// Button elements
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const restBtn = document.getElementById('rest-btn');
const statusBtn = document.getElementById('status-btn');

// Update UI with current pet stats
function updateUI() {
    // Update stats display
    healthValueEl.textContent = `${myPet.health}%`;
    energyValueEl.textContent = `${myPet.energy}%`;
    
    // Update progress bars
    healthBarEl.style.width = `${myPet.health}%`;
    energyBarEl.style.width = `${myPet.energy}%`;
    
    // Update pet face based on mood
    const mood = myPet.getMood();
    switch(mood) {
        case 'happy':
            petFaceEl.textContent = myPet.type === 'Dog' ? '🐶' : '🐱';
            break;
        case 'sad':
            petFaceEl.textContent = myPet.type === 'Dog' ? '😢' : '😿';
            break;
        default:
            petFaceEl.textContent = myPet.type === 'Dog' ? '🐕' : '🐈';
    }
    
    // Update button states
    playBtn.disabled = myPet.energy < 20;
}

// Event listeners for buttons
feedBtn.addEventListener('click', () => {
    const message = myPet.feed();
    statusMessageEl.textContent = message;
    updateUI();
});

playBtn.addEventListener('click', () => {
    const message = myPet.play();
    statusMessageEl.textContent = message;
    updateUI();
});

restBtn.addEventListener('click', () => {
    const message = myPet.rest();
    statusMessageEl.textContent = message;
    updateUI();
});

statusBtn.addEventListener('click', () => {
    const message = myPet.getStatus();
    statusMessageEl.textContent = message;
});

// Initialize UI
petNameEl.textContent = `Name: ${myPet.name}`;
petTypeEl.textContent = `Type: ${myPet.type}`;
updateUI();

// Simulate time passing (gradually decrease stats)
setInterval(() => {
    myPet.health -= 1;
    myPet.energy -= 2;
    updateUI();
}, 10000); // Every 10 seconds
