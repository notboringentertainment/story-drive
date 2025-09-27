# Epic 2: Cross-Agent Conversation Memory

## Epic Overview
Enable persistent conversation memory across all AI agents in the Writing Studio, allowing agents to reference and build upon previous conversations from other agents within the same user session.

## Business Value
- Eliminates user friction from repeating context when switching between agents
- Creates a more cohesive and intelligent experience across the entire studio
- Improves productivity by maintaining conversational continuity
- Enables richer, context-aware interactions between specialized agents

## Current State
- Each agent conversation exists in isolation
- No memory persists between agent switches
- Users must repeat context when switching agents
- Conversation history is stored per individual agent

## Desired State
- All agents can access conversation history from other agents in the same session
- When switching agents, the chat window clears for visual clarity
- New agent acknowledges/references relevant prior conversations naturally
- Conversation memory persists throughout the user's session
- Memory is session-scoped (clears on new session)

## Technical Context
- System uses AgentPersona.js and ContextAwareAgent.js
- Conversations currently stored per agent
- Express.js backend with session management capability
- Frontend manages agent switching and chat display

## Epic Acceptance Criteria
1. Shared conversation memory storage is accessible by all agents
2. Context from other agents is injected into agent prompts appropriately
3. Chat UI clears when switching agents (visual separation)
4. Agent responses can naturally reference other agents' discussions
5. Memory persists for entire session duration
6. Memory clears when user starts new session
7. System maintains performance with accumulated context
8. Context injection is selective and relevant (not all history)

## User Story Example
1. User discusses "space adventure" plot with Plot Architect
2. User switches to Character Psychologist agent
3. Character Psychologist references the space adventure context
4. Chat window shows only Character Psychologist conversation
5. Context is naturally woven into responses, not just dumped

## Stories

### Story 2.1: Backend Shared Memory Storage
Implement centralized session-based memory storage for all agent conversations

### Story 2.2: Frontend Context API Integration
Create API endpoints and frontend integration for accessing shared memory

### Story 2.3: Agent Context Injection System
Build intelligent context selection and injection into agent prompts

### Story 2.4: UI Chat Window Management
Implement chat clearing and visual separation on agent switch

### Story 2.5: Context-Aware Response Generation
Enable agents to naturally reference and build upon other agents' conversations

## Technical Considerations
- Memory storage strategy (session-based, in-memory vs persistent)
- Context size management (token limits)
- Relevance filtering for context injection
- Performance optimization with growing context
- Privacy and data isolation per session

## Dependencies
- Express.js session management
- AgentPersona.js modifications
- ContextAwareAgent.js enhancements
- Frontend state management updates

## Story Dependencies
- **Builds Upon:** Story 1.4 (Context Passing) - extends existing ContextManager with cross-agent context
- **Follows Patterns From:** Story 1.3 (Auto-Save) - uses similar API endpoint patterns and storage approaches
- **Compatible With:** Story 1.5 series (Mode Infrastructure) - memory persists across mode switches

## Success Metrics
- Zero context repetition required when switching agents
- Agent responses demonstrate awareness of prior conversations
- User satisfaction with conversational continuity
- No performance degradation with typical session lengths