# Epic 2: Cross-Agent Memory - Dev Handoff

## Start Here
Implement Epic 2 stories in sequence (2.1 → 2.5). Each story builds on the previous.

## Critical Context
- **Story 1.4 Already Exists**: Has ContextManager for document→agent context passing
- **You're EXTENDING, not replacing**: Add cross-agent memory alongside existing context system
- **Follow Existing Patterns**: Use `/api/` routes like Story 1.3, follow modular JS patterns

## Implementation Order
1. **Story 2.1**: Create `SessionMemoryStore.js` - centralized conversation storage
2. **Story 2.2**: Add `/api/memory/*` endpoints - REST API for memory access
3. **Story 2.3**: Build `ContextInjector.js` - works WITH existing ContextManager
4. **Story 2.4**: Update chat UI - clear window on agent switch, preserve memory
5. **Story 2.5**: Enhance prompts - combine document + cross-agent context

## Key Files to Review First
- `server.js` - see existing `/api/documents/*` patterns
- `AgentPersona.js` & `ContextAwareAgent.js` - current agent system
- Story 1.4's `ContextManager` implementation - understand what exists

## Success Criteria
- User discusses "space adventure" with Plot Architect
- Switches to Character Psychologist
- Character Psychologist references space adventure WITHOUT user repeating it
- Chat window shows only current agent's messages
- Both document context (1.4) and agent context (2.x) work together

## Testing
Each story has acceptance criteria. Test after each story before moving to next.

Start with Story 2.1.