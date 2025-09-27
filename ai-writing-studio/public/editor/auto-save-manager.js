// Auto-Save Manager for AI Writing Studio
// Implements debounced saves, periodic saves, and retry logic with exponential backoff

const AutoSaveManager = {
    editor: null,
    saveTimer: null,
    intervalTimer: null,
    retryCount: 0,
    isInitialized: false,
    documentId: null,
    lastSavedVersion: null,
    versionHistory: [],
    hasUnsavedChanges: false,
    lastContent: '',

    // Initialize the auto-save manager
    init: function(editor) {
        if (this.isInitialized) {
            console.warn('AutoSaveManager already initialized');
            return;
        }

        this.editor = editor;
        this.documentId = this.getOrCreateDocumentId();
        this.setupAutoSave();
        this.setupSaveIndicator();
        this.loadVersionHistory();

        this.isInitialized = true;
        console.log('✅ AutoSaveManager initialized with document ID:', this.documentId);
    },

    // Setup auto-save event handlers
    setupAutoSave: function() {
        const editorElement = document.getElementById('editor-content');

        if (!editorElement) {
            console.error('Editor element not found for auto-save setup');
            return;
        }

        // Debounced save on content change (5 seconds of inactivity)
        editorElement.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
            this.showStatus('typing');

            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => {
                this.save();
            }, 5000); // 5 seconds of inactivity
        });

        // Periodic save every 2 minutes
        this.intervalTimer = setInterval(() => {
            if (this.hasUnsavedChanges) {
                console.log('Periodic save triggered (2 minutes)');
                this.save();
            }
        }, 120000); // 2 minutes

        // Save before page unload
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                this.save(); // Try to save
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });

        console.log('Auto-save handlers setup complete');
    },

    // Setup or enhance existing save indicator
    setupSaveIndicator: function() {
        // Check if indicator already exists from editor module
        let indicator = document.getElementById('save-indicator');

        if (!indicator) {
            // Create indicator if it doesn't exist
            const toolbar = document.querySelector('.editor-toolbar');
            if (toolbar) {
                indicator = document.createElement('span');
                indicator.id = 'save-indicator';
                indicator.className = 'save-indicator';
                toolbar.appendChild(indicator);
            }
        }
    },

    // Main save function with server persistence
    save: async function() {
        const editorElement = document.getElementById('editor-content');
        if (!editorElement) {
            console.error('Cannot save: editor element not found');
            return;
        }

        const content = editorElement.innerHTML;

        // Skip if content hasn't changed
        if (content === this.lastContent) {
            console.log('No changes detected, skipping save');
            this.hasUnsavedChanges = false;
            return;
        }

        this.showStatus('saving');

        const document = {
            documentId: this.documentId,
            content: content,
            timestamp: Date.now(),
            version: this.getNextVersion(),
            wordCount: this.getWordCount(content)
        };

        try {
            // Save to server
            const response = await fetch('/api/documents/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(document)
            });

            if (response.ok) {
                const result = await response.json();

                // Save successful
                this.lastContent = content;
                this.lastSavedVersion = document.version;
                this.hasUnsavedChanges = false;

                // Backup to localStorage
                this.saveToLocalStorage(document);

                // Update version history
                this.updateVersionHistory(document);

                // Reset retry count
                this.retryCount = 0;

                this.showStatus('saved');
                console.log(`Document saved successfully (v${document.version}, ${document.wordCount} words)`);
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.handleSaveError(error, document);
        }
    },

    // Handle save errors with exponential backoff retry
    handleSaveError: function(error, document) {
        this.showStatus('failed');
        console.error('Save failed:', error);

        // Always try to save to localStorage as backup
        this.saveToLocalStorage(document);
        console.log('Document backed up to localStorage');

        // Exponential backoff retry (max 3 retries)
        if (this.retryCount < 3) {
            const delay = Math.pow(2, this.retryCount) * 1000; // 1s, 2s, 4s
            this.retryCount++;

            console.log(`Retrying save in ${delay/1000} seconds (attempt ${this.retryCount}/3)`);
            this.showStatus('retrying');

            setTimeout(() => {
                this.save();
            }, delay);
        } else {
            // Max retries reached
            this.notifyUserOfFailure();
            this.retryCount = 0; // Reset for next save attempt
        }
    },

    // Notify user of persistent save failure
    notifyUserOfFailure: function() {
        this.showStatus('failed-persistent');
        console.error('Failed to save after 3 retries. Document is backed up in localStorage.');

        // Create or update error message
        let errorMsg = document.querySelector('.save-error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'save-error-message';
            document.body.appendChild(errorMsg);
        }

        errorMsg.innerHTML = `
            <strong>⚠️ Save Failed</strong><br>
            Your document is safely backed up locally.<br>
            Please check your connection and try saving manually (Ctrl+S).
        `;

        // Hide after 10 seconds
        setTimeout(() => {
            if (errorMsg) {
                errorMsg.remove();
            }
        }, 10000);
    },

    // Show save status in UI
    showStatus: function(status) {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;

        const messages = {
            typing: '...',
            saving: 'Saving...',
            saved: `Saved ${new Date().toLocaleTimeString()}`,
            failed: 'Failed to save',
            retrying: 'Retrying save...',
            'failed-persistent': '⚠️ Save failed - backed up locally'
        };

        indicator.textContent = messages[status] || '';
        indicator.className = `save-indicator save-${status}`;

        // Auto-hide success message after 3 seconds
        if (status === 'saved') {
            setTimeout(() => {
                if (indicator.className.includes('save-saved')) {
                    indicator.textContent = '';
                    indicator.className = 'save-indicator';
                }
            }, 3000);
        }
    },

    // Save to localStorage as backup
    saveToLocalStorage: function(document) {
        try {
            const key = `autosave_${this.documentId}`;
            const backupData = {
                ...document,
                isBackup: true,
                backupTime: new Date().toISOString()
            };

            localStorage.setItem(key, JSON.stringify(backupData));

            // Also save to the editor's standard storage for compatibility
            localStorage.setItem('editor_document', JSON.stringify({
                content: document.content,
                lastSaved: new Date().toISOString(),
                wordCount: document.wordCount,
                version: document.version
            }));
        } catch (error) {
            console.error('Failed to save backup to localStorage:', error);
        }
    },

    // Load document from localStorage if needed
    loadFromLocalStorage: function() {
        try {
            const key = `autosave_${this.documentId}`;
            const saved = localStorage.getItem(key);

            if (saved) {
                const document = JSON.parse(saved);
                console.log('Loaded backup from localStorage:', {
                    version: document.version,
                    backupTime: document.backupTime
                });
                return document;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        return null;
    },

    // Update version history (keep last 10 versions)
    updateVersionHistory: function(document) {
        this.versionHistory.push({
            version: document.version,
            timestamp: document.timestamp,
            wordCount: document.wordCount,
            savedAt: new Date().toISOString()
        });

        // Keep only last 10 versions
        if (this.versionHistory.length > 10) {
            this.versionHistory.shift();
        }

        // Save version history to localStorage
        try {
            localStorage.setItem(`version_history_${this.documentId}`,
                JSON.stringify(this.versionHistory));
        } catch (error) {
            console.error('Failed to save version history:', error);
        }
    },

    // Load version history from localStorage
    loadVersionHistory: function() {
        try {
            const saved = localStorage.getItem(`version_history_${this.documentId}`);
            if (saved) {
                this.versionHistory = JSON.parse(saved);
                console.log(`Loaded ${this.versionHistory.length} versions from history`);
            }
        } catch (error) {
            console.error('Failed to load version history:', error);
            this.versionHistory = [];
        }
    },

    // Get or create document ID
    getOrCreateDocumentId: function() {
        let id = localStorage.getItem('current_document_id');

        if (!id) {
            id = this.generateId();
            localStorage.setItem('current_document_id', id);
        }

        return id;
    },

    // Generate unique document ID
    generateId: function() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get next version number
    getNextVersion: function() {
        if (this.versionHistory.length > 0) {
            const lastVersion = this.versionHistory[this.versionHistory.length - 1].version;
            return lastVersion + 1;
        }
        return 1;
    },

    // Get word count from HTML content
    getWordCount: function(html) {
        const text = html.replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
        return text ? text.split(' ').length : 0;
    },

    // Check if there are unsaved changes
    hasUnsavedChanges: function() {
        return this.hasUnsavedChanges;
    },

    // Get version history
    getVersionHistory: function() {
        return this.versionHistory;
    },

    // Manual save trigger
    saveNow: function() {
        console.log('Manual save triggered');
        clearTimeout(this.saveTimer);
        this.save();
    },

    // Cleanup and destroy
    destroy: function() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }

        // Final save if there are unsaved changes
        if (this.hasUnsavedChanges) {
            this.save();
        }

        this.editor = null;
        this.isInitialized = false;
        console.log('AutoSaveManager destroyed');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoSaveManager;
}