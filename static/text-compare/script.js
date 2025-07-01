// Text Compare Tool - JavaScript
class TextCompareTool {
    constructor() {
        this.leftEditor = null;
        this.rightEditor = null;
        this.leftLineNumbers = null;
        this.rightLineNumbers = null;
        this.leftGutter = null;
        this.rightGutter = null;
        this.diffResults = [];
        this.currentDiffIndex = -1;
        this.fontSize = 14;
        this.showLineNumbers = true;
        this.showGutter = true;
        this.showInlineDiff = true;
        this.syncScroll = true;
        this.darkMode = false;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadPreferences();
        this.loadSampleText();
        this.updateUI();
        this.performDiff();
    }

    setupElements() {
        this.leftEditor = document.getElementById('leftEditor');
        this.rightEditor = document.getElementById('rightEditor');
        this.leftLineNumbers = document.getElementById('leftLineNumbers');
        this.rightLineNumbers = document.getElementById('rightLineNumbers');
        this.leftGutter = document.getElementById('leftGutter');
        this.rightGutter = document.getElementById('rightGutter');
    }

    setupEventListeners() {
        // Editor input events
        this.leftEditor.addEventListener('input', () => this.performDiff());
        this.rightEditor.addEventListener('input', () => this.performDiff());

        // Scroll synchronization
        this.leftEditor.addEventListener('scroll', () => {
            if (this.syncScroll) {
                this.rightEditor.scrollTop = this.leftEditor.scrollTop;
                this.rightEditor.scrollLeft = this.leftEditor.scrollLeft;
            }
        });

        this.rightEditor.addEventListener('scroll', () => {
            if (this.syncScroll) {
                this.leftEditor.scrollTop = this.rightEditor.scrollTop;
                this.leftEditor.scrollLeft = this.rightEditor.scrollLeft;
            }
        });

        // Toolbar controls
        document.getElementById('toggleLineNumbers').addEventListener('change', (e) => {
            this.showLineNumbers = e.target.checked;
            this.updateUI();
        });

        document.getElementById('toggleGutter').addEventListener('change', (e) => {
            this.showGutter = e.target.checked;
            this.updateUI();
        });

        document.getElementById('toggleInlineDiff').addEventListener('change', (e) => {
            this.showInlineDiff = e.target.checked;
            this.performDiff();
        });

        document.getElementById('toggleSyncScroll').addEventListener('change', (e) => {
            this.syncScroll = e.target.checked;
        });

        document.getElementById('toggleDarkMode').addEventListener('change', (e) => {
            this.darkMode = e.target.checked;
            this.updateTheme();
        });

        // Font size controls
        document.getElementById('decreaseFont').addEventListener('click', () => {
            this.fontSize = Math.max(10, this.fontSize - 1);
            this.updateFontSize();
        });

        document.getElementById('increaseFont').addEventListener('click', () => {
            this.fontSize = Math.min(24, this.fontSize + 1);
            this.updateFontSize();
        });

        // Navigation controls
        document.getElementById('prevDiff').addEventListener('click', () => this.navigateDiff(-1));
        document.getElementById('nextDiff').addEventListener('click', () => this.navigateDiff(1));

        // File operations
        document.getElementById('loadLeftFile').addEventListener('click', () => this.loadFile('left'));
        document.getElementById('loadRightFile').addEventListener('click', () => this.loadFile('right'));
        document.getElementById('exportDiff').addEventListener('click', () => this.exportDiff());
        document.getElementById('exportUnified').addEventListener('click', () => this.exportUnified());

        // Fullscreen toggle
        document.getElementById('toggleFullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // File input listeners
        document.getElementById('leftFileInput').addEventListener('change', (e) => this.handleFileLoad(e, 'left'));
        document.getElementById('rightFileInput').addEventListener('change', (e) => this.handleFileLoad(e, 'right'));
    }

    loadPreferences() {
        const saved = localStorage.getItem('textComparePreferences');
        if (saved) {
            const prefs = JSON.parse(saved);
            this.fontSize = prefs.fontSize || 14;
            this.showLineNumbers = prefs.showLineNumbers !== false;
            this.showGutter = prefs.showGutter !== false;
            this.showInlineDiff = prefs.showInlineDiff !== false;
            this.syncScroll = prefs.syncScroll !== false;
            this.darkMode = prefs.darkMode || false;
        }
    }

    savePreferences() {
        const prefs = {
            fontSize: this.fontSize,
            showLineNumbers: this.showLineNumbers,
            showGutter: this.showGutter,
            showInlineDiff: this.showInlineDiff,
            syncScroll: this.syncScroll,
            darkMode: this.darkMode
        };
        localStorage.setItem('textComparePreferences', JSON.stringify(prefs));
    }

    loadSampleText() {
        const sampleLeft = `function calculateSum(a, b) {
    return a + b;
}

function multiply(x, y) {
    return x * y;
}

// This is a comment
const result = calculateSum(5, 3);
console.log(result);`;

        const sampleRight = `function calculateSum(a, b) {
    return a + b;
}

function multiply(x, y) {
    return x * y;
}

function divide(x, y) {
    if (y === 0) {
        throw new Error("Division by zero");
    }
    return x / y;
}

// This is a comment
const result = calculateSum(5, 3);
console.log("The result is: " + result);`;

        this.leftEditor.value = sampleLeft;
        this.rightEditor.value = sampleRight;
    }

    updateUI() {
        // Update line numbers visibility
        this.leftLineNumbers.style.display = this.showLineNumbers ? 'block' : 'none';
        this.rightLineNumbers.style.display = this.showLineNumbers ? 'block' : 'none';

        // Update gutter visibility
        this.leftGutter.style.display = this.showGutter ? 'flex' : 'none';
        this.rightGutter.style.display = this.showGutter ? 'flex' : 'none';

        // Update checkboxes
        document.getElementById('toggleLineNumbers').checked = this.showLineNumbers;
        document.getElementById('toggleGutter').checked = this.showGutter;
        document.getElementById('toggleInlineDiff').checked = this.showInlineDiff;
        document.getElementById('toggleSyncScroll').checked = this.syncScroll;
        document.getElementById('toggleDarkMode').checked = this.darkMode;

        // Update font size
        this.updateFontSize();

        // Update theme
        this.updateTheme();

        // Update line numbers
        this.updateLineNumbers();

        this.savePreferences();
    }

    updateFontSize() {
        const editors = [this.leftEditor, this.rightEditor];
        const lineNumberElements = [this.leftLineNumbers, this.rightLineNumbers];

        editors.forEach(editor => {
            editor.style.fontSize = `${this.fontSize}px`;
            editor.style.lineHeight = `${this.fontSize + 6}px`;
        });

        lineNumberElements.forEach(lineNumbers => {
            lineNumbers.style.fontSize = `${this.fontSize}px`;
            lineNumbers.style.lineHeight = `${this.fontSize + 6}px`;
        });

        document.getElementById('fontSizeDisplay').textContent = this.fontSize;
    }

    updateTheme() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    updateLineNumbers() {
        const leftLines = this.leftEditor.value.split('\n');
        const rightLines = this.rightEditor.value.split('\n');

        this.leftLineNumbers.innerHTML = leftLines.map((_, i) => 
            `<div class="line-number">${i + 1}</div>`
        ).join('');

        this.rightLineNumbers.innerHTML = rightLines.map((_, i) => 
            `<div class="line-number">${i + 1}</div>`
        ).join('');
    }

    performDiff() {
        const leftText = this.leftEditor.value;
        const rightText = this.rightEditor.value;

        // Clear previous diff highlighting
        this.clearDiffHighlighting();

        // Perform line-by-line diff
        const leftLines = leftText.split('\n');
        const rightLines = rightText.split('\n');
        
        this.diffResults = this.computeDiff(leftLines, rightLines);
        
        // Apply diff highlighting
        this.applyDiffHighlighting();
        
        // Update gutters
        this.updateGutters();
        
        // Update line numbers
        this.updateLineNumbers();
        
        // Update status
        this.updateStatus();
    }

    computeDiff(leftLines, rightLines) {
        // Simple Myers diff algorithm implementation
        const matrix = this.createDiffMatrix(leftLines, rightLines);
        const path = this.backtrack(matrix, leftLines, rightLines);
        
        return path.map(([op, leftIndex, rightIndex]) => {
            if (op === 'equal') {
                return { type: 'equal', leftLine: leftLines[leftIndex], rightLine: rightLines[rightIndex] };
            } else if (op === 'delete') {
                return { type: 'removed', leftLine: leftLines[leftIndex], rightLine: null };
            } else if (op === 'insert') {
                return { type: 'added', leftLine: null, rightLine: rightLines[rightIndex] };
            }
        });
    }

    createDiffMatrix(leftLines, rightLines) {
        const m = leftLines.length;
        const n = rightLines.length;
        const matrix = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (leftLines[i - 1] === rightLines[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        return matrix;
    }

    backtrack(matrix, leftLines, rightLines) {
        const path = [];
        let i = leftLines.length;
        let j = rightLines.length;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
                path.unshift(['equal', i - 1, j - 1]);
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                path.unshift(['insert', i, j - 1]);
                j--;
            } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                path.unshift(['delete', i - 1, j]);
                i--;
            }
        }

        return path;
    }

