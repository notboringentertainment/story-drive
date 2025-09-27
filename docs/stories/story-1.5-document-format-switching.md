# [CONVERTED TO EPIC] Story 1.5: Document Format Switching

**⚠️ This story has been converted to Epic 1.5 with 5 sub-stories**
**See: epic-1.5-professional-writing-modes.md**

## User Story

As a writer,
I want to switch between professional writing application modes (screenplay like Final Draft, novel like Scrivener/Ulysses, outline like WorkFlowy, story bible like World Anvil),
So that I can work in specialized environments tailored to each type of creative content.

## Story Context

**Existing System Integration:**

- Integrates with: TipTap editor from Story 1.1, auto-save system from Story 1.3
- Technology: Vanilla JavaScript, TipTap extensions, HTML5, CSS3, localStorage
- Follows pattern: Modular JavaScript pattern with event-driven UI updates
- Touch points: Editor toolbar, TipTap instance, localStorage save system, entire UI layout

## Acceptance Criteria

**Functional Requirements:**

1. Format mode selector switches entire application interface to replicate professional writing software:

   **Screenplay Mode (Final Draft-like):**
   - Auto-format scene headings (INT./EXT.)
   - Character name auto-complete and centering
   - Dialogue auto-indentation
   - Action line formatting
   - Transitions (CUT TO:, FADE IN:)
   - Tab/Enter navigation between elements
   - Dual dialogue support
   - Page break indicators

   **Novel Mode (Scrivener/Ulysses-like):**
   - Chapter and scene organization
   - Word count targets and progress tracking
   - Distraction-free writing mode
   - Markdown support for formatting
   - Character and location tracking
   - Research sidebar
   - Export to standard manuscript format

   **Outline Mode (WorkFlowy-like):**
   - Infinite nested bullet points
   - Drag-and-drop reordering
   - Collapse/expand all levels
   - Focus mode (zoom into any bullet)
   - Tags and filtering
   - Keyboard shortcuts for navigation
   - Note attachments to bullets

   **Story Bible Mode (World Anvil-like):**
   - Template-based entries (Characters, Locations, Timeline, etc.)
   - Relationship mapping between entities
   - Image attachments for references
   - Categorized sections
   - Quick search across all entries
   - Wiki-style cross-referencing

2. Each mode completely transforms the UI/UX to match its professional counterpart
3. Smart content conversion when switching between modes (with preview and warnings)

**Integration Requirements:**

4. Existing TipTap editor serves as the core text engine for all modes
5. Mode switching maintains document integrity with format-specific metadata
6. Integration with auto-save system maintains current behavior (500ms debounce)
7. Each mode's data structure and preferences stored in localStorage

**Quality Requirements:**

8. Mode switching provides smooth transition with loading state
9. Each mode includes context-specific toolbars, shortcuts, and features
10. Performance remains responsive even with large documents

## Technical Notes

- **Integration Approach:** Create mode-specific modules that transform the entire application UI, with TipTap as the core editing engine
- **Existing Pattern Reference:** Follow modular pattern from editor.js module in Story 1.1
- **Key Constraints:**
  - Must work without build tools (vanilla JS approach)
  - Each mode requires significant UI components and behavior logic
  - Need format-specific data models (screenplay elements, outline nodes, bible entries)
  - Complex keyboard shortcut handling per mode
  - Rich feature set may require phased implementation

## Definition of Done

- [ ] All four writing modes implemented with core professional features
- [ ] Each mode provides authentic experience matching industry-standard applications
- [ ] Mode switching preserves content intelligently with appropriate conversions
- [ ] Integration requirements verified (TipTap, auto-save, localStorage)
- [ ] Existing functionality regression tested
- [ ] Code follows existing modular JavaScript patterns
- [ ] Tests pass (manual testing of all mode-specific features)
- [ ] Documentation updated with comprehensive mode guides

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Scope creep - each mode is essentially a mini-application
- **Mitigation:** Implement MVP features first for each mode, then iterate
- **Secondary Risk:** Content/data loss during complex format conversions
- **Mitigation:** Preview conversions, maintain undo history, warn about lossy conversions
- **Rollback:** Each mode can be feature-flagged independently

**Compatibility Verification:**

- [ ] No breaking changes to existing TipTap editor API
- [ ] localStorage structure remains backward compatible
- [ ] UI changes follow existing design patterns from Stories 1.1-1.4
- [ ] Performance impact is negligible (< 200ms format switch)

## Validation Checklist

**Scope Validation:**

- [ ] Story requires multiple development sessions due to complexity
- [ ] Each mode needs dedicated implementation time
- [ ] Integration approach requires careful planning for mode-specific features
- [ ] Follows existing modular JavaScript patterns but extends significantly
- [ ] No backend changes required but extensive frontend work needed

**Clarity Check:**

- [ ] Story requirements are unambiguous
- [ ] Integration points are clearly specified (TipTap, localStorage, toolbar)
- [ ] Success criteria are testable
- [ ] Rollback approach is simple (feature flag)

## Story Dependencies

- **Depends on:** Story 1.1 (TipTap Editor Integration)
- **Depends on:** Story 1.3 (Auto-save Implementation)
- **Optional:** Story 1.2 (Side-by-side Layout) - format switcher should work in both single and split views

## Estimated Effort

This is a significant feature that should likely be broken into sub-stories:

- **Story 1.5.1 - Core Mode Infrastructure:** 4-6 hours
  - Mode switching framework
  - Basic UI transformation system
  - Data model foundations

- **Story 1.5.2 - Screenplay Mode:** 8-10 hours
  - Final Draft-like features
  - Auto-formatting logic
  - Screenplay-specific shortcuts

- **Story 1.5.3 - Novel Mode:** 8-10 hours
  - Scrivener/Ulysses-like features
  - Chapter management
  - Manuscript formatting

- **Story 1.5.4 - Outline Mode:** 6-8 hours
  - WorkFlowy-like features
  - Nested bullet system
  - Focus/zoom functionality

- **Story 1.5.5 - Story Bible Mode:** 8-10 hours
  - World Anvil-like features
  - Template system
  - Cross-referencing

**Total Estimated:** 34-44 hours (should be an epic, not a single story)

## Implementation Notes

### Recommended Approach - Convert to Epic

Given the scope, this should be elevated to an Epic with multiple stories:

1. **Epic 1.5: Professional Writing Mode System**
   - Delivers complete writing environment transformations
   - Each mode provides industry-standard functionality
   - Phased delivery allows incremental value

2. **Implementation Priority:**
   - Start with mode infrastructure (Story 1.5.1)
   - Implement Screenplay mode first (most structured, clearest requirements)
   - Novel mode second (builds on basic editing)
   - Outline mode third (different interaction model)
   - Story Bible last (most complex data relationships)

3. **MVP per Mode:**
   - Focus on core differentiating features first
   - Add advanced features in subsequent iterations
   - Ensure each mode is useful even with basic features

### Alternative: Single Story with Phased Features

If keeping as one story, implement minimal viable version:
- Basic mode switcher with visual differentiation only
- One signature feature per mode (e.g., scene headings for screenplay)
- Gradually enhance each mode over time
- This approach risks delivering insufficient value