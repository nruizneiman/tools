// Text Compare Tool - JavaScript
class TextCompareTool {
    constructor() {
        this.leftEditor = null;
        this.rightEditor = null;
        this.leftLineNumbers = null;
        this.rightLineNumbers = null;
        this.leftGutter = null;
        this.rightGutter = null;
        this.leftContainer = null;
        this.rightContainer = null;
        this.diffResults = [];
        this.currentDiffIndex = -1;
        this.fontSize = 14;
        this.showLineNumbers = true;
        this.showGutter = true;
        this.showInlineDiff = true;
        this.syncScroll = true;
        this.darkMode = false;
        this.showWhitespace = true;
        this.ignoreWhitespace = false;
        this.ignoreCase = false;
        
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
        
        // Create containers for diff highlighting
        this.leftContainer = document.createElement('div');
        this.rightContainer = document.createElement('div');
        this.leftContainer.className = 'editor-lines';
        this.rightContainer.className = 'editor-lines';
        
        // Insert containers inside the editor wrapper, positioned over the textarea
        this.leftEditor.parentNode.appendChild(this.leftContainer);
        this.rightEditor.parentNode.appendChild(this.rightContainer);
        
        // Position containers to overlay only the textarea
        this.updateContainerPosition();
    }

    updateContainerPosition() {
        // Position the diff containers to overlay only the textarea area
        const leftEditorRect = this.leftEditor.getBoundingClientRect();
        const rightEditorRect = this.rightEditor.getBoundingClientRect();
        const leftWrapperRect = this.leftEditor.parentNode.getBoundingClientRect();
        const rightWrapperRect = this.rightEditor.parentNode.getBoundingClientRect();

        // Calculate offset from wrapper to textarea
        const leftOffset = leftEditorRect.left - leftWrapperRect.left;
        const rightOffset = rightEditorRect.left - rightWrapperRect.left;
        const topOffset = leftEditorRect.top - leftWrapperRect.top;

        // Apply positioning
        this.leftContainer.style.position = 'absolute';
        this.leftContainer.style.left = leftOffset + 'px';
        this.leftContainer.style.top = topOffset + 'px';
        this.leftContainer.style.width = leftEditorRect.width + 'px';
        this.leftContainer.style.height = leftEditorRect.height + 'px';

        this.rightContainer.style.position = 'absolute';
        this.rightContainer.style.left = rightOffset + 'px';
        this.rightContainer.style.top = topOffset + 'px';
        this.rightContainer.style.width = rightEditorRect.width + 'px';
        this.rightContainer.style.height = rightEditorRect.height + 'px';
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
                this.leftContainer.scrollTop = this.leftEditor.scrollTop;
                this.leftContainer.scrollLeft = this.leftEditor.scrollLeft;
                this.rightContainer.scrollTop = this.rightEditor.scrollTop;
                this.rightContainer.scrollLeft = this.rightEditor.scrollLeft;
            }
        });

        this.rightEditor.addEventListener('scroll', () => {
            if (this.syncScroll) {
                this.leftEditor.scrollTop = this.rightEditor.scrollTop;
                this.leftEditor.scrollLeft = this.rightEditor.scrollLeft;
                this.leftContainer.scrollTop = this.leftEditor.scrollTop;
                this.leftContainer.scrollLeft = this.leftEditor.scrollLeft;
                this.rightContainer.scrollTop = this.rightEditor.scrollTop;
                this.rightContainer.scrollLeft = this.rightEditor.scrollLeft;
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateContainerPosition(), 100);
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

        // Whitespace controls
        document.getElementById('toggleWhitespace').addEventListener('change', (e) => {
            this.showWhitespace = e.target.checked;
            this.performDiff();
        });

        document.getElementById('ignoreWhitespace').addEventListener('change', (e) => {
            this.ignoreWhitespace = e.target.checked;
            this.performDiff();
        });

        document.getElementById('ignoreCase').addEventListener('change', (e) => {
            this.ignoreCase = e.target.checked;
            this.performDiff();
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
            this.showWhitespace = prefs.showWhitespace !== false;
            this.ignoreWhitespace = prefs.ignoreWhitespace || false;
            this.ignoreCase = prefs.ignoreCase || false;
        }
    }

    savePreferences() {
        const prefs = {
            fontSize: this.fontSize,
            showLineNumbers: this.showLineNumbers,
            showGutter: this.showGutter,
            showInlineDiff: this.showInlineDiff,
            syncScroll: this.syncScroll,
            darkMode: this.darkMode,
            showWhitespace: this.showWhitespace,
            ignoreWhitespace: this.ignoreWhitespace,
            ignoreCase: this.ignoreCase
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
        document.getElementById('toggleWhitespace').checked = this.showWhitespace;
        document.getElementById('ignoreWhitespace').checked = this.ignoreWhitespace;
        document.getElementById('ignoreCase').checked = this.ignoreCase;

        // Update font size
        this.updateFontSize();

        // Update theme
        this.updateTheme();

        // Update line numbers
        this.updateLineNumbers();

        // Update container positions after UI changes
        setTimeout(() => this.updateContainerPosition(), 50);

        this.savePreferences();
    }

    updateFontSize() {
        const editors = [this.leftEditor, this.rightEditor];
        const lineNumberElements = [this.leftLineNumbers, this.rightLineNumbers];
        const containers = [this.leftContainer, this.rightContainer];

        editors.forEach(editor => {
            editor.style.fontSize = `${this.fontSize}px`;
            editor.style.lineHeight = `${this.fontSize + 6}px`;
        });

        lineNumberElements.forEach(lineNumbers => {
            lineNumbers.style.fontSize = `${this.fontSize}px`;
            lineNumbers.style.lineHeight = `${this.fontSize + 6}px`;
        });

        containers.forEach(container => {
            container.style.fontSize = `${this.fontSize}px`;
            container.style.lineHeight = `${this.fontSize + 6}px`;
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

        // Normalize text based on settings
        const leftLines = this.normalizeLines(leftText.split('\n'));
        const rightLines = this.normalizeLines(rightText.split('\n'));
        
        // Perform line-by-line diff
        this.diffResults = this.computeLineDiff(leftLines, rightLines);
        
        // Apply diff highlighting
        this.applyDiffHighlighting();
        
        // Update gutters
        this.updateGutters();
        
        // Update line numbers
        this.updateLineNumbers();
        
        // Update status
        this.updateStatus();
    }

    normalizeLines(lines) {
        return lines.map(line => {
            let normalized = line;
            
            if (this.ignoreCase) {
                normalized = normalized.toLowerCase();
            }
            
            if (this.ignoreWhitespace) {
                normalized = normalized.trim();
            }
            
            return normalized;
        });
    }

    computeLineDiff(leftLines, rightLines) {
        // Use Myers diff algorithm for line-level diffing
        const matrix = this.createDiffMatrix(leftLines, rightLines);
        const path = this.backtrack(matrix, leftLines, rightLines);
        
        return path.map(([op, leftIndex, rightIndex]) => {
            if (op === 'equal') {
                return { 
                    type: 'equal', 
                    leftLine: leftLines[leftIndex], 
                    rightLine: rightLines[rightIndex],
                    leftIndex,
                    rightIndex
                };
            } else if (op === 'delete') {
                return { 
                    type: 'removed', 
                    leftLine: leftLines[leftIndex], 
                    rightLine: null,
                    leftIndex,
                    rightIndex: -1
                };
            } else if (op === 'insert') {
                return { 
                    type: 'added', 
                    leftLine: null, 
                    rightLine: rightLines[rightIndex],
                    leftIndex: -1,
                    rightIndex
                };
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
        // Clear containers
        this.leftContainer.innerHTML = '';
        this.rightContainer.innerHTML = '';
    }

    applyDiffHighlighting() {
        const leftLines = this.leftEditor.value.split('\n');
        const rightLines = this.rightEditor.value.split('\n');

        // Apply diff highlighting to lines
        let leftLineIndex = 0;
        let rightLineIndex = 0;

        this.diffResults.forEach((diff, index) => {
            if (diff.type === 'equal') {
                // For equal lines, add transparent placeholders to maintain line alignment
                const leftLine = this.createLineElement('', 'equal');
                const rightLine = this.createLineElement('', 'equal');
                
                this.leftContainer.appendChild(leftLine);
                this.rightContainer.appendChild(rightLine);
                
                leftLineIndex++;
                rightLineIndex++;
            } else if (diff.type === 'removed') {
                // Add removed line to left container only
                const leftLine = this.createLineElement(leftLines[leftLineIndex], 'removed');
                this.leftContainer.appendChild(leftLine);
                leftLineIndex++;
            } else if (diff.type === 'added') {
                // Add added line to right container only
                const rightLine = this.createLineElement(rightLines[rightLineIndex], 'added');
                this.rightContainer.appendChild(rightLine);
                rightLineIndex++;
            }
        });
    }

    createLineElement(text, type) {
        const lineDiv = document.createElement('div');
        lineDiv.className = `line diff-line ${type}`;
        lineDiv.style.padding = '0 12px';
        lineDiv.style.height = `${this.fontSize + 6}px`;
        lineDiv.style.lineHeight = `${this.fontSize + 6}px`;
        lineDiv.style.fontFamily = 'Consolas, Monaco, Courier New, monospace';
        lineDiv.style.whiteSpace = 'pre';
        
        // For equal lines, make them transparent and don't show text
        if (type === 'equal') {
            lineDiv.style.backgroundColor = 'transparent';
            lineDiv.style.borderLeft = 'none';
            lineDiv.style.color = 'transparent';
            return lineDiv;
        }
        
        if (this.showWhitespace) {
            lineDiv.innerHTML = this.renderWhitespace(text);
        } else {
            lineDiv.textContent = text;
        }

        // Apply inline diff if enabled and line is modified
        if (this.showInlineDiff && type !== 'equal') {
            this.applyInlineDiff(lineDiv, text, type);
        }

        return lineDiv;
    }

    renderWhitespace(text) {
        return text
            .replace(/\t/g, '<span class="whitespace-char tab"></span>')
            .replace(/ /g, '<span class="whitespace-char space"></span>')
            .replace(/([^\s])\s+$/g, '$1<span class="whitespace-char trailing"></span>');
    }

    applyInlineDiff(lineDiv, text, type) {
        // Simple word-level diff for demonstration
        // In a real implementation, you'd use a more sophisticated algorithm
        const words = text.split(/(\s+)/);
        lineDiv.innerHTML = words.map(word => {
            if (/\s/.test(word)) {
                return this.renderWhitespace(word);
            } else {
                return `<span class="diff-word ${type}">${this.escapeHtml(word)}</span>`;
            }
        }).join('');
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
        
        // Update whitespace info
        const whitespaceInfo = document.getElementById('whitespaceInfo');
        if (this.showWhitespace) {
            whitespaceInfo.style.display = 'inline';
        } else {
            whitespaceInfo.style.display = 'none';
        }
    }

    navigateDiff(direction) {
        const diffLines = document.querySelectorAll('.diff-line:not(.equal)');
        
        if (diffLines.length === 0) return;

        // Remove previous highlight
        diffLines.forEach(line => line.classList.remove('current'));

        // Calculate new index
        this.currentDiffIndex += direction;
        if (this.currentDiffIndex >= diffLines.length) {
            this.currentDiffIndex = 0;
        } else if (this.currentDiffIndex < 0) {
            this.currentDiffIndex = diffLines.length - 1;
        }

        // Highlight current diff
        const currentLine = diffLines[this.currentDiffIndex];
        currentLine.classList.add('current');
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