    clearDiffHighlighting() {
        // Remove existing diff classes
        const leftLines = this.leftEditor.value.split('\n');
        const rightLines = this.rightEditor.value.split('\n');

        // Clear line highlighting
        this.leftEditor.innerHTML = leftLines.map(line => 
            `<div class="line">${this.escapeHtml(line)}</div>`
        ).join('');

        this.rightEditor.innerHTML = rightLines.map(line => 
            `<div class="line">${this.escapeHtml(line)}</div>`
        ).join('');
    }

    applyDiffHighlighting() {
        let leftLineIndex = 0;
        let rightLineIndex = 0;

        this.diffResults.forEach((diff, index) => {
            if (diff.type === 'equal') {
                leftLineIndex++;
                rightLineIndex++;
            } else if (diff.type === 'removed') {
                // Highlight removed line in left editor
                const leftLines = this.leftEditor.querySelectorAll('.line');
                if (leftLines[leftLineIndex]) {
                    leftLines[leftLineIndex].classList.add('diff-line', 'removed');
                }
                leftLineIndex++;
            } else if (diff.type === 'added') {
                // Highlight added line in right editor
                const rightLines = this.rightEditor.querySelectorAll('.line');
                if (rightLines[rightLineIndex]) {
                    rightLines[rightLineIndex].classList.add('diff-line', 'added');
                }
                rightLineIndex++;
            }
        });

        // Apply inline diff if enabled
        if (this.showInlineDiff) {
            this.applyInlineDiff();
        }
    }

