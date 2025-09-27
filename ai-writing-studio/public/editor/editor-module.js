// Editor Module - Following existing modular pattern from the application
// Uses TipTap v2 browser-compatible build without build tools

const EditorModule = {
    editor: null,
    container: null,
    saveTimeout: null,
    isInitialized: false,

    // Feature flag check
    isEnabled: function() {
        // Check localStorage or global config for feature flag
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
                    <button type="button" data-command="heading1" class="toolbar-btn" title="Heading 1">
                        H1
                    </button>
                    <button type="button" data-command="heading2" class="toolbar-btn" title="Heading 2">
                        H2
                    </button>
                    <button type="button" data-command="heading3" class="toolbar-btn" title="Heading 3">
                        H3
                    </button>
                    <span class="toolbar-separator">|</span>
                    <button type="button" data-command="bulletList" class="toolbar-btn" title="Bullet List">
                        • —
                    </button>
                    <button type="button" data-command="orderedList" class="toolbar-btn" title="Numbered List">
                        1. —
                    </button>
                    <span class="save-indicator" id="save-indicator"></span>
                </div>
                <div class="editor-content" id="editor-content"></div>
            </div>
        `;

        // Initialize TipTap editor
        this.initTipTap();

        // Setup toolbar event handlers
        this.setupToolbar();

        // Load saved content
        this.loadFromStorage();

        this.isInitialized = true;
        console.log('✅ Editor module initialized');
        return true;
    },

    // Initialize TipTap editor instance
    initTipTap: function() {
        // Check if TipTap is available
        if (typeof window.Editor === 'undefined') {
            console.error('TipTap Editor not loaded. Please include TipTap scripts.');
            return;
        }

        // Use the simpler StarterKit if available, otherwise use individual extensions
        let extensions = [];

        if (window.TipTapCore && window.TipTapCore.StarterKit) {
            // Use StarterKit which includes most common extensions
            extensions = [
                window.TipTapCore.StarterKit.configure({
                    heading: {
                        levels: [1, 2, 3]
                    }
                })
            ];
        } else if (window.TipTapCore) {
            // Fallback to individual extensions
            const { Document, Paragraph, Text, Bold, Italic, Heading, BulletList, OrderedList, ListItem } = window.TipTapCore;
            extensions = [
                Document,
                Paragraph,
                Text,
                Bold,
                Italic,
                Heading.configure({
                    levels: [1, 2, 3]
                }),
                BulletList,
                OrderedList,
                ListItem
            ];
        } else {
            console.error('TipTap extensions not found');
            return;
        }

        // Create editor instance
        this.editor = new window.Editor({
            element: document.getElementById('editor-content'),
            extensions: extensions,
            content: '',
            autofocus: 'end',
            editable: true,
            onUpdate: ({ editor }) => {
                this.handleUpdate(editor);
            }
        });
    },

    // Setup toolbar button event handlers
    setupToolbar: function() {
        const buttons = document.querySelectorAll('.toolbar-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.executeCommand(command);
            });
        });
    },

    // Execute editor commands
    executeCommand: function(command) {
        if (!this.editor) return;

        switch(command) {
            case 'bold':
                this.editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                this.editor.chain().focus().toggleItalic().run();
                break;
            case 'heading1':
                this.editor.chain().focus().toggleHeading({ level: 1 }).run();
                break;
            case 'heading2':
                this.editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case 'heading3':
                this.editor.chain().focus().toggleHeading({ level: 3 }).run();
                break;
            case 'bulletList':
                this.editor.chain().focus().toggleBulletList().run();
                break;
            case 'orderedList':
                this.editor.chain().focus().toggleOrderedList().run();
                break;
        }

        // Update toolbar button states
        this.updateToolbarState();
    },

    // Update toolbar button active states
    updateToolbarState: function() {
        if (!this.editor) return;

        const buttons = document.querySelectorAll('.toolbar-btn');
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            let isActive = false;

            switch(command) {
                case 'bold':
                    isActive = this.editor.isActive('bold');
                    break;
                case 'italic':
                    isActive = this.editor.isActive('italic');
                    break;
                case 'heading1':
                    isActive = this.editor.isActive('heading', { level: 1 });
                    break;
                case 'heading2':
                    isActive = this.editor.isActive('heading', { level: 2 });
                    break;
                case 'heading3':
                    isActive = this.editor.isActive('heading', { level: 3 });
                    break;
                case 'bulletList':
                    isActive = this.editor.isActive('bulletList');
                    break;
                case 'orderedList':
                    isActive = this.editor.isActive('orderedList');
                    break;
            }

            btn.classList.toggle('active', isActive);
        });
    },

    // Handle content updates with debounced save
    handleUpdate: function(editor) {
        // Update toolbar state
        this.updateToolbarState();

        // Show saving indicator
        this.showSaveIndicator('saving');

        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Debounce save (500ms as per requirements)
        this.saveTimeout = setTimeout(() => {
            this.saveToStorage(editor.getHTML());
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

            // Log for debugging
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
                this.editor.commands.setContent(documentData.content);
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
        if (!this.editor) return null;
        return {
            html: this.editor.getHTML(),
            text: this.editor.getText(),
            json: this.editor.getJSON()
        };
    },

    // Get selected text for context
    getSelectedText: function() {
        if (!this.editor) return '';
        const { from, to } = this.editor.state.selection;
        const selectedText = this.editor.state.doc.textBetween(from, to, ' ');
        return selectedText;
    },

    // Get current paragraph for context
    getCurrentParagraph: function() {
        if (!this.editor) return '';

        const { $from } = this.editor.state.selection;
        const paragraph = $from.parent;
        return paragraph.textContent || '';
    },

    // Cleanup and destroy editor
    destroy: function() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
        console.log('Editor module destroyed');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditorModule;
}