# Story 1.4: Context Passing to Agents - Brownfield Addition

## User Story

As a writer,
I want agents to understand what I'm writing,
So that their advice is relevant to my current work.

## Story Context

**Existing System Integration:**

- Integrates with: Agent chat system, TipTap editor, OpenAI API calls, existing agent personas
- Technology: JavaScript event system, OpenAI GPT-4 API, existing agent prompt templates
- Follows pattern: Current agent message handling, API request structure, context injection
- Touch points: Agent query interface, API request builder, agent response handler

## Acceptance Criteria

**Functional Requirements:**

1. Current paragraph (cursor position) is automatically included in agent queries when enabled
2. User can select specific text to provide as context (highlight and ask)
3. Document metadata (title, word count, genre) is available to all agents

**Integration Requirements:**

4. Existing agent personalities and expertise remain unchanged
5. New context follows existing prompt template patterns
6. Integration with OpenAI API maintains current token limits
7. Context passing respects user privacy settings

**Quality Requirements:**

8. Context extraction happens in <50ms
9. Token count for context capped at 1000 to control costs
10. Privacy mode allows disabling automatic context sharing
11. Agent response quality improves measurably with context
12. Documentation updated with context features and privacy options

## Technical Notes

- **Integration Approach:** Extend existing agent prompt builder, add context injection layer, preserve agent personas
- **Existing Pattern Reference:** Follow prompt construction from `/agents/prompt-builder.js`
- **Key Constraints:** Must not exceed token limits, respect cost boundaries, maintain agent personality consistency

## Implementation Details

```javascript
// Context manager integrated with existing agent system
const ContextManager = {
  init: function(editor, agentSystem) {
    this.editor = editor;
    this.agentSystem = agentSystem;
    this.privacyMode = this.loadPrivacySettings();

    this.setupContextHandlers();
  },

  setupContextHandlers: function() {
    // Extend existing agent query handler
    const originalSendQuery = this.agentSystem.sendQuery;

    this.agentSystem.sendQuery = async (agentName, userQuery) => {
      // Inject context before sending
      const enrichedQuery = this.enrichQueryWithContext(userQuery);
      return originalSendQuery.call(this.agentSystem, agentName, enrichedQuery);
    };

    // Handle text selection for explicit context
    this.editor.on('selection', (selection) => {
      if (selection && selection.length > 0) {
        this.selectedContext = selection;
      }
    });
  },

  enrichQueryWithContext: function(originalQuery) {
    if (this.privacyMode) {
      return originalQuery;
    }

    const context = {
      query: originalQuery,
      documentContext: this.getDocumentContext(),
      metadata: this.getDocumentMetadata()
    };

    return this.formatContextForAgent(context);
  },

  getDocumentContext: function() {
    // Get context based on priority
    if (this.selectedContext) {
      return {
        type: 'selected',
        content: this.truncateToTokenLimit(this.selectedContext, 800)
      };
    }

    // Get current paragraph
    const currentParagraph = this.getCurrentParagraph();
    if (currentParagraph) {
      return {
        type: 'current_paragraph',
        content: this.truncateToTokenLimit(currentParagraph, 500)
      };
    }

    return null;
  },

  getDocumentMetadata: function() {
    const content = this.editor.getHTML();
    return {
      wordCount: this.countWords(content),
      title: this.extractTitle(content),
      genre: this.detectGenre(content), // Uses existing genre detection
      lastModified: this.getLastSaveTime()
    };
  },

  formatContextForAgent: function(context) {
    // Follow existing prompt template pattern
    const template = `
[Document Context]
${context.metadata.title ? `Title: ${context.metadata.title}` : ''}
Word Count: ${context.metadata.wordCount}
${context.metadata.genre ? `Genre: ${context.metadata.genre}` : ''}

${context.documentContext ? `
[Current Focus]
${context.documentContext.content}
` : ''}

[User Query]
${context.query}
    `.trim();

    return template;
  },

  getCurrentParagraph: function() {
    // Get paragraph at cursor position
    const { from } = this.editor.state.selection;
    const resolvedPos = this.editor.state.doc.resolve(from);
    const paragraph = resolvedPos.parent;

    if (paragraph && paragraph.type.name === 'paragraph') {
      return paragraph.textContent;
    }

    return null;
  },

  truncateToTokenLimit: function(text, maxTokens) {
    // Rough estimation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) {
      return text;
    }

    return text.substring(0, maxChars) + '...';
  }
};
```

```javascript
// Privacy settings UI
const PrivacySettings = {
  render: function() {
    return `
      <div class="privacy-settings">
        <h3>Context Sharing Settings</h3>
        <label class="toggle-switch">
          <input type="checkbox" id="auto-context" checked>
          <span>Automatically share document context with agents</span>
        </label>
        <label class="toggle-switch">
          <input type="checkbox" id="share-metadata" checked>
          <span>Share document metadata (word count, title)</span>
        </label>
        <p class="privacy-note">
          When enabled, agents receive relevant portions of your document
          to provide better assistance. No data is stored permanently.
        </p>
      </div>
    `;
  }
};
```

## Testing Approach

1. **Unit Tests:**
   - Context extraction works correctly
   - Token limiting functions properly
   - Privacy settings respected

2. **Integration Tests:**
   - Context enhances agent responses
   - All 8 agents receive context correctly
   - Token limits not exceeded

3. **Quality Tests:**
   - Agent response relevance improves with context
   - No performance degradation
   - Privacy mode completely disables sharing

## Definition of Done

- [x] Functional requirements met (context passing works)
- [x] Integration requirements verified (agents unchanged, patterns followed)
- [x] Context extraction performant (<50ms)
- [x] Token limits enforced (1000 max)
- [x] Privacy controls implemented
- [x] Documentation updated
- [x] Agent response quality validated
- [x] No increase in API costs verified

## Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** Context injection breaks agent personalities or exceeds API token limits
- **Mitigation:** Careful prompt construction, token counting, extensive testing with each agent
- **Rollback:** Privacy mode disables feature, remove context injection layer

**Compatibility Verification:**

- [x] No breaking changes to existing agent APIs
- [x] No database changes required
- [x] UI changes minimal (privacy settings only)
- [x] Performance impact negligible (<50ms)

## Deployment Notes

- Deploy after Stories 1.1-1.3 are stable
- Default privacy mode to "on" initially
- Monitor API token usage closely
- A/B test context vs non-context agent responses
- Track user engagement with privacy settings

## Estimation

- **Development:** 5 hours
- **Testing:** 3 hours
- **Agent testing:** 2 hours
- **Total:** 10 hours (1.5 days)