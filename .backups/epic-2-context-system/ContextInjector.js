class ContextInjector {
  constructor(memoryStore, options = {}) {
    this.memoryStore = memoryStore;

    // Default configuration for Story-Drive agents
    this.config = {
      enabled: true,
      defaultMaxTokens: 500,
      agentLimits: {
        'plot': 750,
        'character': 600,
        'dialog': 500,
        'world': 600,
        'genre': 400,
        'editor': 400,
        'reader': 350,
        'narrative': 700
      },
      relevanceWeights: {
        keywordMatch: 0.3,
        semanticSimilarity: 0.3,
        recency: 0.2,
        agentRelation: 0.2
      },
      ...options
    };

    // Story-Drive agent relationship matrix
    // Higher scores mean stronger collaboration/context sharing
    this.agentRelationships = {
      'plot': {
        'character': 0.95,  // Plot and character are deeply intertwined
        'world': 0.8,       // Setting affects plot
        'genre': 0.7,       // Genre conventions shape plot
        'dialog': 0.5,      // Dialog serves plot
        'narrative': 0.9,   // Narrative structure and plot work together
        'editor': 0.6,      // Editor helps refine plot
        'reader': 0.6       // Reader perspective on plot clarity
      },
      'character': {
        'plot': 0.95,       // Character drives plot
        'dialog': 0.9,      // Dialog reveals character
        'world': 0.6,       // World shapes character
        'narrative': 0.8,   // Narrative perspective on character
        'genre': 0.5,       // Genre affects character types
        'editor': 0.5,      // Editor refines character consistency
        'reader': 0.7       // Reader connection to characters
      },
      'dialog': {
        'character': 0.9,   // Dialog must match character
        'plot': 0.5,        // Dialog advances plot
        'editor': 0.8,      // Editor polishes dialog
        'genre': 0.6,       // Genre affects dialog style
        'narrative': 0.7,   // Narrative voice in dialog
        'world': 0.4,       // Setting affects speech patterns
        'reader': 0.6       // Reader experience of dialog
      },
      'world': {
        'plot': 0.8,        // World influences plot
        'genre': 0.85,      // Genre defines world rules
        'character': 0.6,   // World shapes character
        'narrative': 0.8,   // Narrative brings world to life
        'editor': 0.4,      // Editor ensures world consistency
        'dialog': 0.4,      // World affects language
        'reader': 0.5       // Reader immersion in world
      },
      'genre': {
        'plot': 0.7,        // Genre shapes plot structure
        'world': 0.85,      // Genre defines world type
        'narrative': 0.7,   // Genre affects narrative style
        'editor': 0.6,      // Editor maintains genre consistency
        'character': 0.5,   // Genre influences character types
        'dialog': 0.6,      // Genre affects dialog style
        'reader': 0.6       // Reader genre expectations
      },
      'editor': {
        'narrative': 0.8,   // Editor refines narrative flow
        'dialog': 0.8,      // Editor polishes dialog
        'plot': 0.6,        // Editor ensures plot coherence
        'genre': 0.6,       // Editor maintains genre consistency
        'character': 0.5,   // Editor checks character consistency
        'world': 0.4,       // Editor verifies world consistency
        'reader': 0.7       // Editor considers readability
      },
      'reader': {
        'plot': 0.6,        // Reader perspective on plot
        'character': 0.7,   // Reader connection to characters
        'narrative': 0.6,   // Reader experience of narrative
        'dialog': 0.6,      // Reader experience of dialog
        'editor': 0.7,      // Reader and editor share clarity goals
        'world': 0.5,       // Reader immersion
        'genre': 0.6        // Reader expectations
      },
      'narrative': {
        'plot': 0.9,        // Narrative and plot are intertwined
        'character': 0.8,   // Narrative perspective on character
        'world': 0.8,       // Narrative brings world to life
        'editor': 0.8,      // Editor refines narrative
        'dialog': 0.7,      // Narrative voice in dialog
        'genre': 0.7,       // Genre shapes narrative
        'reader': 0.6       // Reader experience
      }
    };

    // Per-agent injection settings
    this.agentSettings = {};
    Object.keys(this.config.agentLimits).forEach(agentId => {
      this.agentSettings[agentId] = { enabled: true };
    });
  }

  async getRelevantContext(sessionId, currentAgentId, userMessage) {
    if (!this.config.enabled || !this.agentSettings[currentAgentId]?.enabled) {
      return null;
    }

    try {
      // Get all conversations from memory store
      const allConversations = await this.memoryStore.getAllConversations(sessionId);

      if (!allConversations || allConversations.length === 0) {
        return null;
      }

      // Score and filter conversations
      const scoredConversations = this.scoreConversations(
        allConversations,
        currentAgentId,
        userMessage
      );

      // Select top conversations within token limit
      const maxTokens = this.config.agentLimits[currentAgentId] || this.config.defaultMaxTokens;
      const selectedContext = this.selectTopContext(scoredConversations, maxTokens);

      if (selectedContext.length === 0) {
        return null;
      }

      // Format context for injection
      return this.formatContext(selectedContext, currentAgentId);
    } catch (error) {
      console.error('ContextInjector: Error getting relevant context:', error);
      return null;
    }
  }

  scoreConversations(conversations, currentAgentId, userMessage) {
    const now = Date.now();
    const scoredConvs = [];

    conversations.forEach(conv => {
      // Skip current agent's own messages to avoid redundancy
      if (conv.agentId === currentAgentId) {
        return;
      }

      let score = 0;

      // 1. Keyword matching
      const keywords = this.extractKeywords(userMessage);
      const convKeywords = this.extractKeywords(conv.message);
      const keywordOverlap = this.calculateKeywordOverlap(keywords, convKeywords);
      score += keywordOverlap * this.config.relevanceWeights.keywordMatch;

      // 2. Semantic similarity (simplified - real implementation would use embeddings)
      const semanticScore = this.calculateSemanticSimilarity(userMessage, conv.message);
      score += semanticScore * this.config.relevanceWeights.semanticSimilarity;

      // 3. Recency scoring
      const messageAge = now - new Date(conv.timestamp).getTime();
      const recencyScore = Math.max(0, 1 - (messageAge / (60 * 60 * 1000))); // Decay over 1 hour
      score += recencyScore * this.config.relevanceWeights.recency;

      // 4. Agent relationship scoring
      const relationScore = this.getAgentRelationScore(currentAgentId, conv.agentId);
      score += relationScore * this.config.relevanceWeights.agentRelation;

      if (score > 0.1) { // Minimum threshold
        scoredConvs.push({
          ...conv,
          relevanceScore: score
        });
      }
    });

    // Sort by relevance score
    return scoredConvs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  extractKeywords(text) {
    if (!text) return [];

    // Simple keyword extraction - in production, use NLP library
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                               'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
                               'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do',
                               'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
                               'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her']);

    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  calculateKeywordOverlap(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = [...set1].filter(x => set2.has(x));

    return intersection.length / Math.max(keywords1.length, keywords2.length);
  }

  calculateSemanticSimilarity(text1, text2) {
    // Simplified semantic similarity based on shared words and length
    // In production, use embeddings or more sophisticated NLP
    if (!text1 || !text2) return 0;

    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = [...words1].filter(x => words2.has(x));

    const jaccard = intersection.length / (words1.size + words2.size - intersection.length);
    const lengthSimilarity = Math.min(text1.length, text2.length) / Math.max(text1.length, text2.length);

    return (jaccard * 0.7 + lengthSimilarity * 0.3);
  }

  getAgentRelationScore(agent1, agent2) {
    if (!this.agentRelationships[agent1] || !this.agentRelationships[agent1][agent2]) {
      return 0.3; // Default medium-low relationship
    }
    return this.agentRelationships[agent1][agent2];
  }

  selectTopContext(scoredConversations, maxTokens) {
    const selected = [];
    let currentTokens = 0;
    const avgTokensPerChar = 0.25; // Rough estimate

    for (const conv of scoredConversations) {
      const convTokens = Math.ceil(conv.message.length * avgTokensPerChar);

      if (currentTokens + convTokens <= maxTokens) {
        selected.push(conv);
        currentTokens += convTokens;
      } else if (selected.length === 0 && convTokens > maxTokens) {
        // If single message exceeds limit, truncate it
        const truncatedLength = Math.floor(maxTokens / avgTokensPerChar);
        selected.push({
          ...conv,
          message: conv.message.substring(0, truncatedLength) + '...',
          truncated: true
        });
        break;
      } else {
        break;
      }
    }

    return selected;
  }

  formatContext(selectedContext, currentAgentId) {
    if (selectedContext.length === 0) {
      return null;
    }

    let formattedContext = '[CONTEXT FROM OTHER AGENTS]\n';

    // Group by agent and sort by timestamp within each group
    const groupedByAgent = {};
    selectedContext.forEach(conv => {
      if (!groupedByAgent[conv.agentId]) {
        groupedByAgent[conv.agentId] = [];
      }
      groupedByAgent[conv.agentId].push(conv);
    });

    // Format each agent's context
    Object.entries(groupedByAgent).forEach(([agentId, convs]) => {
      convs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      convs.forEach(conv => {
        const timeAgo = this.formatTimeAgo(conv.timestamp);
        const agentName = this.formatAgentName(conv.agentId);

        if (conv.role === 'user') {
          formattedContext += `User to ${agentName} (${timeAgo}): ${conv.message}\n`;
        } else {
          formattedContext += `${agentName} (${timeAgo}): ${conv.message}\n`;
        }

        if (conv.truncated) {
          formattedContext += '[Message truncated for token limit]\n';
        }
      });
    });

    formattedContext += '[END CONTEXT]\n';

    return {
      formattedText: formattedContext,
      metadata: {
        contextCount: selectedContext.length,
        agents: Object.keys(groupedByAgent),
        injectedAt: new Date().toISOString(),
        targetAgent: currentAgentId
      }
    };
  }

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }

  formatAgentName(agentId) {
    const nameMap = {
      'plot-architect': 'Plot Architect',
      'character-psychologist': 'Character Psychologist',
      'dialogue-coach': 'Dialogue Coach',
      'world-builder': 'World Builder',
      'genre-specialist': 'Genre Specialist',
      'style-mentor': 'Style Mentor',
      'editor': 'Editor',
      'research-assistant': 'Research Assistant'
    };
    return nameMap[agentId] || agentId;
  }

  setAgentEnabled(agentId, enabled) {
    if (!this.agentSettings[agentId]) {
      this.agentSettings[agentId] = {};
    }
    this.agentSettings[agentId].enabled = enabled;
  }

  setGlobalEnabled(enabled) {
    this.config.enabled = enabled;
  }

  getInjectionStats() {
    return {
      enabled: this.config.enabled,
      agentSettings: this.agentSettings,
      tokenLimits: this.config.agentLimits,
      relevanceWeights: this.config.relevanceWeights
    };
  }
}

export default ContextInjector;