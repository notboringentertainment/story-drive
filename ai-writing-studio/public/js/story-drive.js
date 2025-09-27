// Story-Drive Professional UI - Epic 3 Implementation
// Core functionality for the three-panel layout with AI agent integration

class StoryDriveApp {
    constructor() {
        this.agents = [
            { id: 'plot', name: 'Plot Doctor', role: 'Story Structure', icon: '📊', color: 'var(--agent-plot)', active: true },
            { id: 'character', name: 'Character Coach', role: 'Character Development', icon: '👥', color: 'var(--agent-character)', active: true },
            { id: 'world', name: 'World Builder', role: 'Setting & Atmosphere', icon: '🌍', color: 'var(--agent-world)', active: true },
            { id: 'dialog', name: 'Dialog Director', role: 'Dialogue & Voice', icon: '💬', color: 'var(--agent-dialog)', active: true },
            { id: 'genre', name: 'Genre Guide', role: 'Genre Conventions', icon: '🎭', color: 'var(--agent-genre)', active: false },
            { id: 'editor', name: 'Editor', role: 'Structure & Flow', icon: '✏️', color: 'var(--agent-editor)', active: true },
            { id: 'reader', name: 'Reader', role: 'Audience Perspective', icon: '👁️', color: 'var(--agent-reader)', active: false },
            { id: 'narrative', name: 'Narrative', role: 'Storytelling', icon: '📖', color: 'var(--agent-narrative)', active: true }
        ];

        this.selectedAgent = null;
        this.selectedText = '';
        this.contextBroadcastTimer = null;
        this.smartReplaceActive = false;
        this.currentContext = '';
        this.sessionId = `session-${Date.now()}`;

        this.init();
    }

    init() {
        this.setupAgentPanel();
        this.setupEditorPanel();
        this.setupChatPanel();
        this.setupResizeHandles();
        this.setupSmartTextReplace();
        this.setupKeyboardNavigation();
        this.setupContextBroadcasting();
    }

    // Agent Panel Functions
    setupAgentPanel() {
        const agentList = document.getElementById('agentList');
        if (!agentList) return;

        agentList.innerHTML = '';

        this.agents.forEach((agent, index) => {
            const card = this.createAgentCard(agent, index);
            agentList.appendChild(card);
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAgents(e.target.value));
        }

        // Collapsible chat area (below agent list)
        this.setupAgentChatArea();
    }

    createAgentCard(agent, index) {
        const card = document.createElement('div');
        card.className = `agent-card ${index === 0 ? 'active' : ''}`;
        card.dataset.agentId = agent.id;

        card.innerHTML = `
            <div class="agent-avatar" style="background: ${agent.color}20; color: ${agent.color}">${agent.icon}</div>
            <div class="agent-info">
                <div class="agent-name">${agent.name}</div>
                <div class="agent-role">${agent.role}</div>
            </div>
            <div class="agent-status ${agent.active ? '' : 'offline'}"></div>
        `;

        card.addEventListener('click', () => this.selectAgent(agent, card));

        // Set initial selected agent
        if (index === 0) {
            this.selectedAgent = agent;
        }

        return card;
    }

    selectAgent(agent, card) {
        // Remove active from all cards
        document.querySelectorAll('.agent-card').forEach(c => {
            c.classList.remove('active');
        });

        // Add active to clicked card
        card.classList.add('active');
        this.selectedAgent = agent;

        // Add context pulse animation
        this.pulseAnimation(card);

        // Update chat panel with selected agent
        this.updateChatPanel(agent);

        // Broadcast context change
        this.broadcastContext('agent-selected', agent);
    }

