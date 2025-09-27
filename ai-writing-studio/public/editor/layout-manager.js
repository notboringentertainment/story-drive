// Layout Manager Module - Handles side-by-side layout for editor and chat
// Following existing modular JavaScript pattern

const LayoutManager = {
    divider: null,
    editorPanel: null,
    chatPanel: null,
    container: null,
    isResizing: false,
    minPanelSize: 30, // minimum 30% width
    maxPanelSize: 70, // maximum 70% width
    isMobile: false,
    isInitialized: false,

    // Initialize the layout manager
    init: function(containerId) {
        if (this.isInitialized) {
            console.warn('LayoutManager already initialized');
            return false;
        }

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Layout container not found:', containerId);
            return false;
        }

        // Check for mobile
        this.checkMobile();

        // Setup layout structure
        this.setupLayout();

        // Setup event handlers
        this.setupEventHandlers();

        // Restore saved layout
        this.restoreLayout();

        // Listen for window resize
        this.setupResponsive();

        this.isInitialized = true;
        console.log('✅ LayoutManager initialized');
        return true;
    },

    // Check if mobile device
    checkMobile: function() {
        this.isMobile = window.innerWidth < 768;
    },

    // Setup the layout HTML structure
    setupLayout: function() {
        // Get existing content
        const existingContent = this.container.innerHTML;

        // Create new layout structure
        this.container.innerHTML = `
            <div class="app-layout ${this.isMobile ? 'mobile' : 'desktop'}" id="app-layout">
                <div class="editor-panel" id="editor-panel">
                    <div class="panel-header">
                        <h3>Document Editor</h3>
                        <span class="panel-controls">
                            <button onclick="LayoutManager.toggleFullscreen('editor')" title="Fullscreen">⛶</button>
                        </span>
                    </div>
                    <div class="panel-content" id="editor-content-wrapper">
                        <!-- Editor will be initialized here -->
                    </div>
                </div>

                <div class="layout-divider" id="layout-divider">
                    <div class="divider-handle"></div>
                </div>

                <div class="chat-panel" id="chat-panel">
                    <div class="panel-header">
                        <h3>AI Agents</h3>
                        <span class="panel-controls">
                            <button onclick="LayoutManager.toggleFullscreen('chat')" title="Fullscreen">⛶</button>
                        </span>
                    </div>
                    <div class="panel-content" id="chat-content-wrapper">
                        ${existingContent}
                    </div>
                </div>
            </div>
        `;

        // Store references
        this.editorPanel = document.getElementById('editor-panel');
        this.chatPanel = document.getElementById('chat-panel');
        this.divider = document.getElementById('layout-divider');

        // Hide divider on mobile
        if (this.isMobile) {
            this.divider.style.display = 'none';
        }
    },

    // Setup event handlers for dragging
    setupEventHandlers: function() {
        if (!this.divider || this.isMobile) return;

        // Mouse events for desktop
        this.divider.addEventListener('mousedown', this.startResize.bind(this));
        document.addEventListener('mousemove', this.doResize.bind(this));
        document.addEventListener('mouseup', this.stopResize.bind(this));

        // Touch events for tablets
        this.divider.addEventListener('touchstart', this.startResize.bind(this), { passive: false });
        document.addEventListener('touchmove', this.doResize.bind(this), { passive: false });
        document.addEventListener('touchend', this.stopResize.bind(this));
    },

    // Start resizing
    startResize: function(e) {
        e.preventDefault();
        this.isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        // Add active class for visual feedback
        this.divider.classList.add('active');
    },

    // Do resize
    doResize: function(e) {
        if (!this.isResizing) return;

        e.preventDefault();

        // Get mouse/touch position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!clientX) return;

        // Calculate new widths
        const containerWidth = this.container.offsetWidth;
        const leftWidth = (clientX / containerWidth) * 100;
        const rightWidth = 100 - leftWidth;

        // Apply constraints
        if (leftWidth >= this.minPanelSize && leftWidth <= this.maxPanelSize) {
            this.editorPanel.style.flex = `0 0 ${leftWidth}%`;
            this.chatPanel.style.flex = `0 0 ${rightWidth}%`;

            // Save to localStorage
            this.saveLayout(leftWidth);
        }
    },

    // Stop resizing
    stopResize: function(e) {
        if (!this.isResizing) return;

        this.isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Remove active class
        if (this.divider) {
            this.divider.classList.remove('active');
        }
    },

    // Save layout to localStorage
    saveLayout: function(editorWidth) {
        try {
            const layoutData = {
                editorWidth: editorWidth,
                chatWidth: 100 - editorWidth,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('layout_preferences', JSON.stringify(layoutData));
        } catch (error) {
            console.error('Failed to save layout:', error);
        }
    },

    // Restore layout from localStorage
    restoreLayout: function() {
        if (this.isMobile) return;

        try {
            const saved = localStorage.getItem('layout_preferences');
            if (saved) {
                const layoutData = JSON.parse(saved);
                if (layoutData.editorWidth) {
                    this.editorPanel.style.flex = `0 0 ${layoutData.editorWidth}%`;
                    this.chatPanel.style.flex = `0 0 ${layoutData.chatWidth}%`;
                    console.log('Layout restored:', layoutData);
                }
            } else {
                // Set default 60/40 split
                this.editorPanel.style.flex = '0 0 60%';
                this.chatPanel.style.flex = '0 0 40%';
            }
        } catch (error) {
            console.error('Failed to restore layout:', error);
            // Set default on error
            this.editorPanel.style.flex = '0 0 60%';
            this.chatPanel.style.flex = '0 0 40%';
        }
    },

    // Setup responsive behavior
    setupResponsive: function() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.checkMobile();

                // If switched between mobile/desktop, update layout
                if (wasMobile !== this.isMobile) {
                    this.updateResponsiveLayout();
                }
            }, 250);
        });
    },

    // Update layout for responsive changes
    updateResponsiveLayout: function() {
        const layout = document.getElementById('app-layout');

        if (this.isMobile) {
            layout.classList.add('mobile');
            layout.classList.remove('desktop');
            this.divider.style.display = 'none';

            // Reset flex values for mobile
            this.editorPanel.style.flex = '';
            this.chatPanel.style.flex = '';
        } else {
            layout.classList.add('desktop');
            layout.classList.remove('mobile');
            this.divider.style.display = '';

            // Restore saved layout
            this.restoreLayout();
        }
    },

    // Toggle fullscreen for a panel
    toggleFullscreen: function(panel) {
        const layout = document.getElementById('app-layout');

        if (panel === 'editor') {
            layout.classList.toggle('editor-fullscreen');
            if (layout.classList.contains('editor-fullscreen')) {
                this.chatPanel.style.display = 'none';
                this.divider.style.display = 'none';
                this.editorPanel.style.flex = '1 1 100%';
            } else {
                this.chatPanel.style.display = '';
                this.divider.style.display = this.isMobile ? 'none' : '';
                this.restoreLayout();
            }
        } else if (panel === 'chat') {
            layout.classList.toggle('chat-fullscreen');
            if (layout.classList.contains('chat-fullscreen')) {
                this.editorPanel.style.display = 'none';
                this.divider.style.display = 'none';
                this.chatPanel.style.flex = '1 1 100%';
            } else {
                this.editorPanel.style.display = '';
                this.divider.style.display = this.isMobile ? 'none' : '';
                this.restoreLayout();
            }
        }
    },

    // Get current layout state
    getLayoutState: function() {
        return {
            isMobile: this.isMobile,
            editorWidth: this.editorPanel ? parseFloat(this.editorPanel.style.flex.match(/\d+/)) : 60,
            chatWidth: this.chatPanel ? parseFloat(this.chatPanel.style.flex.match(/\d+/)) : 40,
            isInitialized: this.isInitialized
        };
    },

    // Destroy layout manager
    destroy: function() {
        // Remove event listeners
        if (this.divider) {
            this.divider.removeEventListener('mousedown', this.startResize);
        }
        document.removeEventListener('mousemove', this.doResize);
        document.removeEventListener('mouseup', this.stopResize);

        // Reset container
        if (this.container) {
            // Move chat content back to container
            const chatContent = document.getElementById('chat-content-wrapper');
            if (chatContent) {
                this.container.innerHTML = chatContent.innerHTML;
            }
        }

        this.isInitialized = false;
        console.log('LayoutManager destroyed');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutManager;
}