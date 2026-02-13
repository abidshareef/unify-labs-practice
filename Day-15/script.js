// ===================================
// VIRTUAL CORE v1.0 - Terminal OS
// Professional State Machine Implementation
// 30 Years of Enterprise Experience
// ===================================

class VirtualCore {
    constructor() {
        // Global State Machine
        this.state = {
            isAuthenticated: false,
            currentModule: 'login',
            loginAttempts: 3,
            balance: 1000.00,
            secretWord: 'MATRIX',
            secretHint: 'A simulated reality from a famous sci-fi movie',
            vaultAttempts: 1,
            sessionStartTime: null,
            commandHistory: []
        };

        // Constants
        this.MASTER_PIN = '9999';
        this.UNIT_PRICE = 50;
        this.MAX_LOGIN_ATTEMPTS = 3;

        // DOM Elements
        this.terminalOutput = document.getElementById('terminal-output');
        this.terminalInput = document.getElementById('terminal-input');
        this.promptText = document.getElementById('prompt-text');
        this.attemptsDisplay = document.getElementById('attempts-left');
        this.balanceDisplay = document.getElementById('balance-display');
        this.sessionStatus = document.getElementById('session-status');
        this.statusText = document.getElementById('status-text');
        this.sessionTimeDisplay = document.getElementById('session-time');
        this.terminalContainer = document.querySelector('.terminal-container');

        // Initialize
        this.init();
    }

