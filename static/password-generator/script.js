// Password Generator Tool
class PasswordGenerator {
    constructor() {
        this.passwordHistory = [];
        this.maxHistorySize = 20;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadHistory();
        this.generatePassword();
    }

    setupElements() {
        // Main elements
        this.passwordOutput = document.getElementById('passwordOutput');
        this.copyPasswordBtn = document.getElementById('copyPassword');
        this.generatePasswordBtn = document.getElementById('generatePassword');
        this.generateMultipleBtn = document.getElementById('generateMultiple');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // Configuration elements
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');
        this.uppercaseCheckbox = document.getElementById('uppercase');
        this.lowercaseCheckbox = document.getElementById('lowercase');
        this.numbersCheckbox = document.getElementById('numbers');
        this.symbolsCheckbox = document.getElementById('symbols');
        this.excludeSimilarCheckbox = document.getElementById('excludeSimilar');
        this.excludeAmbiguousCheckbox = document.getElementById('excludeAmbiguous');
        this.requireOneEachCheckbox = document.getElementById('requireOneEach');
        this.customCharsInput = document.getElementById('customChars');
        
        // Strength elements
        this.strengthIndicator = document.getElementById('strengthIndicator');
        this.strengthText = document.getElementById('strengthText');
        
        // History elements
        this.passwordHistoryContainer = document.getElementById('passwordHistory');
        
        // Modal elements
        this.multipleModal = document.getElementById('multipleModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.closeMultipleModalBtn = document.getElementById('closeMultipleModal');
        this.passwordCountInput = document.getElementById('passwordCount');
        this.separatorSelect = document.getElementById('separator');
        this.multiplePasswordsContainer = document.getElementById('multiplePasswords');
        this.copyMultipleBtn = document.getElementById('copyMultiple');
        
        // Notification
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    setupEventListeners() {
        // Password generation
        this.generatePasswordBtn.addEventListener('click', () => this.generatePassword());
        this.generateMultipleBtn.addEventListener('click', () => this.showMultipleModal());
        
        // Copy functionality
        this.copyPasswordBtn.addEventListener('click', () => this.copyPassword());
        this.copyMultipleBtn.addEventListener('click', () => this.copyMultiplePasswords());
        
        // Configuration changes
        this.lengthSlider.addEventListener('input', (e) => {
            this.lengthValue.textContent = e.target.value;
            this.generatePassword();
        });
        
        [this.uppercaseCheckbox, this.lowercaseCheckbox, this.numbersCheckbox, 
         this.symbolsCheckbox, this.excludeSimilarCheckbox, this.excludeAmbiguousCheckbox,
         this.requireOneEachCheckbox, this.customCharsInput].forEach(element => {
            element.addEventListener('change', () => this.generatePassword());
        });
        
        this.customCharsInput.addEventListener('input', () => this.generatePassword());
        
        // Template buttons
        document.querySelectorAll('.btn-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                this.applyTemplate(template);
            });
        });
        
        // History management
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Modal management
        this.closeModalBtn.addEventListener('click', () => this.hideMultipleModal());
        this.closeMultipleModalBtn.addEventListener('click', () => this.hideMultipleModal());
        
