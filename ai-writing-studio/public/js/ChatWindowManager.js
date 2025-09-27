class ChatWindowManager {
  constructor() {
    this.activeAgentId = null;
    this.conversations = {};
    this.isLoading = false;
    this.isSwitching = false;
    this.memoryService = new MemoryService();

    this.chatWindow = document.getElementById('chat-messages');
    this.chatHeader = document.getElementById('chat-header');
    this.loadingIndicator = null;

    this.init();
  }

  init() {
    // Create loading indicator
    this.createLoadingIndicator();

    // Add transition styles
    this.addTransitionStyles();

    // Initialize empty conversations storage
    this.conversations = {};
  }

  createLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'chat-loading';
    loader.className = 'chat-loading hidden';
    loader.innerHTML = `
      <div class="spinner"></div>
      <span>Loading conversation...</span>
    `;
    this.chatWindow.parentElement.appendChild(loader);
    this.loadingIndicator = loader;
  }

  addTransitionStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .chat-messages {
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      }

      .chat-messages.switching-out {
        opacity: 0;
        transform: translateY(-10px);
      }

      .chat-messages.switching-in {
        opacity: 0;
        transform: translateY(10px);
      }

      .chat-messages.active {
        opacity: 1;
        transform: translateY(0);
      }

      .chat-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 100;
      }

      .chat-loading.hidden {
        display: none;
      }

      .spinner {
        border: 3px solid rgba(0,0,0,0.1);
        border-top: 3px solid #667eea;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .chat-header {
        padding: 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 15px 15px 0 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .agent-avatar {
        font-size: 24px;
        background: rgba(255,255,255,0.2);
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .agent-info {
        flex: 1;
      }

      .agent-name {
        font-weight: bold;
        font-size: 1.1em;
      }

      .agent-role {
        font-size: 0.9em;
        opacity: 0.9;
      }

      .agent-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.85em;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4ade80;
        animation: pulse 2s infinite;
      }

      .conversation-summary {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.95);
        border-radius: 10px;
        padding: 15px;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 200;
      }

      .conversation-summary.hidden {
        display: none;
      }

      .summary-header {
        font-weight: bold;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #e0e0e0;
      }

      .summary-item {
        margin-bottom: 8px;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 5px;
        font-size: 0.9em;
      }

      .summary-agent {
        font-weight: bold;
        color: #667eea;
        margin-bottom: 3px;
      }

      .summary-text {
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }

  async switchAgent(agentId, agentInfo) {
    if (this.isSwitching) return;

    // If same agent, do nothing
    if (this.activeAgentId === agentId) return;

    this.isSwitching = true;

    // Save current conversation if exists
    if (this.activeAgentId) {
      this.saveCurrentConversation();
    }

    // Start transition
    await this.transitionOut();

    // Update active agent
    this.activeAgentId = agentId;

    // Update header
    this.updateChatHeader(agentInfo);

    // Show loading
    this.showLoading();

    // Clear chat window
    this.clearChatWindow();

    try {
      // Fetch agent's conversation history from backend
      const history = await this.fetchAgentHistory(agentId);

      // Restore conversation
      if (history && history.length > 0) {
        this.restoreConversation(agentId, history);
      } else {
        // Show welcome message for new conversation
        this.showWelcomeMessage(agentInfo);
      }

      // Fetch and show summary of other agents
      await this.fetchConversationSummary();

    } catch (error) {
      console.error('Error switching agent:', error);
      this.showError('Failed to load agent conversation');
    } finally {
      // Hide loading
      this.hideLoading();

      // Transition in
      await this.transitionIn();

      this.isSwitching = false;
    }
  }

  saveCurrentConversation() {
    const messages = Array.from(this.chatWindow.querySelectorAll('.message')).map(msg => ({
      type: msg.classList.contains('user') ? 'user' : 'agent',
      content: msg.querySelector('.text').textContent,
      timestamp: msg.dataset.timestamp || new Date().toISOString()
    }));

    this.conversations[this.activeAgentId] = messages;
  }

  async fetchAgentHistory(agentId) {
    try {
      const data = await this.memoryService.getAgentConversations(agentId, 50, 0);
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  restoreConversation(agentId, history) {
    this.chatWindow.innerHTML = '';

    history.forEach(entry => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${entry.role}`;
      messageDiv.dataset.timestamp = entry.timestamp;

      const icon = entry.role === 'user' ? '👤' : this.getAgentIcon(agentId);

      messageDiv.innerHTML = `
        <div class="icon">${icon}</div>
        <div class="content">
          <div class="text">${this.escapeHtml(entry.message)}</div>
          <div class="timestamp">${this.formatTime(entry.timestamp)}</div>
        </div>
      `;

      this.chatWindow.appendChild(messageDiv);
    });

    this.scrollToBottom();
  }

  showWelcomeMessage(agentInfo) {
    this.chatWindow.innerHTML = `
      <div class="message agent">
        <div class="icon">${agentInfo.icon}</div>
        <div class="content">
          <div class="text">Hello! I'm ${agentInfo.name}, your ${agentInfo.role}. How can I help you with your writing today?</div>
          <div class="timestamp">${this.formatTime(new Date().toISOString())}</div>
        </div>
      </div>
    `;
  }

  async fetchConversationSummary() {
    try {
      const allConversations = await this.memoryService.getAllConversations(10, 0);

      if (!allConversations || !allConversations.conversations) return;

      const grouped = this.memoryService.groupConversationsByAgent(allConversations.conversations);

      // Filter out current agent
      delete grouped[this.activeAgentId];

      if (Object.keys(grouped).length > 0) {
        this.showConversationSummary(grouped);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }

  showConversationSummary(groupedConversations) {
    const existingSummary = document.querySelector('.conversation-summary');
    if (existingSummary) {
      existingSummary.remove();
    }

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'conversation-summary';

    let summaryHTML = '<div class="summary-header">Context from other agents:</div>';

    Object.entries(groupedConversations).forEach(([agentId, messages]) => {
      const latestMessage = messages[messages.length - 1];
      const agentName = this.formatAgentName(agentId);

      summaryHTML += `
        <div class="summary-item">
          <div class="summary-agent">${agentName}</div>
          <div class="summary-text">${this.truncateText(latestMessage.message, 100)}</div>
        </div>
      `;
    });

    summaryDiv.innerHTML = summaryHTML;
    this.chatWindow.parentElement.appendChild(summaryDiv);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      summaryDiv.classList.add('hidden');
    }, 5000);
  }

  updateChatHeader(agentInfo) {
    if (!this.chatHeader) return;

    this.chatHeader.innerHTML = `
      <div class="agent-avatar">${agentInfo.icon}</div>
      <div class="agent-info">
        <div class="agent-name">${agentInfo.name}</div>
        <div class="agent-role">${agentInfo.role}</div>
      </div>
      <div class="agent-status">
        <span class="status-dot"></span>
        <span>Ready</span>
      </div>
    `;
  }

  clearChatWindow() {
    this.chatWindow.innerHTML = '';
  }

  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.remove('hidden');
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
    }
  }

  async transitionOut() {
    this.chatWindow.classList.add('switching-out');
    this.chatWindow.classList.remove('active');
    await this.sleep(300);
  }

  async transitionIn() {
    this.chatWindow.classList.remove('switching-out');
    this.chatWindow.classList.add('switching-in');
    await this.sleep(50);
    this.chatWindow.classList.remove('switching-in');
    this.chatWindow.classList.add('active');
  }

  addMessage(type, content, agentInfo = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.dataset.timestamp = new Date().toISOString();

    const icon = type === 'user' ? '👤' : (agentInfo ? agentInfo.icon : '🤖');

    messageDiv.innerHTML = `
      <div class="icon">${icon}</div>
      <div class="content">
        <div class="text">${this.escapeHtml(content)}</div>
        <div class="timestamp">${this.formatTime(new Date().toISOString())}</div>
      </div>
    `;

    this.chatWindow.appendChild(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.innerHTML = `
      <div class="icon">⚠️</div>
      <div class="content">
        <div class="text">${message}</div>
      </div>
    `;
    this.chatWindow.appendChild(errorDiv);
  }

  // Utility functions
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatAgentName(agentId) {
    const names = {
      'plot-architect': 'Plot Architect',
      'character-psychologist': 'Character Psychologist',
      'dialogue-coach': 'Dialogue Coach',
      'world-builder': 'World Builder',
      'genre-specialist': 'Genre Specialist',
      'style-mentor': 'Style Mentor',
      'editor': 'Editor',
      'research-assistant': 'Research Assistant'
    };
    return names[agentId] || agentId;
  }

  getAgentIcon(agentId) {
    const icons = {
      'plot-architect': '🏗️',
      'character-psychologist': '🧠',
      'dialogue-coach': '💬',
      'world-builder': '🌍',
      'genre-specialist': '📚',
      'style-mentor': '✨',
      'editor': '✏️',
      'research-assistant': '🔍'
    };
    return icons[agentId] || '🤖';
  }
}