    applyInlineDiff() {
        // Simple word-level diff for demonstration
        // In a real implementation, you'd use a more sophisticated algorithm
        const leftLines = this.leftEditor.querySelectorAll('.line');
        const rightLines = this.rightEditor.querySelectorAll('.line');

        leftLines.forEach((line, index) => {
            if (line.classList.contains('diff-line')) {
                const text = line.textContent;
                const words = text.split(/(\s+)/);
                line.innerHTML = words.map(word => 
                    `<span class="diff-word removed">${this.escapeHtml(word)}</span>`
                ).join('');
            }
        });

        rightLines.forEach((line, index) => {
            if (line.classList.contains('diff-line')) {
                const text = line.textContent;
                const words = text.split(/(\s+)/);
                line.innerHTML = words.map(word => 
                    `<span class="diff-word added">${this.escapeHtml(word)}</span>`
                ).join('');
            }
        });
    }

    updateGutters() {
        // Clear existing gutters
        this.leftGutter.innerHTML = '';
        this.rightGutter.innerHTML = '';

        let leftLineIndex = 0;
        let rightLineIndex = 0;

        this.diffResults.forEach((diff, index) => {
            if (diff.type === 'equal') {
                leftLineIndex++;
                rightLineIndex++;
            } else if (diff.type === 'removed') {
                // Add marker to left gutter
                const marker = document.createElement('div');
                marker.className = 'gutter-marker removed';
                marker.textContent = '-';
                marker.title = 'Removed line';
                this.leftGutter.appendChild(marker);
                leftLineIndex++;
            } else if (diff.type === 'added') {
                // Add marker to right gutter
                const marker = document.createElement('div');
                marker.className = 'gutter-marker added';
                marker.textContent = '+';
                marker.title = 'Added line';
                this.rightGutter.appendChild(marker);
                rightLineIndex++;
            }
        });
    }