        // Close modal on outside click
        this.multipleModal.addEventListener('click', (e) => {
            if (e.target === this.multipleModal) {
                this.hideMultipleModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.generatePassword();
                        break;
                    case 'c':
                        if (this.passwordOutput.value) {
                            e.preventDefault();
                            this.copyPassword();
                        }
                        break;
                }
            }
        });
    }

    generatePassword() {
        const config = this.getConfiguration();
        
        if (!this.isConfigurationValid(config)) {
            this.showNotification('Please select at least one character type', 'error');
            return;
        }
        
        let password = this.generatePasswordFromConfig(config);
        this.passwordOutput.value = password;
        this.updateStrengthIndicator(password);
        this.addToHistory(password);
    }

    getConfiguration() {
        return {
            length: parseInt(this.lengthSlider.value),
            uppercase: this.uppercaseCheckbox.checked,
            lowercase: this.lowercaseCheckbox.checked,
            numbers: this.numbersCheckbox.checked,
            symbols: this.symbolsCheckbox.checked,
            excludeSimilar: this.excludeSimilarCheckbox.checked,
            excludeAmbiguous: this.excludeAmbiguousCheckbox.checked,
            requireOneEach: this.requireOneEachCheckbox.checked,
            customChars: this.customCharsInput.value
        };
    }

    isConfigurationValid(config) {
        return config.uppercase || config.lowercase || config.numbers || config.symbols || config.customChars;
    }

    generatePasswordFromConfig(config) {
        let charset = '';
        
        // Build character set
        if (config.uppercase) {
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (config.lowercase) {
            charset += 'abcdefghijklmnopqrstuvwxyz';
        }
        if (config.numbers) {
            charset += '0123456789';
        }
        if (config.symbols) {
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        if (config.customChars) {
            charset += config.customChars;
        }
        
        // Apply exclusions
        if (config.excludeSimilar) {
            charset = charset.replace(/[l1IO0]/g, '');
        }
        if (config.excludeAmbiguous) {
            charset = charset.replace(/[{}[\]()/\\|`~]/g, '');
        }
        
        if (charset.length === 0) {
            return '';
        }
        
        let password = '';
        
        if (config.requireOneEach) {
            // Ensure at least one character from each selected type
            password = this.generateWithRequiredChars(config);
        } else {
            // Generate random password
            for (let i = 0; i < config.length; i++) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
        }
        
        return password;
    }

    generateWithRequiredChars(config) {
        let password = '';
        let requiredChars = [];
        
        // Collect required characters
        if (config.uppercase) {
            let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (config.excludeSimilar) chars = chars.replace(/[IO]/g, '');
            requiredChars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        if (config.lowercase) {
            let chars = 'abcdefghijklmnopqrstuvwxyz';
            if (config.excludeSimilar) chars = chars.replace(/[l]/g, '');
            requiredChars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        if (config.numbers) {
            let chars = '0123456789';
            if (config.excludeSimilar) chars = chars.replace(/[10]/g, '');
            requiredChars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        if (config.symbols) {
            let chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            if (config.excludeAmbiguous) chars = chars.replace(/[{}[\]()/\\|`~]/g, '');
            requiredChars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        if (config.customChars) {
            requiredChars.push(config.customChars.charAt(Math.floor(Math.random() * config.customChars.length)));
        }
        
        // Build full character set
        let charset = '';
        if (config.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (config.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (config.numbers) charset += '0123456789';
        if (config.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (config.customChars) charset += config.customChars;
        
        // Apply exclusions
        if (config.excludeSimilar) {
            charset = charset.replace(/[l1IO0]/g, '');
        }
        if (config.excludeAmbiguous) {
            charset = charset.replace(/[{}[\]()/\\|`~]/g, '');
        }
        
        // Start with required characters
        password = requiredChars.join('');
        
        // Fill the rest randomly
        for (let i = requiredChars.length; i < config.length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle the password
        return this.shuffleString(password);
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    updateStrengthIndicator(password) {
        const strength = this.calculatePasswordStrength(password);
        
        // Update strength bar
        this.strengthIndicator.className = `strength-fill ${strength.level}`;
        
        // Update strength text
        this.strengthText.textContent = `Strength: ${strength.level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        // Length bonus
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 20) score += 1;
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        // Deductions
        if (password.length < 8) {
            score -= 2;
            feedback.push('Too short');
        }
        
        if (/(.)\1{2,}/.test(password)) {
            score -= 1;
            feedback.push('Repeated characters');
        }
        
        if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
            score -= 2;
            feedback.push('Only one character type');
        }
        
        // Determine level
        let level;
        if (score <= 1) level = 'very-weak';
        else if (score <= 3) level = 'weak';
        else if (score <= 5) level = 'medium';
        else if (score <= 7) level = 'strong';
        else level = 'very-strong';
        
        return { level, score, feedback };
    }

    copyPassword() {
        if (!this.passwordOutput.value) {
            this.showNotification('No password to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(this.passwordOutput.value).then(() => {
            this.showNotification('Password copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            this.passwordOutput.select();
            document.execCommand('copy');
            this.showNotification('Password copied to clipboard!', 'success');
        });
    }

    addToHistory(password) {
        // Remove if already exists
        this.passwordHistory = this.passwordHistory.filter(p => p !== password);
        
        // Add to beginning
        this.passwordHistory.unshift(password);
        
        // Limit history size
        if (this.passwordHistory.length > this.maxHistorySize) {
            this.passwordHistory = this.passwordHistory.slice(0, this.maxHistorySize);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.passwordHistoryContainer.innerHTML = '';
        
        this.passwordHistory.forEach(password => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <span class="history-password">${password}</span>
                <div class="history-actions">
                    <button class="btn-copy-history" onclick="passwordGenerator.copyFromHistory('${password}')">Copy</button>
                </div>
            `;
            
            this.passwordHistoryContainer.appendChild(historyItem);
        });
    }

    copyFromHistory(password) {
        this.passwordOutput.value = password;
        this.updateStrengthIndicator(password);
        this.showNotification('Password loaded from history!', 'success');
    }

    clearHistory() {
        this.passwordHistory = [];
        this.saveHistory();
        this.updateHistoryDisplay();
        this.showNotification('History cleared!', 'success');
    }

    saveHistory() {
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('passwordHistory');
        if (saved) {
            this.passwordHistory = JSON.parse(saved);
            this.updateHistoryDisplay();
        }
    }

    applyTemplate(template) {
        switch (template) {
            case 'strong':
                this.lengthSlider.value = 16;
                this.lengthValue.textContent = '16';
                this.uppercaseCheckbox.checked = true;
                this.lowercaseCheckbox.checked = true;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = true;
                this.excludeSimilarCheckbox.checked = false;
                this.excludeAmbiguousCheckbox.checked = false;
                this.requireOneEachCheckbox.checked = true;
                this.customCharsInput.value = '';
                break;
                
            case 'very-strong':
                this.lengthSlider.value = 32;
                this.lengthValue.textContent = '32';
                this.uppercaseCheckbox.checked = true;
                this.lowercaseCheckbox.checked = true;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = true;
                this.excludeSimilarCheckbox.checked = false;
                this.excludeAmbiguousCheckbox.checked = false;
                this.requireOneEachCheckbox.checked = true;
                this.customCharsInput.value = '';
                break;
                
            case 'memorable':
                this.lengthSlider.value = 20;
                this.lengthValue.textContent = '20';
                this.uppercaseCheckbox.checked = true;
                this.lowercaseCheckbox.checked = true;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = false;
                this.excludeSimilarCheckbox.checked = true;
                this.excludeAmbiguousCheckbox.checked = true;
                this.requireOneEachCheckbox.checked = true;
                this.customCharsInput.value = '';
                break;
                
            case 'pin':
                this.lengthSlider.value = 6;
                this.lengthValue.textContent = '6';
                this.uppercaseCheckbox.checked = false;
                this.lowercaseCheckbox.checked = false;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = false;
                this.excludeSimilarCheckbox.checked = false;
                this.excludeAmbiguousCheckbox.checked = false;
                this.requireOneEachCheckbox.checked = false;
                this.customCharsInput.value = '';
                break;
                
            case 'alphanumeric':
                this.lengthSlider.value = 16;
                this.lengthValue.textContent = '16';
                this.uppercaseCheckbox.checked = true;
                this.lowercaseCheckbox.checked = true;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = false;
                this.excludeSimilarCheckbox.checked = false;
                this.excludeAmbiguousCheckbox.checked = false;
                this.requireOneEachCheckbox.checked = true;
                this.customCharsInput.value = '';
                break;
                
            case 'symbols-heavy':
                this.lengthSlider.value = 16;
                this.lengthValue.textContent = '16';
                this.uppercaseCheckbox.checked = true;
                this.lowercaseCheckbox.checked = true;
                this.numbersCheckbox.checked = true;
                this.symbolsCheckbox.checked = true;
                this.excludeSimilarCheckbox.checked = false;
                this.excludeAmbiguousCheckbox.checked = false;
                this.requireOneEachCheckbox.checked = true;
                this.customCharsInput.value = '!@#$%^&*()_+-=[]{}|;:,.<>?';
                break;
        }
        
        this.generatePassword();
        this.showNotification(`Applied ${template.replace('-', ' ')} template!`, 'success');
    }

    showMultipleModal() {
        this.multipleModal.classList.add('show');
        this.generateMultiplePasswords();
    }

    hideMultipleModal() {
        this.multipleModal.classList.remove('show');
    }

    generateMultiplePasswords() {
        const count = parseInt(this.passwordCountInput.value) || 5;
        const config = this.getConfiguration();
        
        if (!this.isConfigurationValid(config)) {
            this.showNotification('Please select at least one character type', 'error');
            return;
        }
        
        this.multiplePasswordsContainer.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const password = this.generatePasswordFromConfig(config);
            const passwordItem = document.createElement('div');
            passwordItem.className = 'multiple-password-item';
            passwordItem.textContent = password;
            this.multiplePasswordsContainer.appendChild(passwordItem);
        }
    }

    copyMultiplePasswords() {
        const passwords = Array.from(this.multiplePasswordsContainer.children).map(item => item.textContent);
        const separator = this.separatorSelect.value;
        const text = passwords.join(separator);
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('All passwords copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('All passwords copied to clipboard!', 'success');
        });
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the password generator when the page loads
let passwordGenerator;
document.addEventListener('DOMContentLoaded', () => {
    passwordGenerator = new PasswordGenerator();
}); 