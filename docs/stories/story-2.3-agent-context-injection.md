# Story 2.3: Agent Context Injection System

## Status
Ready for Review

## Story
**As an** AI agent,
**I want** relevant context from other agents' conversations automatically injected into my prompts (extending Story 1.4's document context),
**so that** I can provide contextually aware responses without users repeating information

## Acceptance Criteria
1. Create ContextInjector service that selects relevant context from shared memory
2. Implement relevance scoring algorithm to identify pertinent conversations
3. Context injection happens transparently before agent processes user input
4. Injected context is formatted as system message in agent prompt
5. Context size is managed to stay within token limits (configurable max)
6. Agent can distinguish between direct user input and injected context
7. System tracks which context was injected for each response
8. Context injection can be toggled on/off per agent type

## Tasks / Subtasks
- [x] Create ContextInjector service (AC: 1)
  - [x] Define service structure in `server/services/ContextInjector.js`
  - [x] Create injection pipeline architecture that extends Story 1.4's ContextManager
  - [x] Implement service initialization
  - [x] Ensure compatibility with existing ContextManager from Story 1.4
- [x] Implement relevance scoring (AC: 2)
  - [x] Create keyword extraction from conversations
  - [x] Implement semantic similarity scoring
  - [x] Add recency weighting (recent = more relevant)
  - [x] Score conversations by agent type relationships
- [x] Build injection mechanism (AC: 3, 4)
  - [x] Modify agent prompt construction in ContextAwareAgent.js
  - [x] Format context as system message
  - [x] Ensure proper prompt structure preservation
  - [x] Add context metadata tags
- [x] Implement token management (AC: 5)
  - [x] Add token counting utility
  - [x] Implement context truncation strategy
  - [x] Prioritize most relevant context within limits
  - [x] Make max tokens configurable per agent
- [x] Add context awareness (AC: 6, 7)
  - [x] Tag injected context in prompts
  - [x] Store injection history with responses
  - [x] Add context attribution in agent responses
  - [x] Create audit trail for context usage
- [x] Implement configuration system (AC: 8)
  - [x] Add per-agent injection settings
  - [x] Create default configuration
  - [x] Allow runtime toggling
  - [x] Add agent type filtering rules
- [x] Create context API endpoint
  - [x] GET /api/memory/context/:agentId
  - [x] Return scored and filtered context
  - [x] Include injection metadata
- [x] Write unit and integration tests
  - [x] Test relevance scoring algorithm
  - [x] Test token limit enforcement
  - [x] Test injection formatting
  - [x] Test configuration toggling

## Dev Notes

### CRITICAL INTEGRATION NOTE
Story 1.4 already implements document context passing via ContextManager. This story EXTENDS that system to add cross-agent conversation context. The ContextInjector must work alongside the existing ContextManager, not replace it.

### Context Injection Flow
1. User sends message to Agent B
2. ContextInjector retrieves all session conversations
3. Relevance scoring filters and ranks context
4. Top relevant context selected within token limit
5. Context formatted and injected into Agent B's prompt
6. Agent B processes with enriched context
7. Response and injection metadata stored

### Relevance Scoring Factors
```javascript
{
  keywordMatch: 0.3,      // Weight for keyword overlap
  semanticSimilarity: 0.3, // Weight for semantic relevance
  recency: 0.2,           // Weight for time-based relevance
  agentRelation: 0.2     // Weight for agent type relationships
}
```

### Context Format Example
```
[CONTEXT FROM OTHER AGENTS]
Plot Architect (5 minutes ago): User discussed creating a space adventure story with alien first contact theme.
Character Psychologist (2 minutes ago): User asked about developing a protagonist with trust issues.
[END CONTEXT]

[CURRENT CONVERSATION]
User: Help me develop the alien character for my story
```

### Agent Relationship Matrix
- Plot Architect ↔ Character Psychologist: HIGH
- Plot Architect ↔ Style Mentor: MEDIUM
- Character Psychologist ↔ Dialogue Coach: HIGH
- All agents ↔ Research Assistant: MEDIUM

### Token Limit Configuration
```javascript
{
  defaultMaxTokens: 500,
  agentLimits: {
    'plot-architect': 750,
    'character-psychologist': 600,
    'dialogue-coach': 400,
    'research-assistant': 1000
  }
}
```

### Testing Standards
- Test location: `server/services/__tests__/ContextInjector.test.js`
- Mock conversation data for testing
- Test edge cases (empty context, token overflow)
- Performance test with large conversation histories

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-01-20 | 1.0 | Initial story creation | Bob (SM) |

## Dev Agent Record
### Agent Model Used
claude-opus-4-1-20250805

### Debug Log References
- ContextInjector service with multi-factor relevance scoring
- Keyword extraction and semantic similarity calculation
- Agent relationship matrix for context prioritization
- Token limit management with truncation support
- Integration with existing ContextAwareAgent and ContextManager

### Completion Notes List
- Successfully extends Story 1.4's ContextManager, not replacing it
- Relevance scoring uses 4 factors: keywords, semantics, recency, agent relationships
- Context injection transparent to agents via system prompt
- Token limits configurable per agent type
- Injection history tracked for audit trail
- All 15 unit tests pass
- Integration test confirms cross-agent context awareness

### File List
- src/services/ContextInjector.js (new)
- src/ContextAwareAgent.js (modified - added injection support)
- server.js (modified - integrated ContextInjector)
- src/services/__tests__/ContextInjector.test.js (new)
- test-context-injection.js (new - integration test)
- src/routes/memoryRoutes.js (existing - context endpoint already present)

## QA Results
[To be filled by QA Agent]