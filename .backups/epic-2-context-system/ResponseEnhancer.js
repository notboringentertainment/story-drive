class ResponseEnhancer {
  constructor() {
    this.attributionPhrases = [
      "As you discussed with {agent}",
      "Building on {agent}'s suggestion",
      "Following up on your conversation with {agent}",
      "Expanding on what {agent} mentioned",
      "In line with {agent}'s insights",
      "Connecting to your work with {agent}",
      "As {agent} pointed out",
      "Complementing {agent}'s approach",
      "Similar to what you explored with {agent}",
      "Extending the ideas from {agent}"
    ];

    this.contextRelevanceThresholds = {
      directMention: 1.0,      // User explicitly references other conversation
      topicOverlap: 0.7,       // Strong topic correlation
      entityMatch: 0.6,        // Same characters/settings mentioned
      thematicLink: 0.4,       // Related themes or concepts
      generalContext: 0.2      // Broad relevance
    };

    this.minRelevanceScore = 0.5; // Minimum score to include context
  }

  enhanceSystemPrompt(basePrompt, agentName, agentRole, documentContext, crossAgentContext) {
    // Build the enhanced prompt that naturally combines all context types
    let enhancedPrompt = this.buildAgentIdentity(basePrompt, agentName, agentRole);

    // Add context awareness instructions
    enhancedPrompt += this.buildContextAwarenessInstructions(agentName);

    // Add document context if available (Story 1.4)
    if (documentContext) {
      enhancedPrompt += this.buildDocumentContextSection(documentContext);
    }

    // Add cross-agent context if available (Story 2.3)
    if (crossAgentContext && crossAgentContext.formattedText) {
      enhancedPrompt += this.buildCrossAgentContextSection(crossAgentContext);
    }

    // Add integration guidelines
    enhancedPrompt += this.buildIntegrationGuidelines();

    return enhancedPrompt;
  }

  buildAgentIdentity(basePrompt, agentName, agentRole) {
    // If there's already a good base prompt, enhance it
    if (basePrompt && basePrompt.length > 100) {
      return basePrompt + '\n\n';
    }

    // Otherwise create a basic identity
    return `You are ${agentName}, ${agentRole}.

Your expertise and unique perspective are essential to helping the user with their creative writing.

`;
  }

  buildContextAwarenessInstructions(agentName) {
    return `[CONTEXT AWARENESS INSTRUCTIONS]
You have access to relevant information from the user's current work and conversations with other agents.

When responding:
1. Naturally reference or build upon relevant insights from other sources
2. Maintain your unique ${agentName} perspective and expertise
3. Connect ideas smoothly without forcing references
4. Use attribution when referencing specific agent contributions
5. Focus primarily on answering the current question while enriching with context

`;
  }

  buildDocumentContextSection(documentContext) {
    return `[CURRENT DOCUMENT CONTEXT]
The user is actively working on the following content:

---BEGIN DOCUMENT---
${documentContext}
---END DOCUMENT---

Consider this document context when providing your response, especially if the user's question relates to specific elements within their work.

`;
  }

  buildCrossAgentContextSection(crossAgentContext) {
    // Parse the formatted context to make it more natural
    const contextLines = crossAgentContext.formattedText.split('\n');
    const relevantContext = [];

    contextLines.forEach(line => {
      if (line.includes(':') && !line.includes('[')) {
        relevantContext.push(line.trim());
      }
    });

    if (relevantContext.length === 0) {
      return '';
    }

    return `[RELEVANT CONTEXT FROM OTHER AGENTS]
Here are relevant insights from the user's other conversations in this session:

${relevantContext.join('\n')}

When appropriate, naturally reference or build upon these insights using phrases like:
${this.getRandomAttributionExamples()}

`;
  }

  buildIntegrationGuidelines() {
    return `[INTEGRATION GUIDELINES]
- Only reference context when it genuinely adds value to your response
- Use natural, conversational language when making connections
- Maintain focus on the user's current request
- Avoid overwhelming the response with too many references
- If context isn't relevant, don't force it - just provide your expert perspective

Remember: Quality over quantity. A single well-integrated context reference is better than multiple forced ones.

`;
  }

  getRandomAttributionExamples() {
    // Shuffle and pick 3 random attribution phrases as examples
    const shuffled = [...this.attributionPhrases].sort(() => Math.random() - 0.5);
    return shuffled
      .slice(0, 3)
      .map(phrase => `- "${phrase.replace('{agent}', 'the Plot Architect')}"`)
      .join('\n');
  }

  scoreContextRelevance(userMessage, contextEntry) {
    let score = 0;
    const lowerMessage = userMessage.toLowerCase();
    const lowerContext = contextEntry.message.toLowerCase();

    // Direct mention check
    const agentName = this.formatAgentName(contextEntry.agentId);
    if (lowerMessage.includes(agentName.toLowerCase())) {
      score = Math.max(score, this.contextRelevanceThresholds.directMention);
    }

    // Topic overlap check
    const messageKeywords = this.extractKeywords(lowerMessage);
    const contextKeywords = this.extractKeywords(lowerContext);
    const overlap = this.calculateOverlap(messageKeywords, contextKeywords);

    if (overlap > 0.4) {
      score = Math.max(score, this.contextRelevanceThresholds.topicOverlap);
    } else if (overlap > 0.2) {
      score = Math.max(score, this.contextRelevanceThresholds.entityMatch);
    } else if (overlap > 0.1) {
      score = Math.max(score, this.contextRelevanceThresholds.thematicLink);
    }

    // Recency boost (messages within last 10 minutes get a boost)
    const messageAge = Date.now() - new Date(contextEntry.timestamp).getTime();
    const recencyBoost = Math.max(0, 1 - (messageAge / (10 * 60 * 1000))) * 0.1;
    score += recencyBoost;

    return score;
  }

  extractKeywords(text) {
    // Simple keyword extraction
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                               'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
                               'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do',
                               'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
                               'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
                               'when', 'where', 'why', 'how', 'this', 'that', 'these', 'those']);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  calculateOverlap(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = [...set1].filter(x => set2.has(x));

    return intersection.length / Math.min(keywords1.length, keywords2.length);
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

  filterRelevantContext(crossAgentContext, userMessage) {
    if (!crossAgentContext || !crossAgentContext.formattedText) {
      return crossAgentContext;
    }

    // Parse the context entries
    const contextLines = crossAgentContext.formattedText.split('\n');
    const entries = [];
    let currentEntry = null;

    contextLines.forEach(line => {
      if (line.includes('ago):')) {
        // This is a context entry
        const match = line.match(/(.+?)\s+\((.+?)\):\s+(.+)/);
        if (match) {
          const [, agent, time, message] = match;
          entries.push({
            agentId: agent.toLowerCase().replace(/\s+/g, '-'),
            timestamp: time,
            message: message
          });
        }
      }
    });

    // Score each entry
    const scoredEntries = entries.map(entry => ({
      ...entry,
      relevance: this.scoreContextRelevance(userMessage, entry)
    }));

    // Filter by minimum relevance
    const relevantEntries = scoredEntries
      .filter(entry => entry.relevance >= this.minRelevanceScore)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3); // Limit to top 3 most relevant

    if (relevantEntries.length === 0) {
      return null;
    }

    // Rebuild formatted context with only relevant entries
    let filteredText = '[CONTEXT FROM OTHER AGENTS]\n';
    relevantEntries.forEach(entry => {
      const agentName = this.formatAgentName(entry.agentId);
      filteredText += `${agentName} (${entry.timestamp}): ${entry.message}\n`;
    });
    filteredText += '[END CONTEXT]\n';

    return {
      ...crossAgentContext,
      formattedText: filteredText,
      metadata: {
        ...crossAgentContext.metadata,
        filtered: true,
        originalCount: entries.length,
        filteredCount: relevantEntries.length
      }
    };
  }

  createNaturalResponse(agentResponse, contextMetadata) {
    // Post-process the response to ensure natural flow
    // This could be enhanced with more sophisticated NLP
    let processedResponse = agentResponse;

    // Remove any awkward context references
    processedResponse = processedResponse.replace(/\[CONTEXT:.*?\]/g, '');
    processedResponse = processedResponse.replace(/\[END CONTEXT\]/g, '');

    // Ensure proper sentence flow
    processedResponse = this.ensureSentenceFlow(processedResponse);

    return processedResponse;
  }

  ensureSentenceFlow(text) {
    // Basic sentence flow improvements
    text = text.replace(/\.\s*\./g, '.');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();

    // Ensure it ends with proper punctuation
    if (text && !text.match(/[.!?]$/)) {
      text += '.';
    }

    return text;
  }

  measureResponseQuality(response, hasContext) {
    const metrics = {
      length: response.length,
      sentences: response.split(/[.!?]+/).filter(s => s.trim()).length,
      hasAttribution: /discussed with|mentioned|suggested|pointed out|explored with/i.test(response),
      naturalFlow: !(/\[.*?\]/.test(response)), // No brackets means natural
      contextIntegration: hasContext && response.length > 200
    };

    const qualityScore =
      (metrics.sentences > 2 ? 0.3 : 0.1) +
      (metrics.hasAttribution && hasContext ? 0.3 : 0) +
      (metrics.naturalFlow ? 0.2 : 0) +
      (metrics.contextIntegration ? 0.2 : 0);

    return {
      score: qualityScore,
      metrics: metrics
    };
  }
}

export default ResponseEnhancer;