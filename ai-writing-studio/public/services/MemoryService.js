class MemoryService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.apiPath = '/api/memory';
  }

  async fetchWithSession(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Important for session cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllConversations(limit = 50, offset = 0) {
    try {
      const url = `${this.baseUrl}${this.apiPath}/conversations?limit=${limit}&offset=${offset}`;
      const result = await this.fetchWithSession(url);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch conversations');
      }

      return result.data;
    } catch (error) {
      console.error('MemoryService: Error fetching all conversations:', error);
      throw error;
    }
  }

  async getAgentConversations(agentId, limit = 50, offset = 0) {
    try {
      const url = `${this.baseUrl}${this.apiPath}/conversations/${agentId}?limit=${limit}&offset=${offset}`;
      const result = await this.fetchWithSession(url);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agent conversations');
      }

      return result.data;
    } catch (error) {
      console.error(`MemoryService: Error fetching conversations for ${agentId}:`, error);
      throw error;
    }
  }

  async getAgentContext(agentId, includeOtherAgents = false) {
    try {
      const url = `${this.baseUrl}${this.apiPath}/context/${agentId}?includeOtherAgents=${includeOtherAgents}`;
      const result = await this.fetchWithSession(url);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agent context');
      }

      return result.data;
    } catch (error) {
      console.error(`MemoryService: Error fetching context for ${agentId}:`, error);
      throw error;
    }
  }

  async addConversation(agentId, role, message) {
    try {
      const url = `${this.baseUrl}${this.apiPath}/conversation`;
      const result = await this.fetchWithSession(url, {
        method: 'POST',
        body: JSON.stringify({ agentId, role, message })
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to add conversation');
      }

      return result.data;
    } catch (error) {
      console.error('MemoryService: Error adding conversation:', error);
      throw error;
    }
  }

  async clearSession(confirm = false) {
    try {
      if (!confirm) {
        throw new Error('Confirmation required to clear session memory');
      }

      const url = `${this.baseUrl}${this.apiPath}/session?confirm=true`;
      const result = await this.fetchWithSession(url, {
        method: 'DELETE'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to clear session');
      }

      return result.data;
    } catch (error) {
      console.error('MemoryService: Error clearing session:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const url = `${this.baseUrl}${this.apiPath}/stats`;
      const result = await this.fetchWithSession(url);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch memory stats');
      }

      return result.data;
    } catch (error) {
      console.error('MemoryService: Error fetching stats:', error);
      throw error;
    }
  }

  formatConversationForDisplay(conversation) {
    const date = new Date(conversation.timestamp);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      ...conversation,
      displayTime: timeStr,
      isUser: conversation.role === 'user',
      isAssistant: conversation.role === 'assistant'
    };
  }

  groupConversationsByAgent(conversations) {
    const grouped = {};

    conversations.forEach(conv => {
      if (!grouped[conv.agentId]) {
        grouped[conv.agentId] = [];
      }
      grouped[conv.agentId].push(this.formatConversationForDisplay(conv));
    });

    return grouped;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryService;
}