    filterAgents(searchTerm) {
        const cards = document.querySelectorAll('.agent-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('.agent-name').textContent.toLowerCase();
            const role = card.querySelector('.agent-role').textContent.toLowerCase();

            if (name.includes(term) || role.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    setupAgentChatArea() {
        // Add collapsible chat area below agent list if needed
        const agentPanel = document.querySelector('.agent-panel');
        if (!agentPanel.querySelector('.agent-chat-area')) {
            const chatArea = document.createElement('div');
            chatArea.className = 'agent-chat-area collapsed';
            chatArea.innerHTML = `
                <div class="chat-toggle">Quick Chat</div>
                <div class="chat-content"></div>
            `;
            agentPanel.appendChild(chatArea);
        }
    }

    // Editor Panel Functions
    setupEditorPanel() {
        const editor = document.getElementById('editorContent');
        if (!editor) return;

        // Format detection on input
        editor.addEventListener('input', () => this.detectAndApplyFormat());

        // Selection change for smart replace
        document.addEventListener('selectionchange', () => this.handleTextSelection());

        // Toolbar buttons
        this.setupToolbarButtons();

        // Format indicators
        this.updateFormatIndicators();
    }

    detectAndApplyFormat() {
        const editor = document.getElementById('editorContent');
        const selection = window.getSelection();
        const node = selection.anchorNode;

        if (!node || !editor.contains(node)) return;

        const line = node.textContent || '';
        const element = node.nodeType === 3 ? node.parentElement : node;

        // Auto-detect screenplay elements
        if (line.match(/^(INT|EXT)\./)) {
            element.className = 'scene-heading';
        } else if (line === line.toUpperCase() && line.length > 0 && !line.match(/^(INT|EXT)\./)) {
            // Check if it's dialogue or character
            const prevElement = element.previousElementSibling;
            if (prevElement && prevElement.className === 'character') {
                element.className = 'dialogue';
            } else {
                element.className = 'character';
            }
        } else if (line.startsWith('(') && line.endsWith(')')) {
            element.className = 'parenthetical';
        } else {
            element.className = 'action';
        }

        this.updateFormatIndicators();
    }

    updateFormatIndicators() {
        const indicators = document.getElementById('formatIndicators');
        if (!indicators) return;

        indicators.innerHTML = '';

        const elements = document.querySelectorAll('#editorContent > *');
        elements.forEach((element, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'format-indicator';
            indicator.style.top = `${element.offsetTop}px`;

            // Set indicator based on element class
            const formatMap = {
                'scene-heading': { text: 'S', color: 'var(--agent-plot)' },
                'action': { text: 'A', color: 'var(--color-text-secondary)' },
                'character': { text: 'C', color: 'var(--agent-character)' },
                'dialogue': { text: 'D', color: 'var(--agent-dialog)' },
                'parenthetical': { text: 'P', color: 'var(--color-text-muted)' },
                'transition': { text: 'T', color: 'var(--agent-genre)' }
            };

            const format = formatMap[element.className] || { text: 'A', color: 'var(--color-text-secondary)' };
            indicator.textContent = format.text;
            indicator.style.color = format.color;

            indicators.appendChild(indicator);
        });
    }

    setupToolbarButtons() {
        const buttons = document.querySelectorAll('.toolbar-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const format = button.textContent.toLowerCase();
                this.applyFormat(format);
            });
        });
    }

    applyFormat(format) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const formatMap = {
            'scene': 'scene-heading',
            'action': 'action',
            'character': 'character',
            'dialogue': 'dialogue',
            'transition': 'transition'
        };

        const className = formatMap[format] || 'action';

        // Apply format to current paragraph
        const container = range.commonAncestorContainer;
        const element = container.nodeType === 3 ? container.parentElement : container;

