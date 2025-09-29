// Story-Drive Professional UI - Epic 3 Implementation WITH MEMORY INTEGRATION
// Core functionality for the three-panel layout with FULL AI agent memory system

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

        // MEMORY SYSTEM INTEGRATION
        this.conversationIds = {}; // Track conversation IDs per agent
        this.memoryInitialized = false;
        this.screenplayContent = ''; // Track screenplay for persistence
        this.autoSaveTimer = null;
        this.agentLoadStatus = {}; // Track which agents are loaded

        this.init();
    }

    async init() {
        // Initialize memory system FIRST
        await this.initializeMemorySystem();
        await this.loadAvailableAgents();

        this.setupAgentPanel();
        this.setupEditorPanel();
        this.setupChatPanel();
        this.setupResizeHandles();
        this.setupSmartTextReplace();
        this.setupKeyboardNavigation();
        this.setupContextBroadcasting();

        // Don't load saved screenplay - start with blank page
        // await this.loadSavedScreenplay();

        // Setup auto-save
        this.setupAutoSave();
    }

    // ==================== MEMORY SYSTEM INTEGRATION ====================

    async initializeMemorySystem() {
        try {
            const response = await fetch('/api/memory/stats');
            if (response.ok) {
                this.memoryInitialized = true;
                console.log('✅ Memory system initialized');

                // Load conversation history for all agents
                await this.loadAllConversationHistory();
            }
        } catch (error) {
            console.error('❌ Failed to initialize memory system:', error);
        }
    }

    async loadAllConversationHistory() {
        try {
            const response = await fetch('/api/memory/conversations');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.conversations) {
                    // Group conversations by agent and initialize conversation IDs
                    data.data.conversations.forEach(conv => {
                        if (!this.conversationIds[conv.agentId]) {
                            this.conversationIds[conv.agentId] = `${conv.agentId}-${Date.now()}`;
                        }
                    });
                    console.log('✅ Loaded conversation history');
                }
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }

    async loadAvailableAgents() {
        try {
            const response = await fetch('/api/agents/available');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Available agents loaded:', data.agents.length);
            }
        } catch (error) {
            console.error('Failed to load available agents:', error);
        }
    }

    async loadSavedScreenplay() {
        try {
            const response = await fetch('/api/memory/conversations/screenplay');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.conversations && data.data.conversations.length > 0) {
                    // Get the latest screenplay content
                    const lastEntry = data.data.conversations[data.data.conversations.length - 1];
                    if (lastEntry.message) {
                        const editor = document.getElementById('editorContent');
                        if (editor) {
                            editor.innerHTML = lastEntry.message;
                            this.screenplayContent = lastEntry.message;
                            console.log('✅ Loaded saved screenplay');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load saved screenplay:', error);
        }
    }

    setupAutoSave() {
        // Auto-save screenplay every 30 seconds
        this.autoSaveTimer = setInterval(() => {
            this.saveScreenplay();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveScreenplay();
        });
    }

    async saveScreenplay() {
        const editor = document.getElementById('editorContent');
        if (!editor || !this.memoryInitialized) return;

        const content = editor.innerHTML;
        if (content === this.screenplayContent) return; // No changes

        this.screenplayContent = content;

        try {
            await fetch('/api/memory/conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: 'screenplay',
                    role: 'system',
                    message: content
                })
            });
            console.log('✅ Screenplay auto-saved');
        } catch (error) {
            console.error('Failed to save screenplay:', error);
        }
    }

    async saveToMemory(agentId, role, message) {
        if (!this.memoryInitialized) return;

        // Use the actual agent endpoint name for proper context sharing
        const agentEndpoint = this.getAgentEndpoint(agentId);

        try {
            await fetch('/api/memory/conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: agentEndpoint,  // Use endpoint name for consistency
                    role: role,
                    message: message
                })
            });
            console.log(`💾 Saved to memory for agent: ${agentEndpoint}`);
        } catch (error) {
            console.error('Failed to save to memory:', error);
        }
    }

    // ==================== AGENT PANEL ====================

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

    async selectAgent(agent, card) {
        // Remove active from all cards
        document.querySelectorAll('.agent-card').forEach(c => {
            c.classList.remove('active');
        });

        // Add active to clicked card
        card.classList.add('active');
        this.selectedAgent = agent;

        // Initialize conversation ID if needed
        if (!this.conversationIds[agent.id]) {
            this.conversationIds[agent.id] = `${agent.id}-${Date.now()}`;
        }

        // Load the agent if not already loaded
        await this.loadAgent(agent);

        // Add context pulse animation
        this.pulseAnimation(card);

        // Update chat panel with selected agent
        this.updateChatPanel(agent);

        // Load agent conversation history
        await this.loadAgentConversationHistory(agent.id);

        // Broadcast context change
        this.broadcastContext('agent-selected', agent);
    }

    async loadAgent(agent) {
        const agentEndpoint = this.getAgentEndpoint(agent.id);

        if (this.agentLoadStatus[agentEndpoint]) {
            return; // Already loaded
        }

        try {
            const response = await fetch(`/api/agents/${agentEndpoint}/load`, {
                method: 'POST'
            });

            if (response.ok) {
                this.agentLoadStatus[agentEndpoint] = true;
                console.log(`✅ Loaded agent: ${agent.name}`);
            }
        } catch (error) {
            console.error(`Failed to load agent ${agent.name}:`, error);
        }
    }

    async loadAgentConversationHistory(agentId) {
        if (!this.memoryInitialized) return;

        // Use the actual agent endpoint name for proper context sharing
        const agentEndpoint = this.getAgentEndpoint(agentId);

        try {
            const response = await fetch(`/api/memory/conversations/${agentEndpoint}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.conversations) {
                    // Display conversation history in chat panel
                    const messagesContainer = document.getElementById('chatMessages');
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                        data.data.conversations.forEach(conv => {
                            const msg = this.createMessage(conv.message, conv.role === 'user' ? 'user' : 'agent');
                            messagesContainer.appendChild(msg);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                    console.log(`📚 Loaded ${data.data.conversations.length} messages for ${agentEndpoint}`);
                }
            }
        } catch (error) {
            console.error('Failed to load agent conversation history:', error);
        }
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

    // ==================== EDITOR PANEL ====================

    setupEditorPanel() {
        const editor = document.getElementById('editorContent');
        if (!editor) return;

        // Format detection on input
        editor.addEventListener('input', () => {
            this.detectAndApplyFormat();
            this.debouncedSaveScreenplay();
        });

        // Handle paste events for auto-formatting
        editor.addEventListener('paste', (e) => {
            e.preventDefault();

            // Get pasted text
            const text = (e.clipboardData || window.clipboardData).getData('text');

            // Split into lines and format each
            const lines = text.split('\n');
            const fragment = document.createDocumentFragment();

            lines.forEach(line => {
                const div = document.createElement('div');
                div.textContent = line.trim();

                // Auto-detect format for pasted content
                if (line.match(/^(INT|EXT)\./)) {
                    div.className = 'scene-heading';
                } else if (line === line.toUpperCase() && line.trim().length > 0 && !line.match(/^(INT|EXT|CUT TO|FADE)/) && line.trim().length < 50) {
                    // Likely a character name
                    div.className = 'character';
                } else if (line.trim().startsWith('(') && line.trim().endsWith(')')) {
                    div.className = 'parenthetical';
                } else if (line.match(/^(CUT TO|FADE IN|FADE OUT|DISSOLVE TO|SMASH CUT)/)) {
                    div.className = 'transition';
                } else if (fragment.lastChild && fragment.lastChild.className === 'character') {
                    // Line after character is likely dialogue
                    div.className = 'dialogue';
                } else {
                    div.className = 'action';
                }

                fragment.appendChild(div);
            });

            // Insert at cursor position
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(fragment);

            // Move cursor to end of pasted content
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            // Update format indicators
            this.updateFormatIndicators();
            this.debouncedSaveScreenplay();
        });

        // Selection change for smart replace
        document.addEventListener('selectionchange', () => this.handleTextSelection());

        // Toolbar buttons
        this.setupToolbarButtons();

        // Format indicators
        this.updateFormatIndicators();
    }

    debouncedSaveScreenplay = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.saveScreenplay(), 2000);
        };
    })();

    detectAndApplyFormat() {
        const editor = document.getElementById('editorContent');
        const selection = window.getSelection();
        const node = selection.anchorNode;

        if (!node || !editor.contains(node)) return;

        const line = node.textContent || '';
        const element = node.nodeType === 3 ? node.parentElement : node;

        // Skip if element is the editor itself
        if (element === editor) return;

        // Auto-detect screenplay elements
        if (line.match(/^(INT|EXT)\./)) {
            element.className = 'scene-heading';
        } else if (line.match(/^(CUT TO|FADE IN|FADE OUT|DISSOLVE TO|SMASH CUT)/)) {
            element.className = 'transition';
        } else if (line === line.toUpperCase() && line.trim().length > 0 &&
                   !line.match(/^(INT|EXT|CUT TO|FADE)/) &&
                   line.trim().length < 50) {
            // Check if it's dialogue or character
            const prevElement = element.previousElementSibling;
            if (prevElement && prevElement.className === 'character') {
                element.className = 'dialogue';
            } else {
                element.className = 'character';
            }
        } else if (line.trim().startsWith('(') && line.trim().endsWith(')')) {
            element.className = 'parenthetical';
        } else if (!element.className || element.className === '') {
            // Only set to action if no class is already set
            element.className = 'action';
        }

        this.updateFormatIndicators();
    }

    updateFormatIndicators() {
        const indicators = document.getElementById('formatIndicators');
        if (!indicators) return;

        indicators.innerHTML = '';

        const elements = document.querySelectorAll('#editorContent > *');
        elements.forEach((element) => {
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

            const format = formatMap[element.className] || { text: '•', color: 'var(--color-text-muted)' };
            indicator.innerHTML = `<span style="color: ${format.color}">${format.text}</span>`;

            indicators.appendChild(indicator);
        });
    }

    setupToolbarButtons() {
        // Scene heading button
        const sceneBtn = document.getElementById('sceneBtn');
        if (sceneBtn) {
            sceneBtn.addEventListener('click', () => this.insertFormat('scene'));
        }

        // Action button
        const actionBtn = document.getElementById('actionBtn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => this.insertFormat('action'));
        }

        // Character button
        const characterBtn = document.getElementById('characterBtn');
        if (characterBtn) {
            characterBtn.addEventListener('click', () => this.insertFormat('character'));
        }

        // Dialogue button
        const dialogueBtn = document.getElementById('dialogueBtn');
        if (dialogueBtn) {
            dialogueBtn.addEventListener('click', () => this.insertFormat('dialogue'));
        }

        // Transition button
        const transitionBtn = document.getElementById('transitionBtn');
        if (transitionBtn) {
            transitionBtn.addEventListener('click', () => this.insertFormat('transition'));
        }
    }

    insertFormat(type) {
        const editor = document.getElementById('editorContent');
        const selection = window.getSelection();

        const formatTemplates = {
            scene: 'INT. LOCATION - TIME',
            action: 'Action description here...',
            character: 'CHARACTER NAME',
            dialogue: 'Dialogue goes here...',
            transition: 'CUT TO:'
        };

        const template = formatTemplates[type];
        if (template) {
            // Create a new div with the appropriate class
            const newElement = document.createElement('div');
            newElement.textContent = template;

            // Set the class based on type
            const classMap = {
                scene: 'scene-heading',
                action: 'action',
                character: 'character',
                dialogue: 'dialogue',
                transition: 'transition'
            };
            newElement.className = classMap[type] || 'action';

            // Insert at cursor position
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(newElement);

            // Add a new line after
            const br = document.createElement('br');
            newElement.after(br);

            // Move cursor to the new element
            range.selectNodeContents(newElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            // Update format indicators
            this.updateFormatIndicators();
            this.debouncedSaveScreenplay();
        }
    }

    handleTextSelection() {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && text.length > 3) {
            this.selectedText = text;
            this.showSmartReplaceOption(selection);
        } else {
            this.hideSmartReplaceOption();
        }
    }

    // ==================== SMART TEXT REPLACE ====================

    setupSmartTextReplace() {
        // Create floating action button
        const fab = document.createElement('div');
        fab.id = 'smartReplaceFab';
        fab.className = 'smart-replace-fab hidden';
        fab.innerHTML = `
            <span class="fab-icon">✨</span>
            <span class="fab-text">AI Enhance</span>
        `;
        document.body.appendChild(fab);

        fab.addEventListener('click', () => this.activateSmartReplace());
    }

    showSmartReplaceOption(selection) {
        const fab = document.getElementById('smartReplaceFab');
        if (!fab || this.smartReplaceActive) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        fab.style.top = `${rect.bottom + window.scrollY + 10}px`;
        fab.style.left = `${rect.left + window.scrollX}px`;
        fab.classList.remove('hidden');
    }

    hideSmartReplaceOption() {
        const fab = document.getElementById('smartReplaceFab');
        if (fab) {
            fab.classList.add('hidden');
        }
    }

    async activateSmartReplace() {
        if (!this.selectedText || this.smartReplaceActive) return;

        this.smartReplaceActive = true;
        this.hideSmartReplaceOption();

        // Show agent selection modal
        const agents = [
            { name: 'Plot Doctor', specialty: 'story structure' },
            { name: 'Character Coach', specialty: 'character development' },
            { name: 'Dialog Director', specialty: 'dialogue' },
            { name: 'World Builder', specialty: 'setting' },
            { name: 'Editor', specialty: 'general improvements' }
        ];

        const agent = await this.showAgentSelectionModal(agents);

        if (agent) {
            await this.processSmartReplace(agent);
        }

        this.smartReplaceActive = false;
    }

    async showAgentSelectionModal(agents) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'smart-replace-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Select AI Agent for Enhancement</h3>
                <div class="agent-options">
                    ${agents.map(a => `
                        <button class="agent-option" data-agent="${a.name}">
                            <strong>${a.name}</strong>
                            <small>${a.specialty}</small>
                        </button>
                    `).join('')}
                </div>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        return new Promise((resolve) => {
            modal.querySelectorAll('.agent-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const agentName = btn.dataset.agent;
                    modal.remove();
                    resolve(agents.find(a => a.name === agentName));
                });
            });

            modal.querySelector('.cancel-btn').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });
        });
    }

    async processSmartReplace(agent) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Get context
        const contextBefore = this.getContextBefore(range);
        const contextAfter = this.getContextAfter(range);

        const contextualMessage = `
Please enhance this text based on ${agent.specialty}:

Context before: "${contextBefore}"
Selected text: "${this.selectedText}"
Context after: "${contextAfter}"

Provide an improved version that maintains consistency with the surrounding context.
        `;

        try {
            const agentEndpoint = this.getAgentEndpointByName(agent.name);

            // Get conversation ID for this agent
            const agentId = agent.name.toLowerCase().replace(' ', '-');
            if (!this.conversationIds[agentId]) {
                this.conversationIds[agentId] = `${agentId}-${Date.now()}`;
            }

            const response = await fetch(`/api/agents/${agentEndpoint}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: contextualMessage,
                    conversationId: this.conversationIds[agentId]
                })
            });

            const data = await response.json();

            if (data.success && data.response) {
                // Extract the actual message text from the response object
                const responseText = typeof data.response === 'object' ?
                    (data.response.message || data.response.text || JSON.stringify(data.response)) :
                    data.response;

                // Replace the selected text with enhanced version
                document.execCommand('insertText', false, responseText);
                this.detectAndApplyFormat();

                // Save to memory
                await this.saveToMemory(agentId, 'user', `Smart replace: ${this.selectedText}`);
                await this.saveToMemory(agentId, 'assistant', responseText);
            }
        } catch (error) {
            console.error('Smart replace failed:', error);
            alert('Failed to enhance text. Please try again.');
        }
    }

    getContextBefore(range) {
        const container = range.startContainer;
        const text = container.textContent || '';
        const offset = range.startOffset;
        return text.substring(Math.max(0, offset - 100), offset);
    }

    getContextAfter(range) {
        const container = range.endContainer;
        const text = container.textContent || '';
        const offset = range.endOffset;
        return text.substring(offset, Math.min(text.length, offset + 100));
    }

    // ==================== CHAT PANEL ====================

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

        // Add send button
        this.addSendButton();

        // Don't setup quick suggestions - they clutter the interface
        // this.setupQuickSuggestions();
    }

    addSendButton() {
        const inputContainer = document.querySelector('.chat-input-container');
        if (!inputContainer || inputContainer.querySelector('.send-btn')) return;

        const sendBtn = document.createElement('button');
        sendBtn.className = 'send-btn';
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        `;
        sendBtn.style.cssText = `
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
        `;

        sendBtn.addEventListener('click', () => {
            const chatInput = document.querySelector('.chat-input');
            if (chatInput && chatInput.value.trim()) {
                this.sendMessage(chatInput.value);
                chatInput.value = '';
                chatInput.style.height = 'auto';
            }
        });

        sendBtn.addEventListener('mousedown', () => {
            sendBtn.style.transform = 'scale(0.95)';
        });

        sendBtn.addEventListener('mouseup', () => {
            sendBtn.style.transform = 'scale(1)';
        });

        inputContainer.appendChild(sendBtn);
    }

    updateChatPanel(agent) {
        const header = document.querySelector('.chat-header');
        if (!header) return;

        header.innerHTML = `
            <div class="agent-avatar" style="background: ${agent.color}20; color: ${agent.color}">${agent.icon}</div>
            <div class="agent-info">
                <div class="agent-name">${agent.name}</div>
                <div class="agent-role context-indicator">${agent.role}</div>
            </div>
        `;

        // Clean up any existing quick suggestions
        const existingSuggestions = document.querySelector('.quick-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
    }

    // Removed setupQuickSuggestions and updateQuickSuggestions - they clutter the interface

    async sendMessage(message) {
        if (!message.trim()) return;
        if (!this.selectedAgent) {
            console.error('No agent selected');
            return;
        }

        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Get or create conversation ID for this agent - use endpoint name for consistency
        const agentEndpoint = this.getAgentEndpoint(this.selectedAgent.id);
        if (!this.conversationIds[agentEndpoint]) {
            this.conversationIds[agentEndpoint] = `${agentEndpoint}-${Date.now()}`;
        }
        const conversationId = this.conversationIds[agentEndpoint];

        // Add user message to UI
        const userMessage = this.createMessage(message, 'user');
        messagesContainer.appendChild(userMessage);

        // Save user message to memory
        await this.saveToMemory(this.selectedAgent.id, 'user', message);

        // Add loading animation
        const loadingMsg = this.createLoadingMessage();
        messagesContainer.appendChild(loadingMsg);

        // Get current editor content for context
        const editor = document.getElementById('editorContent');
        const editorContent = editor ? editor.innerText : '';

        // Build contextual message with editor content and request cross-agent context
        let contextualMessage = message;
        if (editorContent) {
            contextualMessage = `[Context - Current Script: "${editorContent.substring(0, 1000)}"]\n\n${message}`;
        }

        // Add note about needing cross-agent context for questions about other agents
        if (message.toLowerCase().includes('said') ||
            message.toLowerCase().includes('told') ||
            message.toLowerCase().includes('mentioned') ||
            message.toLowerCase().includes('other agent') ||
            message.toLowerCase().includes('remember')) {
            contextualMessage = `[USER ASKING ABOUT CROSS-AGENT CONTEXT]\n${contextualMessage}`;
        }

        // Agent endpoint already set above

        try {
            // Load the agent first if not already loaded
            await this.loadAgent(this.selectedAgent);

            // Send message with proper conversation ID
            const response = await fetch(`/api/agents/${agentEndpoint}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: contextualMessage,
                    conversationId: conversationId
                })
            });

            const data = await response.json();

            // Remove loading animation
            loadingMsg.remove();

            if (data.success && data.response) {
                // Extract the actual message text from the response object
                const responseText = typeof data.response === 'object' ?
                    (data.response.message || data.response.text || JSON.stringify(data.response)) :
                    data.response;

                const agentMessage = this.createMessage(responseText, 'agent');
                messagesContainer.appendChild(agentMessage);

                // Save agent response to memory
                await this.saveToMemory(this.selectedAgent.id, 'assistant', responseText);

                // Broadcast the interaction for context awareness
                await this.broadcastAgentInteraction(this.selectedAgent.id, message, responseText);
            } else {
                const errorMessage = this.createMessage('Sorry, I encountered an error. Please try again.', 'agent');
                messagesContainer.appendChild(errorMessage);
            }

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error sending message:', error);
            loadingMsg.remove();
            const errorMessage = this.createMessage('Failed to connect to agent. Please try again.', 'agent');
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async broadcastAgentInteraction(agentId, userMessage, agentResponse) {
        try {
            // Update context for other agents
            await fetch('/api/context/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'agent-interaction',
                    agentId: agentId,
                    interaction: {
                        user: userMessage,
                        agent: agentResponse
                    },
                    screenplay: this.screenplayContent,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('Failed to broadcast agent interaction:', error);
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

    createLoadingMessage() {
        const message = document.createElement('div');
        message.className = 'message agent loading';
        message.innerHTML = `
            <div class="message-avatar" style="background: ${this.selectedAgent.color}20; color: ${this.selectedAgent.color}">
                ${this.selectedAgent.icon}
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        return message;
    }

    // ==================== UTILITY FUNCTIONS ====================

    getAgentEndpoint(agentId) {
        const agentEndpointMap = {
            'plot': 'plot-architect',
            'character': 'character-psychologist',
            'world': 'world-builder',
            'dialog': 'dialog-specialist',
            'genre': 'genre-consultant',
            'editor': 'developmental-editor',
            'reader': 'reader-advocate',
            'narrative': 'narrative-designer'
        };

        return agentEndpointMap[agentId] || agentId;
    }

    getAgentEndpointByName(agentName) {
        const agentEndpointMap = {
            'Plot Doctor': 'plot-architect',
            'Character Coach': 'character-psychologist',
            'World Builder': 'world-builder',
            'Dialog Director': 'dialog-specialist',
            'Genre Guide': 'genre-consultant',
            'Editor': 'developmental-editor',
            'Reader': 'reader-advocate',
            'Narrative': 'narrative-designer'
        };

        return agentEndpointMap[agentName] || agentName.toLowerCase().replace(' ', '-');
    }

    // ==================== PANEL RESIZING ====================

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
            const rect = container.getBoundingClientRect();
            startWidth = rect.width;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        };

        const doResize = (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const x = e.clientX - containerRect.left;

            if (currentHandle === leftHandle) {
                // Resize agent panel
                const newWidth = Math.max(180, Math.min(320, x));
                container.style.gridTemplateColumns = `${newWidth}px 1px 1fr 1px 360px`;
            } else if (currentHandle === rightHandle) {
                const rightWidth = containerRect.width - x;
                const newWidth = Math.max(320, Math.min(480, rightWidth));
                container.style.gridTemplateColumns = `240px 1px 1fr 1px ${newWidth}px`;
            }
        };

        const stopResize = () => {
            isResizing = false;
            currentHandle = null;
            document.body.style.cursor = 'default';
        };

        leftHandle.addEventListener('mousedown', (e) => startResize(e, leftHandle));
        rightHandle.addEventListener('mousedown', (e) => startResize(e, rightHandle));
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
    }

    // ==================== KEYBOARD NAVIGATION ====================

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K for quick agent switch
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.showAgentSwitcher();
            }

            // Cmd/Ctrl + / for format menu
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                this.showFormatMenu();
            }

            // Tab to cycle through panels
            if (e.key === 'Tab' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.cyclePanelFocus();
            }
        });
    }

    showAgentSwitcher() {
        // Quick agent switcher implementation
        console.log('Agent switcher activated');
    }

    showFormatMenu() {
        // Format menu implementation
        console.log('Format menu activated');
    }

    cyclePanelFocus() {
        const panels = ['.agent-panel', '.editor-panel', '.chat-panel'];
        const currentPanel = document.activeElement.closest(panels.join(', '));

        let nextIndex = 0;
        if (currentPanel) {
            const currentClass = panels.find(p => currentPanel.matches(p));
            nextIndex = (panels.indexOf(currentClass) + 1) % panels.length;
        }

        const nextPanel = document.querySelector(panels[nextIndex]);
        if (nextPanel) {
            const focusable = nextPanel.querySelector('input, textarea, [contenteditable]');
            if (focusable) focusable.focus();
        }
    }

    // ==================== CONTEXT BROADCASTING ====================

    setupContextBroadcasting() {
        const editor = document.getElementById('editorContent');
        if (!editor) return;

        // Broadcast content changes with debounce
        editor.addEventListener('input', () => {
            clearTimeout(this.contextBroadcastTimer);
            this.contextBroadcastTimer = setTimeout(() => {
                const content = editor.innerText;
                this.broadcastContext('content-change', {
                    content: content.substring(0, 500),
                    wordCount: content.split(/\s+/).length,
                    fullContent: content
                });
                // Also save screenplay
                this.saveScreenplay();
            }, 1000);
        });

        // Broadcast cursor position changes
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Update context indicator
                this.updateContextIndicator();
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
        this.currentContext = this.extractScreenplayContext();

        // Broadcast to server
        try {
            await fetch('/api/context/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source: 'editor',
                    type: type,
                    data: data,
                    context: this.currentContext,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('Failed to broadcast context:', error);
        }
    }

    extractScreenplayContext() {
        const editor = document.getElementById('editorContent');
        if (!editor) return '';

        // Get current scene, characters in scene, etc.
        const elements = editor.querySelectorAll('*');
        let currentScene = '';
        let charactersInScene = new Set();

        elements.forEach(el => {
            if (el.className === 'scene-heading') {
                currentScene = el.textContent;
            } else if (el.className === 'character') {
                charactersInScene.add(el.textContent);
            }
        });

        return {
            scene: currentScene,
            characters: Array.from(charactersInScene),
            content: editor.innerText.substring(0, 1000)
        };
    }

    updateContextIndicator() {
        // Update context indicator in chat panel
        const indicator = document.querySelector('.context-indicator');
        if (indicator && this.currentContext.scene) {
            indicator.textContent = `${this.currentContext.scene}`;
        }
    }

    // ==================== ANIMATIONS ====================

    pulseAnimation(element) {
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 600);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.storyDriveApp = new StoryDriveApp();
    console.log('🚀 Story-Drive initialized with full memory integration');
});