    updateStatus() {
        const leftLines = this.leftEditor.value.split('\n').length;
        const rightLines = this.rightEditor.value.split('\n').length;
        const addedCount = this.diffResults.filter(d => d.type === 'added').length;
        const removedCount = this.diffResults.filter(d => d.type === 'removed').length;

        document.getElementById('leftLineCount').textContent = leftLines;
        document.getElementById('rightLineCount').textContent = rightLines;
        document.getElementById('diffCount').textContent = addedCount + removedCount;
    }

    navigateDiff(direction) {
        const diffLines = [
            ...this.leftEditor.querySelectorAll('.diff-line'),
            ...this.rightEditor.querySelectorAll('.diff-line')
        ];

        if (diffLines.length === 0) return;

        // Remove previous highlight
        diffLines.forEach(line => line.style.backgroundColor = '');

        // Calculate new index
        this.currentDiffIndex += direction;
        if (this.currentDiffIndex >= diffLines.length) {
            this.currentDiffIndex = 0;
        } else if (this.currentDiffIndex < 0) {
            this.currentDiffIndex = diffLines.length - 1;
        }

        // Highlight current diff
        const currentLine = diffLines[this.currentDiffIndex];
        currentLine.style.backgroundColor = 'var(--border-focus)';
        currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    loadFile(side) {
        const input = document.getElementById(side === 'left' ? 'leftFileInput' : 'rightFileInput');
        input.click();
    }

    handleFileLoad(event, side) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const editor = side === 'left' ? this.leftEditor : this.rightEditor;
            editor.value = e.target.result;
            this.performDiff();
        };
        reader.readAsText(file);
    }

    exportDiff() {
        const leftText = this.leftEditor.value;
        const rightText = this.rightEditor.value;
        const leftLines = leftText.split('\n');
        const rightLines = rightText.split('\n');

        let diffOutput = '';
        let leftIndex = 0;
        let rightIndex = 0;

        this.diffResults.forEach((diff, index) => {
            if (diff.type === 'equal') {
                diffOutput += ` ${leftLines[leftIndex]}\n`;
                leftIndex++;
                rightIndex++;
            } else if (diff.type === 'removed') {
                diffOutput += `-${leftLines[leftIndex]}\n`;
                leftIndex++;
            } else if (diff.type === 'added') {
                diffOutput += `+${rightLines[rightIndex]}\n`;
                rightIndex++;
            }
        });

        this.downloadFile(diffOutput, 'diff.txt');
    }

    exportUnified() {
        const leftText = this.leftEditor.value;
        const rightText = this.rightEditor.value;
        const leftLines = leftText.split('\n');
        const rightLines = rightText.split('\n');

        let unifiedOutput = '--- left.txt\n+++ right.txt\n';
        let leftIndex = 0;
        let rightIndex = 0;

        this.diffResults.forEach((diff, index) => {
            if (diff.type === 'equal') {
                unifiedOutput += ` ${leftLines[leftIndex]}\n`;
                leftIndex++;
                rightIndex++;
            } else if (diff.type === 'removed') {
                unifiedOutput += `-${leftLines[leftIndex]}\n`;
                leftIndex++;
            } else if (diff.type === 'added') {
                unifiedOutput += `+${rightLines[rightIndex]}\n`;
                rightIndex++;
            }
        });

        this.downloadFile(unifiedOutput, 'unified.diff');
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    handleKeyboard(event) {
        // Ctrl/Cmd + Enter: Perform diff
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.performDiff();
        }

        // F3: Next diff
        if (event.key === 'F3') {
            event.preventDefault();
            this.navigateDiff(1);
        }

        // Shift + F3: Previous diff
        if (event.shiftKey && event.key === 'F3') {
            event.preventDefault();
            this.navigateDiff(-1);
        }

        // Ctrl/Cmd + S: Export diff
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.exportDiff();
        }

        // F11: Toggle fullscreen
        if (event.key === 'F11') {
            event.preventDefault();
            this.toggleFullscreen();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TextCompareTool();
}); 