        if (element) {
            element.className = className;
            this.updateFormatIndicators();
        }
    }

    // Smart Text Replacement
    setupSmartTextReplace() {
        // Create floating UI elements
        this.createSmartReplaceUI();
    }

    createSmartReplaceUI() {
        const replaceUI = document.createElement('div');
        replaceUI.id = 'smartReplace';
        replaceUI.className = 'smart-replace-container hidden';
        replaceUI.innerHTML = `
            <button class="smart-replace-trigger">✨ Get AI suggestions</button>
            <div class="smart-replace-panel hidden">
                <div class="suggestions-list"></div>
            </div>
        `;
        document.body.appendChild(replaceUI);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .smart-replace-container {
                position: absolute;
                z-index: var(--z-dropdown);
                transition: all var(--duration-fast) var(--ease-smooth);
            }

            .smart-replace-container.hidden {
                display: none;
            }

            .smart-replace-trigger {
                background: var(--color-accent);
                color: var(--color-text-inverse);
                border: none;
                border-radius: var(--radius-full);
                padding: var(--spacing-xs) var(--spacing-md);
                font-size: var(--text-sm);
                cursor: pointer;
                box-shadow: var(--shadow-md);
                transition: all var(--duration-fast) var(--ease-smooth);
            }

            .smart-replace-trigger:hover {
                background: var(--color-accent-hover);
                transform: scale(1.05);
            }

            .smart-replace-panel {
                position: absolute;
                top: calc(100% + var(--spacing-xs));
                left: 0;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                padding: var(--spacing-sm);
                min-width: 300px;
                max-width: 500px;
                max-height: 300px;
                overflow-y: auto;
            }

            .smart-replace-panel.hidden {
                display: none;
            }

            .suggestion-item {
                padding: var(--spacing-sm);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--duration-fast) var(--ease-smooth);
                display: flex;
                gap: var(--spacing-sm);
                align-items: flex-start;
                margin-bottom: var(--spacing-xs);
            }

            .suggestion-item:hover {
                background: var(--color-surface-hover);
            }

            .suggestion-agent-icon {
                width: 20px;
                height: 20px;
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--text-xs);
                flex-shrink: 0;
            }

            .suggestion-text {
                flex: 1;
                font-size: var(--text-sm);
                line-height: var(--leading-snug);
            }
        `;
        document.head.appendChild(style);

        // Setup event handlers
        const trigger = replaceUI.querySelector('.smart-replace-trigger');
        trigger.addEventListener('click', () => this.showSmartSuggestions());
    }

    handleTextSelection() {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
            this.selectedText = text;
            this.showSmartReplaceTrigger(selection);
        } else {
            this.hideSmartReplace();
        }
    }

    showSmartReplaceTrigger(selection) {
        const replaceUI = document.getElementById('smartReplace');
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        replaceUI.style.left = `${rect.left + (rect.width / 2) - 75}px`;
        replaceUI.style.top = `${rect.bottom + window.scrollY + 5}px`;
        replaceUI.classList.remove('hidden');
    }

    hideSmartReplace() {
        const replaceUI = document.getElementById('smartReplace');
        replaceUI.classList.add('hidden');
        replaceUI.querySelector('.smart-replace-panel').classList.add('hidden');
    }

    async showSmartSuggestions() {
        const panel = document.querySelector('.smart-replace-panel');
        const list = panel.querySelector('.suggestions-list');

        // Show loading state
        list.innerHTML = '<div class="loading">Getting AI suggestions...</div>';
        panel.classList.remove('hidden');

        // Get current editor content for context
        const editor = document.getElementById('editorContent');
        const editorContent = editor ? editor.innerText : '';

        try {
            // Get suggestions from active agents
            const suggestions = [];
            const activeAgents = this.agents.filter(a => a.active).slice(0, 4);

            for (const agent of activeAgents) {
                const contextualMessage = `[Context - Current Script: "${editorContent.substring(0, 1000)}"]\n\nPlease provide a brief improvement for this text: "${this.selectedText}"`;

                const response = await fetch(`/api/agents/${agent.name.toLowerCase().replace(' ', '-')}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: contextualMessage,
                        conversationId: `smart-replace-${Date.now()}`
                    })
                });

                const data = await response.json();

                if (data.success && data.response) {
                    suggestions.push({
                        agent,
                        text: data.response.substring(0, 200) // Limit length
                    });
                }
            }

            // Display suggestions
            list.innerHTML = '';
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <div class="suggestion-agent-icon" style="background: ${suggestion.agent.color}20; color: ${suggestion.agent.color}">
                        ${suggestion.agent.icon}
                    </div>
                    <div class="suggestion-text">${suggestion.text}</div>
                `;

                item.addEventListener('click', () => this.applySuggestion(suggestion.text));
                list.appendChild(item);
            });

            if (suggestions.length === 0) {
                list.innerHTML = '<div class="no-suggestions">No suggestions available</div>';
            }
        } catch (error) {
            console.error('Error getting suggestions:', error);
            list.innerHTML = '<div class="error">Failed to get suggestions</div>';
        }
    }


    applySuggestion(suggestionText) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(suggestionText));

            // Smooth animation
            const node = range.commonAncestorContainer.parentElement;
            node.style.transition = 'background-color var(--duration-normal)';
            node.style.backgroundColor = 'var(--color-accent-muted)';
            setTimeout(() => {
                node.style.backgroundColor = '';
            }, 300);
        }

        this.hideSmartReplace();
        this.updateFormatIndicators();
    }

    // Chat Panel Functions
    setupChatPanel() {
        const chatInput = document.querySelector('.chat-input');
        if (!chatInput) return;

        // Auto-expanding textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });

        // Send message on Enter (Shift+Enter for new line)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(e.target.value);
                e.target.value = '';
                e.target.style.height = 'auto';
            }
        });

        // Quick suggestion chips
        this.setupQuickSuggestions();
    }

    updateChatPanel(agent) {
        const header = document.querySelector('.chat-header');
        if (!header) return;

        header.innerHTML = `
            <div class="agent-avatar" style="background: ${agent.color}20; color: ${agent.color}">${agent.icon}</div>
            <div class="agent-info">
                <div class="agent-name">${agent.name}</div>
                <div class="agent-role context-indicator">Scene 3, Page 7</div>
            </div>
        `;
    }

    setupQuickSuggestions() {
        const inputContainer = document.querySelector('.chat-input-container');
        if (!inputContainer.querySelector('.quick-suggestions')) {
            const suggestions = document.createElement('div');
            suggestions.className = 'quick-suggestions';
            suggestions.innerHTML = `
                <button class="suggestion-chip">What about this scene?</button>
                <button class="suggestion-chip">Improve dialogue</button>
                <button class="suggestion-chip">Add tension</button>
            `;
            inputContainer.insertBefore(suggestions, inputContainer.firstChild);

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .quick-suggestions {
                    display: flex;
                    gap: var(--spacing-xs);
                    margin-bottom: var(--spacing-xs);
                    flex-wrap: wrap;
                }

                .suggestion-chip {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    background: var(--color-surface-hover);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-full);
                    font-size: var(--text-xs);
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all var(--duration-fast) var(--ease-smooth);
                }

                .suggestion-chip:hover {
                    background: var(--color-surface-active);
                    color: var(--color-text-primary);
                    border-color: var(--color-accent);
                }
            `;
            document.head.appendChild(style);

            // Add click handlers
            suggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const chatInput = document.querySelector('.chat-input');
                    chatInput.value = chip.textContent;
                    chatInput.focus();
                });
            });
        }
    }

    async sendMessage(message) {
        if (!message.trim()) return;

        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Add user message
        const userMessage = this.createMessage(message, 'user');
        messagesContainer.appendChild(userMessage);

        // Get current editor content for context
        const editor = document.getElementById('editorContent');
        const editorContent = editor ? editor.innerText : '';

        // Build contextual message with editor content
        let contextualMessage = message;
        if (editorContent) {
            contextualMessage = `[Context - Current Script: "${editorContent.substring(0, 1000)}"]\n\n${message}`;
        }

        try {
            // Call the real API endpoint
            const response = await fetch(`/api/agents/${this.selectedAgent.name.toLowerCase().replace(' ', '-')}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: contextualMessage,
                    conversationId: `story-drive-${Date.now()}`
                })
            });

            const data = await response.json();

            if (data.success && data.response) {
                const agentMessage = this.createMessage(data.response, 'agent');
                messagesContainer.appendChild(agentMessage);
            } else {
                const errorMessage = this.createMessage('Sorry, I encountered an error. Please try again.', 'agent');
                messagesContainer.appendChild(errorMessage);
            }

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = this.createMessage('Failed to connect to agent. Please try again.', 'agent');
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    createMessage(text, sender) {
        const message = document.createElement('div');
        message.className = `message ${sender}`;

        if (sender === 'agent' && this.selectedAgent) {
            message.innerHTML = `
                <div class="message-avatar" style="background: ${this.selectedAgent.color}20; color: ${this.selectedAgent.color}">
                    ${this.selectedAgent.icon}
                </div>
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                </div>
            `;
        } else {
            message.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                </div>
            `;
        }

        return message;
    }


    // Panel Resizing
    setupResizeHandles() {
        const container = document.querySelector('.app-container');
        const leftHandle = document.getElementById('leftResizeHandle');
        const rightHandle = document.getElementById('rightResizeHandle');

        if (!container || !leftHandle || !rightHandle) return;

        let isResizing = false;
        let currentHandle = null;
        let startX = 0;
        let startWidth = 0;

        const startResize = (e, handle) => {
            isResizing = true;
            currentHandle = handle;
            startX = e.clientX;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();

            // Add active state to handle
            handle.style.background = 'var(--color-accent)';
        };

        const resize = (e) => {
            if (!isResizing) return;

            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const x = e.clientX - containerRect.left;

                if (currentHandle === leftHandle) {
                    const newWidth = Math.max(180, Math.min(320, x));
                    container.style.gridTemplateColumns = `${newWidth}px 1fr var(--panel-chat-width)`;
                } else if (currentHandle === rightHandle) {
                    const rightWidth = containerRect.width - x;
                    const newWidth = Math.max(320, Math.min(480, rightWidth));
                    const leftWidth = container.style.gridTemplateColumns.split(' ')[0];
                    container.style.gridTemplateColumns = `${leftWidth} 1fr ${newWidth}px`;
                }
            });
        };

        const stopResize = () => {
            if (currentHandle) {
                currentHandle.style.background = '';
            }
            isResizing = false;
            currentHandle = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        leftHandle.addEventListener('mousedown', (e) => startResize(e, leftHandle));
        rightHandle.addEventListener('mousedown', (e) => startResize(e, rightHandle));
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab between panels
            if (e.key === 'Tab' && e.ctrlKey) {
                e.preventDefault();
                this.cyclePanelFocus();
            }

            // Arrow keys in agent list
            if (document.activeElement.closest('.agent-list')) {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateAgentList(e.key === 'ArrowUp' ? -1 : 1);
                }
            }

            // Escape to close/cancel
            if (e.key === 'Escape') {
                this.hideSmartReplace();
                // Clear selection
                window.getSelection().removeAllRanges();
            }
        });
    }

    cyclePanelFocus() {
        const panels = ['.agent-panel', '.editor-panel', '.chat-panel'];
        const currentPanel = document.activeElement.closest(panels.join(', '));

        let nextIndex = 0;
        if (currentPanel) {
            const currentClass = '.' + currentPanel.className.split(' ')[0];
            const currentIndex = panels.indexOf(currentClass);
            nextIndex = (currentIndex + 1) % panels.length;
        }

        const nextPanel = document.querySelector(panels[nextIndex]);
        const focusable = nextPanel.querySelector('input, textarea, [contenteditable], .agent-card');
        if (focusable) {
            focusable.focus();
        }
    }

    navigateAgentList(direction) {
        const cards = Array.from(document.querySelectorAll('.agent-card:not([style*="display: none"])'));
        const activeCard = document.querySelector('.agent-card.active');

        if (!activeCard) return;

        const currentIndex = cards.indexOf(activeCard);
        const nextIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));

        if (nextIndex !== currentIndex) {
            const nextCard = cards[nextIndex];
            const agent = this.agents.find(a => a.id === nextCard.dataset.agentId);
            if (agent) {
                this.selectAgent(agent, nextCard);
            }
        }
    }

    // Context Broadcasting
    setupContextBroadcasting() {
        // Throttle context updates to 100ms
        const editor = document.getElementById('editorContent');
        if (!editor) return;

        editor.addEventListener('input', () => {
            if (this.contextBroadcastTimer) {
                clearTimeout(this.contextBroadcastTimer);
            }

            this.contextBroadcastTimer = setTimeout(() => {
                const content = editor.innerText;
                this.broadcastContext('content-change', {
                    content: content.substring(0, 500),
                    wordCount: content.split(/\s+/).length,
                    fullContent: content
                });
            }, 100);
        });

        // Broadcast cursor position changes
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
                this.updateContextIndicator(selection);
            }
        });
    }

    async broadcastContext(type, data) {
        // Show pulse animation on active agents
        const activeAgents = document.querySelectorAll('.agent-card .agent-status:not(.offline)');
        activeAgents.forEach(status => {
            status.parentElement.classList.add('context-active');
            setTimeout(() => {
                status.parentElement.classList.remove('context-active');
            }, 300);
        });

        // Update context indicator in chat
        this.updateContextIndicator();

        // Store context for next API call
        this.currentContext = data.fullContent || '';

        // Update session context in backend
        try {
            await fetch('/api/context/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context: data.fullContent,
                    metadata: {
                        wordCount: data.wordCount,
                        lastUpdate: new Date().toISOString()
                    }
                })
            });
        } catch (error) {
            console.error('Failed to update context:', error);
        }

        // Log context broadcast (for debugging)
        console.log('Context broadcast:', type, data);
    }

    updateContextIndicator(selection) {
        const indicator = document.querySelector('.context-indicator');
        if (!indicator) return;

        // Calculate approximate page/scene based on content
        const editor = document.getElementById('editorContent');
        const scenes = editor.querySelectorAll('.scene-heading');
        const currentScene = scenes.length > 0 ? scenes.length : 1;

        // Approximate page (assuming ~250 words per page)
        const wordCount = editor.innerText.split(/\s+/).length;
        const currentPage = Math.max(1, Math.ceil(wordCount / 250));

        indicator.textContent = `Scene ${currentScene}, Page ${currentPage}`;
    }

    // Utility Functions
    pulseAnimation(element) {
        element.classList.add('context-active');
        setTimeout(() => {
            element.classList.remove('context-active');
        }, 300);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.storyDriveApp = new StoryDriveApp();
    });
} else {
    window.storyDriveApp = new StoryDriveApp();
}