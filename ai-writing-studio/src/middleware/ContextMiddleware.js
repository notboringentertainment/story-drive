/**
 * ContextMiddleware - Unified context handling for all agent interactions
 * Solves the scattered context logic problem identified in architecture review
 */

class ContextMiddleware {
  /**
   * Extract context from various message formats
   * Supports multiple context patterns for backwards compatibility
   */
  static extract(message) {
    if (!message || typeof message !== 'string') {
      return { context: null, cleanMessage: message, type: 'none' };
    }

    // Define all supported context patterns
    const patterns = [
      {
        // Format: [Context - Type: "content"]
        regex: /\[Context - ([^:]+): "([^"]+)"\]\s*\n\n(.+)/s,
        handler: (match) => ({
          context: match[2],
          cleanMessage: match[3],
          type: match[1].toLowerCase().replace(' ', '_')
        })
      },
      {
        // Format: [DOCUMENT CONTEXT: content]
        regex: /\[DOCUMENT CONTEXT: ([^\]]+)\]\s*\n\n(.+)/s,
        handler: (match) => ({
          context: match[1],
          cleanMessage: match[2],
          type: 'document'
        })
      },
      {
        // Format: [Context: "content"]
        regex: /\[Context: "([^"]+)"\]\s*\n\n(.+)/s,
        handler: (match) => ({
          context: match[1],
          cleanMessage: match[2],
          type: 'generic'
        })
      }
    ];

    // Try each pattern
    for (const pattern of patterns) {
      const match = message.match(pattern.regex);
      if (match) {
        const result = pattern.handler(match);
        this.log('Context extracted', {
          type: result.type,
          contextLength: result.context.length,
          messageLength: result.cleanMessage.length
        });
        return result;
      }
    }

    // No context found
    return { context: null, cleanMessage: message, type: 'none' };
  }

  /**
   * Validate context meets requirements
   */
  static validate(context, options = {}) {
    const {
      maxLength = 10000,
      minLength = 1,
      required = false
    } = options;

    // Handle null/undefined
    if (!context) {
      if (required) {
        throw new Error('Context is required but not provided');
      }
      return null;
    }

    // Type check
    if (typeof context !== 'string') {
      throw new Error(`Context must be a string, received: ${typeof context}`);
    }

    // Length validation
    if (context.length < minLength) {
      throw new Error(`Context too short: ${context.length} chars (min: ${minLength})`);
    }

    if (context.length > maxLength) {
      // Truncate with ellipsis
      this.log('Context truncated', {
        original: context.length,
        maxLength
      });
      return context.substring(0, maxLength - 3) + '...';
    }

    return context;
  }

  /**
   * Inject context into agent system prompt
   * This is the critical piece that was missing initially
   */
  static inject(systemPrompt, context, agentName = 'Assistant') {
    if (!context) {
      return systemPrompt;
    }

    const contextInjection = `

=== IMPORTANT: DOCUMENT CONTEXT ===
The user is currently working on a document. Here is the relevant content they want you to consider:

---BEGIN DOCUMENT CONTENT---
${context}
---END DOCUMENT CONTENT---

As ${agentName}, you MUST:
1. ALWAYS acknowledge that you can see their document
2. Provide specific feedback referencing the actual content above
3. Never say you cannot see or access their document
4. Base your response on the document content provided

Your response should directly address the document content shown above.
===================================
`;

    // Inject after the base system prompt
    return systemPrompt + contextInjection;
  }

  /**
   * Build enriched message with context
   */
  static buildMessage(userMessage, editorContent = null, options = {}) {
    if (!editorContent) {
      return { message: userMessage, hasContext: false };
    }

    const {
      selectedText = null,
      currentParagraph = null,
      fullContent = null,
      wordCount = 0
    } = editorContent;

    // Priority: selected > paragraph > full
    let contextText = null;
    let contextType = 'none';

    if (selectedText) {
      contextText = selectedText;
      contextType = 'Selected Text';
    } else if (currentParagraph) {
      contextText = currentParagraph;
      contextType = 'Current Paragraph';
    } else if (fullContent) {
      // Limit full content to prevent token explosion
      contextText = fullContent.substring(0, 2000);
      contextType = `Document Preview (${wordCount} words total)`;
    }

    if (!contextText) {
      return { message: userMessage, hasContext: false };
    }

    const enrichedMessage = `[Context - ${contextType}: "${contextText}"]\n\n${userMessage}`;

    this.log('Message enriched', {
      contextType,
      contextLength: contextText.length,
      wordCount
    });

    return {
      message: enrichedMessage,
      hasContext: true,
      metadata: {
        type: contextType,
        wordCount,
        contextLength: contextText.length
      }
    };
  }

  /**
   * Structured logging with debug mode support
   */
  static log(action, data = {}) {
    if (process.env.DEBUG_CONTEXT === 'true') {
      console.log(`📋 [ContextMiddleware] ${action}:`, {
        timestamp: new Date().toISOString(),
        ...data
      });
    }
  }

  /**
   * Get context statistics for monitoring
   */
  static getStats(context) {
    if (!context) {
      return { exists: false };
    }

    return {
      exists: true,
      length: context.length,
      words: context.split(/\s+/).length,
      lines: context.split('\n').length,
      hasCode: /```/.test(context),
      language: this.detectLanguage(context)
    };
  }

  /**
   * Simple language detection for context
   */
  static detectLanguage(text) {
    // Basic detection for writing context
    const indicators = {
      screenplay: /^(INT\.|EXT\.|FADE IN:|CUT TO:)/m,
      dialogue: /^[A-Z]+\s*\n/m,
      markdown: /^#{1,6}\s/m,
      novel: /Chapter \d+|CHAPTER/i
    };

    for (const [type, pattern] of Object.entries(indicators)) {
      if (pattern.test(text)) {
        return type;
      }
    }

    return 'prose';
  }
}

export default ContextMiddleware;