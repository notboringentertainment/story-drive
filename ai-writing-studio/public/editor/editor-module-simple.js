// Simple Rich Text Editor Module - No External Dependencies
// Uses contentEditable with document.execCommand for vanilla JS compatibility

const EditorModule = {
    editor: null,
    container: null,
    saveTimeout: null,
    isInitialized: false,

    // Feature flag check
    isEnabled: function() {
        const featureFlag = localStorage.getItem('ENABLE_DOCUMENT_EDITOR');
        return featureFlag === 'true';
    },

    // Initialize the editor module
    init: function(containerId) {
        if (!this.isEnabled()) {
            console.log('Document editor is not enabled. Set ENABLE_DOCUMENT_EDITOR=true to activate.');
            return false;
        }

        if (this.isInitialized) {
            console.warn('Editor module already initialized');
            return false;
        }

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Editor container not found:', containerId);
            return false;
        }

        // Create editor wrapper structure
        this.container.innerHTML = `
            <div class="editor-wrapper">
                <div class="editor-toolbar" id="editor-toolbar">
                    <button type="button" data-command="bold" class="toolbar-btn" title="Bold (Ctrl+B)">
                        <strong>B</strong>
                    </button>
                    <button type="button" data-command="italic" class="toolbar-btn" title="Italic (Ctrl+I)">
                        <em>I</em>
                    </button>
                    <span class="toolbar-separator">|</span>
                    <button type="button" data-command="formatBlock:h1" class="toolbar-btn" title="Heading 1">
                        H1
                    </button>
                    <button type="button" data-command="formatBlock:h2" class="toolbar-btn" title="Heading 2">
                        H2
                    </button>
                    <button type="button" data-command="formatBlock:h3" class="toolbar-btn" title="Heading 3">
                        H3
                    </button>
                    <button type="button" data-command="formatBlock:p" class="toolbar-btn" title="Paragraph">
                        P
                    </button>
                    <span class="toolbar-separator">|</span>
                    <button type="button" data-command="insertUnorderedList" class="toolbar-btn" title="Bullet List">
                        • —
                    </button>
                    <button type="button" data-command="insertOrderedList" class="toolbar-btn" title="Numbered List">
                        1. —
                    </button>
                    <span class="save-indicator" id="save-indicator"></span>
                </div>
                <div class="editor-content" id="editor-content" contenteditable="true">
                    <p>Start writing your story...</p>
                </div>
            </div>
        `;

        this.editor = document.getElementById('editor-content');

        if (!this.editor) {
            console.error('Editor content element not found!');
            return false;
        }

        console.log('Editor element found:', this.editor);

        // Setup event handlers
        this.setupToolbar();
        this.setupEditor();

        // Don't load saved content - start fresh each time
        // this.loadFromStorage();

        // Initialize AutoSaveManager if available
        if (typeof AutoSaveManager !== 'undefined') {
            AutoSaveManager.init(this);
            console.log('✅ AutoSaveManager initialized');
        } else {
            console.log('AutoSaveManager not loaded, using basic save functionality');
        }

        this.isInitialized = true;
        console.log('✅ Editor module initialized (simple mode)');
        console.log('Editor element reference:', this.editor);
        return true;
    },

    // Setup toolbar button event handlers
    setupToolbar: function() {
        const toolbar = document.getElementById('editor-toolbar');

        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;

            e.preventDefault();
            const command = btn.dataset.command;
            this.executeCommand(command);
        });
    },

    // Setup editor event handlers
    setupEditor: function() {
        // Handle input for auto-save
        this.editor.addEventListener('input', () => {
            this.handleUpdate();
        });

        // Handle keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B for bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.executeCommand('bold');
            }
            // Ctrl/Cmd + I for italic
            else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.executeCommand('italic');
            }
            // Ctrl/Cmd + S for save
            else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Use AutoSaveManager if available, otherwise fallback to basic save
                if (typeof AutoSaveManager !== 'undefined' && AutoSaveManager.isInitialized) {
                    AutoSaveManager.saveNow();
                } else {
                    this.saveToStorage(this.editor.innerHTML);
                }
            }
        });

        // Update toolbar on selection change
        document.addEventListener('selectionchange', () => {
            if (this.editor && this.editor.contains(window.getSelection().anchorNode)) {
                this.updateToolbarState();
            }
        });
    },

    // Execute editor commands
    executeCommand: function(command) {
        this.editor.focus();

        if (command.includes(':')) {
            // Handle commands with parameters (e.g., formatBlock:h1)
            const [cmd, param] = command.split(':');
            document.execCommand(cmd, false, param);
        } else {
            // Simple commands
            document.execCommand(command, false, null);
        }

        this.updateToolbarState();
        this.handleUpdate();
    },

    // Update toolbar button active states
    updateToolbarState: function() {
        const buttons = document.querySelectorAll('.toolbar-btn');

        buttons.forEach(btn => {
            const command = btn.dataset.command;
            let isActive = false;

            if (command === 'bold') {
                isActive = document.queryCommandState('bold');
            } else if (command === 'italic') {
                isActive = document.queryCommandState('italic');
            } else if (command === 'insertUnorderedList') {
                isActive = document.queryCommandState('insertUnorderedList');
            } else if (command === 'insertOrderedList') {
                isActive = document.queryCommandState('insertOrderedList');
            } else if (command.startsWith('formatBlock:')) {
                const format = command.split(':')[1];
                const block = this.getParentBlockElement();
                isActive = block && block.tagName.toLowerCase() === format;
            }

            btn.classList.toggle('active', isActive);
        });
    },

    // Get parent block element of selection
    getParentBlockElement: function() {
        const selection = window.getSelection();
        if (!selection.anchorNode) return null;

        let node = selection.anchorNode;
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        while (node && node !== this.editor) {
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'].includes(node.tagName)) {
                return node;
            }
            node = node.parentNode;
        }

        return null;
    },

    // Handle content updates with debounced save
    handleUpdate: function() {
        // If AutoSaveManager is active, let it handle the save
        if (typeof AutoSaveManager !== 'undefined' && AutoSaveManager.isInitialized) {
            // AutoSaveManager will handle all save logic
            return;
        }

        // Fallback to basic save functionality
        // Show saving indicator
        this.showSaveIndicator('saving');

        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Debounce save (500ms as per requirements)
        this.saveTimeout = setTimeout(() => {
            this.saveToStorage(this.editor.innerHTML);
        }, 500);
    },

    // Save content to localStorage
    saveToStorage: function(content) {
        try {
            const documentData = {
                content: content,
                lastSaved: new Date().toISOString(),
                wordCount: this.getWordCount(content),
                version: 1
            };

            localStorage.setItem('editor_document', JSON.stringify(documentData));
            this.showSaveIndicator('saved');

            console.log('Document saved:', {
                wordCount: documentData.wordCount,
                timestamp: documentData.lastSaved
            });
        } catch (error) {
            console.error('Failed to save document:', error);
            this.showSaveIndicator('error');
        }
    },

    // Load content from localStorage
    loadFromStorage: function() {
        try {
            const saved = localStorage.getItem('editor_document');
            if (saved && this.editor) {
                const documentData = JSON.parse(saved);
                this.editor.innerHTML = documentData.content;
                console.log('Document loaded from storage');
                return documentData.content;
            }
        } catch (error) {
            console.error('Failed to load document:', error);
        }
        return '';
    },

    // Show save status indicator
    showSaveIndicator: function(status) {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;

        switch(status) {
            case 'saving':
                indicator.textContent = 'Saving...';
                indicator.className = 'save-indicator saving';
                break;
            case 'saved':
                indicator.textContent = 'Saved';
                indicator.className = 'save-indicator saved';
                setTimeout(() => {
                    indicator.textContent = '';
                }, 2000);
                break;
            case 'error':
                indicator.textContent = 'Save failed';
                indicator.className = 'save-indicator error';
                break;
        }
    },

    // Get word count from HTML content
    getWordCount: function(html) {
        const text = html.replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
        return text ? text.split(' ').length : 0;
    },

    // Get current document content
    getContent: function() {
        if (!this.editor) {
            console.log('Editor element not found');
            return null;
        }
        const text = this.editor.innerText || this.editor.textContent || '';
        console.log('Getting content from editor:', text.substring(0, 50) + '...');
        return {
            html: this.editor.innerHTML,
            text: text,
            wordCount: this.getWordCount(this.editor.innerHTML)
        };
    },

    // Get selected text for context
    getSelectedText: function() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        console.log('Selected text:', selectedText); // Debug log
        return selectedText;
    },

    // Get current paragraph for context
    getCurrentParagraph: function() {
        // ALWAYS get from the editor content, not from selection
        if (!this.editor) {
            console.log('Editor not found');
            return '';
        }

        // Get all the text from the editor
        const fullText = this.editor.innerText || this.editor.textContent || '';
        console.log('Getting paragraph from editor:', fullText);

        // Return the full text if it's short, or the first paragraph
        if (fullText.length <= 200) {
            return fullText;
        }

        // If longer, try to get just the first paragraph
        const firstPara = this.editor.querySelector('p');
        if (firstPara) {
            return firstPara.innerText || firstPara.textContent || fullText.substring(0, 200);
        }

        return fullText.substring(0, 200);
    },

    // Cleanup and destroy editor
    destroy: function() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        // Destroy AutoSaveManager if it's running
        if (typeof AutoSaveManager !== 'undefined' && AutoSaveManager.isInitialized) {
            AutoSaveManager.destroy();
        }
        if (this.editor) {
            this.editor.contentEditable = false;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.editor = null;
        this.isInitialized = false;
        console.log('Editor module destroyed');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditorModule;
}