    init() {
        // Event Listeners
        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleInput();
            }
        });

        // Focus input on click anywhere
        this.terminalContainer.addEventListener('click', () => {
            this.terminalInput.focus();
        });

        // Initial display update
        this.updateFooter();
        this.terminalInput.focus();
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

    clearOutput() {
        this.terminalOutput.innerHTML = '';
    }

    printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.textContent = text;
        this.terminalOutput.appendChild(line);
        this.scrollToBottom();
    }

    printHTML(html) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        this.terminalOutput.appendChild(wrapper);
        this.scrollToBottom();
    }

    printCommand(command) {
        const line = document.createElement('div');
        line.className = 'command-echo';
        line.textContent = command;
        this.terminalOutput.appendChild(line);
        this.scrollToBottom();
    }

    printDivider() {
        const divider = document.createElement('div');
        divider.className = 'divider';
        this.terminalOutput.appendChild(divider);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    updateFooter() {
        this.attemptsDisplay.textContent = this.state.loginAttempts;
        if (this.state.isAuthenticated) {
            this.balanceDisplay.textContent = this.state.balance.toFixed(2);
        }
    }

    updateSessionStatus(status, text) {
        this.sessionStatus.className = status;
        this.statusText.textContent = text;
    }

    clearInput() {
        this.terminalInput.value = '';
    }

    playBeep() {
        // Simple beep sound (can be enhanced with actual audio)
        const beep = document.getElementById('beep-sound');
        if (beep) {
            beep.currentTime = 0;
            beep.play().catch(() => {});
        }
    }

    // ===================================
    // MAIN INPUT HANDLER
    // ===================================

    handleInput() {
        const input = this.terminalInput.value.trim();
        
        if (!input) {
            this.clearInput();
            return;
        }

        // Route based on current state
        if (this.state.currentModule === 'login') {
            this.handleLogin(input);
        } else if (this.state.currentModule === 'main') {
            this.handleMainMenu(input);
        } else if (this.state.currentModule === 'bank') {
            this.handleBankModule(input);
        } else if (this.state.currentModule === 'shop') {
            this.handleShopModule(input);
        } else if (this.state.currentModule === 'vault') {
            this.handleVaultModule(input);
        }

        this.clearInput();
    }

    // ===================================
    // STEP 1: BOOT SEQUENCE (Login System)
    // ===================================

    handleLogin(pin) {
        this.printCommand(pin.replace(/./g, '*')); // Mask PIN for security
        
        if (pin === this.MASTER_PIN) {
            this.loginSuccess();
        } else {
            this.loginFailed();
        }
    }

    loginSuccess() {
        this.state.isAuthenticated = true;
        this.state.currentModule = 'main';
        this.state.sessionStartTime = Date.now();
        
        this.clearOutput();
        this.printLine('✓ AUTHENTICATION SUCCESSFUL', 'success');
        this.printLine('');
        this.printLine('═'.repeat(60), 'muted');
        
        // Welcome Banner
        const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     WELCOME TO VIRTUAL CORE v1.0                          ║
║     Terminal Operating System                             ║
║                                                            ║
║     Status: ONLINE                                        ║
║     User: ADMINISTRATOR                                   ║
║     Access Level: FULL CONTROL                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝`;
        
        this.printHTML(`<pre class="ascii-art" style="font-size: 11px; color: var(--terminal-success);">${banner}</pre>`);
        this.printLine('');
        this.printDivider();
        
        this.showMainMenu();
        this.updateSessionStatus('active', 'AUTHENTICATED');
        this.updateFooter();
        this.startSessionTimer();
        
        this.promptText.textContent = '[V-CORE]>';
        this.terminalInput.placeholder = 'Type command...';
    }

    loginFailed() {
        this.state.loginAttempts--;
        this.updateFooter();
        
        this.printLine(`✗ ACCESS DENIED - Invalid PIN`, 'error');
        this.printLine(`Attempts remaining: ${this.state.loginAttempts}`, 'warning');
        
        if (this.state.loginAttempts === 0) {
            this.selfDestruct();
        } else {
            this.terminalContainer.classList.add('shake');
            setTimeout(() => {
                this.terminalContainer.classList.remove('shake');
            }, 500);
        }
    }

    selfDestruct() {
        this.printLine('');
        this.printLine('═'.repeat(60), 'error');
        this.printLine('⚠ CRITICAL SECURITY BREACH DETECTED ⚠', 'error');
        this.printLine('═'.repeat(60), 'error');
        this.printLine('');
        this.printLine('INITIATING SYSTEM SELF-DESTRUCT SEQUENCE...', 'error');
        this.printLine('');
        
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                this.printLine(`>>> SELF-DESTRUCT IN ${countdown}...`, 'error');
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.printLine('');
                this.printLine('█ SYSTEM TERMINATED █', 'error');
                this.printLine('All data has been purged.', 'error');
                this.printLine('Kernel shutdown complete.', 'muted');
                
                this.terminalContainer.classList.add('self-destruct');
                this.terminalInput.disabled = true;
                this.updateSessionStatus('', 'TERMINATED');
                
                setTimeout(() => {
                    this.terminalContainer.style.display = 'none';
                }, 3000);
            }
        }, 1000);
    }

    startSessionTimer() {
        setInterval(() => {
            if (this.state.sessionStartTime) {
                const elapsed = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                this.sessionTimeDisplay.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // ===================================
    // STEP 2: COMMAND KERNEL (Main Menu)
    // ===================================

    showMainMenu() {
        const menu = `
<div class="menu-display">
    <div class="menu-title">▼ AVAILABLE MODULES ▼</div>
    <div class="menu-option">BANK - Access banking services</div>
    <div class="menu-option">SHOP - Smart shopping system</div>
    <div class="menu-option">VAULT - Secure vault access</div>
    <div class="menu-option">EXIT - Terminate session</div>
</div>`;
        this.printHTML(menu);
        this.printLine('');
        this.printLine('Type a command to continue...', 'info');
    }

    handleMainMenu(command) {
        this.printCommand(command);
        
        const cmd = command.toLowerCase();
        
        switch(cmd) {
            case 'bank':
                this.enterBankModule();
                break;
            case 'shop':
                this.enterShopModule();
                break;
            case 'vault':
                this.enterVaultModule();
                break;
            case 'exit':
                this.exitSystem();
                break;
            case 'help':
            case 'menu':
                this.showMainMenu();
                break;
            case 'clear':
                this.clearOutput();
                this.showMainMenu();
                break;
            case 'balance':
                this.printLine(`Current Balance: $${this.state.balance.toFixed(2)}`, 'success');
                break;
            default:
                this.printLine(`✗ Unknown command: '${command}'`, 'error');
                this.printLine('Type HELP to see available commands.', 'muted');
        }
    }

    exitSystem() {
        this.printLine('');
        this.printDivider();
        this.printLine('Logging out...', 'warning');
        this.printLine('Session terminated.', 'muted');
        this.printLine('Thank you for using Virtual Core v1.0', 'success');
        this.printLine('');
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    // ===================================
    // STEP 3: MODULE A - BANKING KERNEL
    // ===================================

    enterBankModule() {
        this.state.currentModule = 'bank';
        this.printLine('');
        this.printDivider();
        this.printLine('═ BANKING KERNEL LOADED ═', 'success');
        this.printLine('');
        this.showBankMenu();
        this.promptText.textContent = '[BANK]>';
        this.terminalInput.placeholder = 'Enter bank command...';
    }

    showBankMenu() {
        const menu = `
<div class="menu-display">
    <div class="menu-title">▼ BANKING OPERATIONS ▼</div>
    <div class="menu-option">DEPOSIT - Add funds to account</div>
    <div class="menu-option">WITHDRAW - Remove funds from account</div>
    <div class="menu-option">BALANCE - Check current balance</div>
    <div class="menu-option">BACK - Return to main menu</div>
</div>`;
        this.printHTML(menu);
        this.printLine('');
        this.printLine(`Current Balance: $${this.state.balance.toFixed(2)}`, 'info');
    }

    handleBankModule(command) {
        this.printCommand(command);
        
        const cmd = command.toLowerCase();
        
        switch(cmd) {
            case 'deposit':
                this.handleDeposit();
                break;
            case 'withdraw':
                this.handleWithdraw();
                break;
            case 'balance':
                this.printLine(`Current Balance: $${this.state.balance.toFixed(2)}`, 'success');
                break;
            case 'back':
                this.returnToMain();
                break;
            case 'help':
            case 'menu':
                this.showBankMenu();
                break;
            default:
                this.printLine(`✗ Unknown bank command: '${command}'`, 'error');
                this.printLine('Type HELP to see available commands.', 'muted');
        }
    }

    handleDeposit() {
        const amount = prompt('💰 Enter deposit amount:');
        
        if (amount === null) {
            this.printLine('Deposit cancelled.', 'warning');
            return;
        }
        
        const depositAmount = parseFloat(amount);
        
        if (isNaN(depositAmount) || depositAmount <= 0) {
            this.printLine('✗ ERROR: Invalid amount. Please enter a positive number.', 'error');
            return;
        }
        
        this.state.balance += depositAmount;
        this.updateFooter();
        
        this.printLine(`✓ DEPOSIT SUCCESSFUL`, 'success');
        this.printLine(`Amount deposited: $${depositAmount.toFixed(2)}`, 'info');
        this.printLine(`New balance: $${this.state.balance.toFixed(2)}`, 'success');
    }

    handleWithdraw() {
        const amount = prompt('💳 Enter withdrawal amount:');
        
        if (amount === null) {
            this.printLine('Withdrawal cancelled.', 'warning');
            return;
        }
        
        const withdrawAmount = parseFloat(amount);
        
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            this.printLine('✗ ERROR: Invalid amount. Please enter a positive number.', 'error');
            return;
        }
        
        if (withdrawAmount > this.state.balance) {
            this.printLine('✗ INSUFFICIENT FUNDS', 'error');
            this.printLine(`Requested: $${withdrawAmount.toFixed(2)}`, 'info');
            this.printLine(`Available: $${this.state.balance.toFixed(2)}`, 'info');
            this.printLine(`Shortage: $${(withdrawAmount - this.state.balance).toFixed(2)}`, 'warning');
            return;
        }
        
        this.state.balance -= withdrawAmount;
        this.updateFooter();
        
        this.printLine(`✓ WITHDRAWAL SUCCESSFUL`, 'success');
        this.printLine(`Amount withdrawn: $${withdrawAmount.toFixed(2)}`, 'info');
        this.printLine(`New balance: $${this.state.balance.toFixed(2)}`, 'success');
    }

    // ===================================
    // STEP 4: MODULE B - SMART SHOP
    // ===================================

    enterShopModule() {
        this.state.currentModule = 'shop';
        this.printLine('');
        this.printDivider();
        this.printLine('═ SMART SHOP SYSTEM LOADED ═', 'success');
        this.printLine('');
        this.showShopMenu();
        this.promptText.textContent = '[SHOP]>';
        this.terminalInput.placeholder = 'Enter shop command...';
    }

    showShopMenu() {
        const menu = `
<div class="menu-display">
    <div class="menu-title">▼ SMART SHOP OPERATIONS ▼</div>
    <div class="menu-option">BUY - Purchase items</div>
    <div class="menu-option">PRICE - Check unit price</div>
    <div class="menu-option">DISCOUNT - View discount tiers</div>
    <div class="menu-option">BACK - Return to main menu</div>
</div>`;
        this.printHTML(menu);
        this.printLine('');
        this.printLine(`Unit Price: $${this.UNIT_PRICE.toFixed(2)}`, 'info');
        this.printLine(`Account Balance: $${this.state.balance.toFixed(2)}`, 'info');
    }

    handleShopModule(command) {
        this.printCommand(command);
        
        const cmd = command.toLowerCase();
        
        switch(cmd) {
            case 'buy':
                this.handlePurchase();
                break;
            case 'price':
                this.printLine(`Unit Price: $${this.UNIT_PRICE.toFixed(2)}`, 'info');
                break;
            case 'discount':
                this.showDiscountTiers();
                break;
            case 'back':
                this.returnToMain();
                break;
            case 'help':
            case 'menu':
                this.showShopMenu();
                break;
            default:
                this.printLine(`✗ Unknown shop command: '${command}'`, 'error');
                this.printLine('Type HELP to see available commands.', 'muted');
        }
    }

    showDiscountTiers() {
        this.printLine('');
        this.printLine('═ DISCOUNT TIERS ═', 'info');
        this.printLine('0-5 items: 0% discount', 'muted');
        this.printLine('6-10 items: 10% discount', 'success');
        this.printLine('11+ items: 20% discount', 'success');
        this.printLine('');
    }

    handlePurchase() {
        const quantity = prompt('🛒 Enter quantity of items to purchase:');
        
        if (quantity === null) {
            this.printLine('Purchase cancelled.', 'warning');
            return;
        }
        
        const qty = parseInt(quantity);
        
        if (isNaN(qty) || qty <= 0) {
            this.printLine('✗ ERROR: Invalid quantity. Please enter a positive integer.', 'error');
            return;
        }
        
        // Calculate discount based on quantity
        let discount = 0;
        let discountLabel = '';
        
        if (qty >= 0 && qty <= 5) {
            discount = 0;
            discountLabel = '0%';
        } else if (qty >= 6 && qty <= 10) {
            discount = 0.10;
            discountLabel = '10%';
        } else if (qty >= 11) {
            discount = 0.20;
            discountLabel = '20%';
        }
        
        const subtotal = qty * this.UNIT_PRICE;
        const discountAmount = subtotal * discount;
        const total = subtotal - discountAmount;
        
        // Display purchase summary
        this.printLine('');
        this.printLine('═ PURCHASE SUMMARY ═', 'info');
        this.printLine(`Quantity: ${qty} items`, 'muted');
        this.printLine(`Unit Price: $${this.UNIT_PRICE.toFixed(2)}`, 'muted');
        this.printLine(`Subtotal: $${subtotal.toFixed(2)}`, 'muted');
        this.printLine(`Discount (${discountLabel}): -$${discountAmount.toFixed(2)}`, 'success');
        this.printLine(`Total: $${total.toFixed(2)}`, 'info');
        this.printLine('');
        
        // Check if user has sufficient funds
        if (total > this.state.balance) {
            this.printLine('✗ INSUFFICIENT FUNDS', 'error');
            this.printLine(`Required: $${total.toFixed(2)}`, 'info');
            this.printLine(`Available: $${this.state.balance.toFixed(2)}`, 'info');
            this.printLine(`Shortage: $${(total - this.state.balance).toFixed(2)}`, 'warning');
            return;
        }
        
        // Process purchase
        this.state.balance -= total;
        this.updateFooter();
        
        this.printLine('✓ PURCHASE SUCCESSFUL', 'success');
        this.printLine(`Deducted from account: $${total.toFixed(2)}`, 'info');
        this.printLine(`New balance: $${this.state.balance.toFixed(2)}`, 'success');
        this.printLine('');
        this.printLine('Thank you for your purchase!', 'muted');
    }

    // ===================================
    // STEP 5: MODULE C - SECURE VAULT
    // ===================================

    enterVaultModule() {
        this.state.currentModule = 'vault';
        this.printLine('');
        this.printDivider();
        this.printLine('═ SECURE VAULT ACCESS ═', 'warning');
        this.printLine('');
        this.printLine('⚠ RESTRICTED AREA ⚠', 'warning');
        this.printLine('You have ONE attempt to prove your knowledge.', 'muted');
        this.printLine('');
        this.printLine(`Hint: ${this.state.secretHint}`, 'info');
        this.printLine('');
        this.promptText.textContent = '[VAULT]>';
        this.terminalInput.placeholder = 'Enter secret word...';
    }

    handleVaultModule(guess) {
        this.printCommand(guess);
        
        if (guess.toUpperCase() === this.state.secretWord) {
            this.vaultSuccess();
        } else {
            this.vaultFailed();
        }
    }

    vaultSuccess() {
        this.printLine('');
        this.printLine('✓ ACCESS GRANTED', 'success');
        this.printLine('');
        this.printLine('═'.repeat(60), 'success');
        
        const secretMessage = `
<div class="secret-message">
    <div class="secret-title">🔓 VAULT UNLOCKED 🔓</div>
    <p>Congratulations, Agent! You've successfully accessed the secure vault.</p>
    <p><strong>Secret Message:</strong></p>
    <p>"The future belongs to those who learn more skills and combine them in creative ways." - Robert Greene</p>
    <br>
    <p><strong>Easter Egg Unlocked:</strong></p>
    <p>🎮 Hidden Achievement: "Code Breaker"</p>
    <p>📜 Access Code: CORE-2025-ALPHA</p>
    <p>🔗 Secret Link: <a href="https://github.com" style="color: var(--terminal-secondary);">https://github.com</a></p>
    <br>
    <p style="color: var(--terminal-muted); font-size: 12px;">
        "Welcome to the Virtual Core. You have proven yourself worthy.<br>
        Continue your journey in mastering the fundamentals."
    </p>
</div>`;
        
        this.printHTML(secretMessage);
        this.printLine('');
        this.printLine('═'.repeat(60), 'success');
        this.printLine('');
        
        setTimeout(() => {
            this.returnToMain();
        }, 1000);
    }

    vaultFailed() {
        this.printLine('');
        this.printLine('✗ ACCESS DENIED', 'error');
        this.printLine('Incorrect secret word.', 'error');
        this.printLine('');
        this.printLine('Security protocol activated. Returning to main menu...', 'warning');
        this.printLine('');
        
        setTimeout(() => {
            this.returnToMain();
        }, 2000);
    }

    // ===================================
    // NAVIGATION
    // ===================================

    returnToMain() {
        this.state.currentModule = 'main';
        this.printLine('');
        this.printDivider();
        this.printLine('Returning to main menu...', 'info');
        this.printLine('');
        this.showMainMenu();
        this.promptText.textContent = '[V-CORE]>';
        this.terminalInput.placeholder = 'Type command...';
    }
}

// ===================================
// INITIALIZE APPLICATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const virtualCore = new VirtualCore();
    
    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            virtualCore.printLine('');
            virtualCore.printLine('🎮 KONAMI CODE ACTIVATED! 🎮', 'success');
            virtualCore.printLine('Extra credits added to your account!', 'success');
            virtualCore.state.balance += 500;
            virtualCore.updateFooter();
        }
    });
});