# Story 2.1: Backend Shared Memory Storage

## Status
Ready for Review

## Story
**As a** system architect,
**I want** a centralized session-based memory storage system,
**so that** all agent conversations can be stored and accessed from a single source of truth

## Acceptance Criteria
1. Create SessionMemoryStore class that manages all agent conversations per session
2. Memory store maintains conversation history organized by agent ID
3. Each conversation entry includes timestamp, agent ID, role (user/assistant), and message content
4. Memory store provides methods to add, retrieve, and clear conversations
5. Storage is session-scoped using Express session ID as key
6. Implement memory size limits to prevent unbounded growth (configurable max entries)
7. Add cleanup mechanism for expired sessions
8. Ensure thread-safe operations for concurrent agent access

## Tasks / Subtasks
- [x] Create SessionMemoryStore class (AC: 1)
  - [x] Define data structure for storing multi-agent conversations
  - [x] Implement constructor with configuration options
  - [x] Add session ID validation
- [x] Implement core storage methods (AC: 2, 3, 4)
  - [x] addConversation(sessionId, agentId, role, message)
  - [x] getConversationHistory(sessionId, agentId)
  - [x] getAllConversations(sessionId)
  - [x] clearSession(sessionId)
- [x] Add session management integration (AC: 5)
  - [x] Integrate with Express session middleware
  - [x] Map session IDs to memory storage
  - [x] Handle session creation and destruction
- [x] Implement memory management (AC: 6, 7)
  - [x] Add configurable max entries per session
  - [x] Implement FIFO eviction when limit reached
  - [x] Create session expiration handler
  - [x] Add periodic cleanup task for expired sessions
- [x] Ensure thread safety (AC: 8)
  - [x] Add appropriate locking mechanisms
  - [x] Handle concurrent read/write operations
  - [x] Test with multiple simultaneous agent requests
- [x] Create unit tests
  - [x] Test basic CRUD operations
  - [x] Test memory limits and eviction
  - [x] Test session isolation
  - [x] Test concurrent access scenarios

## Dev Notes

### Architecture Context
- Backend uses Express.js with session management
- Current agent system uses AgentPersona.js and ContextAwareAgent.js
- Each agent currently maintains isolated conversation history
- Session management already exists in the Express application

### Implementation Guidelines
- Place SessionMemoryStore in a new file: `server/services/SessionMemoryStore.js`
- Use Map data structure for efficient session lookup
- Consider using node-cache or similar for TTL support
- Memory store should be singleton to ensure consistency
- Follow existing API patterns from Story 1.3 (`/api/documents/` endpoints)
- Align with existing session management in Express application

### Data Structure Example
```javascript
{
  sessionId: {
    conversations: [
      {
        agentId: 'plot-architect',
        timestamp: '2024-01-20T10:30:00Z',
        role: 'user',
        message: 'Help me with a space adventure plot'
      },
      {
        agentId: 'plot-architect',
        timestamp: '2024-01-20T10:30:15Z',
        role: 'assistant',
        message: 'I'll help you create a space adventure...'
      }
    ],
    metadata: {
      created: '2024-01-20T10:00:00Z',
      lastAccessed: '2024-01-20T10:30:15Z',
      entryCount: 2
    }
  }
}
```

### Testing Standards
- Test files location: `server/services/__tests__/`
- Use Jest testing framework
- Aim for 80% code coverage minimum
- Include integration tests with Express sessions

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-01-20 | 1.0 | Initial story creation | Bob (SM) |

## Dev Agent Record
### Agent Model Used
claude-opus-4-1-20250805

### Debug Log References
- SessionMemoryStore class implementation with Map-based storage
- Express session integration with configurable TTL
- Lock mechanism for thread-safe concurrent operations
- FIFO eviction when max entries reached
- Periodic cleanup task for expired sessions

### Completion Notes List
- Implemented SessionMemoryStore as singleton pattern for consistency
- Added async locking mechanism for thread-safe operations
- Session TTL and cleanup interval are configurable
- FIFO eviction ensures memory bounds are respected
- All 15 unit tests pass successfully
- Integration test confirms memory persistence across agent switches

### File List
- src/services/SessionMemoryStore.js (new)
- src/services/__tests__/SessionMemoryStore.test.js (new)
- server.js (modified - added session middleware and memory store integration)
- package.json (modified - added express-session dependency)
- jest.config.js (new)
- test-memory-integration.js (new - integration test)

## QA Results
[To be filled by QA Agent]