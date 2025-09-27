# Story 1.5.2b: Screenplay Mode Advanced Features

## Status
Draft

## Story
**As a** screenwriter,
**I want** advanced screenplay features including auto-complete, smart navigation, and professional formatting aids,
**so that** I can write scripts efficiently with full Final Draft-like capabilities

## Acceptance Criteria
1. Character name auto-complete from previously used names
2. Smart TAB navigation with full element cycle (Character → Parenthetical → Dialogue → Dual Dialogue)
3. Parentheticals support (centered, in parentheses, proper indentation at 3.1" from left)
4. Transitions (CUT TO:, FADE IN:, FADE OUT:) with right-alignment and quick insert
5. Dual dialogue columns support with visual layout
6. Page break indicators every ~55 lines
7. Scene list sidebar with jump-to-scene functionality
8. Screenplay-specific metadata storage (character list, scene list)
9. Auto-save includes element type information and metadata

## Tasks / Subtasks
- [ ] Implement character tracking system (AC: 1, 8)
  - [ ] Build character name registry
  - [ ] Create auto-complete dropdown component
  - [ ] Track character usage frequency
  - [ ] Store in modeData.screenplay.characters

- [ ] Enhance TAB navigation (AC: 2)
  - [ ] Add parenthetical element support
  - [ ] Implement dual dialogue detection
  - [ ] Add SHIFT+TAB for reverse navigation
  - [ ] Create smart context detection

- [ ] Add parentheticals and transitions (AC: 3, 4)
  - [ ] Create parenthetical TipTap node
  - [ ] Create transition TipTap node
  - [ ] Implement transition alignment logic
  - [ ] Add transition quick-insert menu

- [ ] Implement dual dialogue (AC: 5)
  - [ ] Create dual dialogue container node
  - [ ] Build side-by-side layout CSS
  - [ ] Handle TAB to create dual
  - [ ] Manage editing in dual columns

- [ ] Add page indicators (AC: 6)
  - [ ] Calculate lines per element type
  - [ ] Display page break markers
  - [ ] Update on content changes
  - [ ] Show current page number

- [ ] Create scene navigation (AC: 7)
  - [ ] Build scene list sidebar component
  - [ ] Extract scenes from document
  - [ ] Implement jump-to-scene
  - [ ] Add scene search/filter

- [ ] Enhance metadata and auto-save (AC: 8, 9)
  - [ ] Extend auto-save with screenplay data
  - [ ] Store element type per block
  - [ ] Save character and scene lists
  - [ ] Include page count metadata

## Dev Notes

### Testing Standards
- Unit tests in `src/__tests__/editor/modes/screenplay/`
- Performance tests for auto-complete with 100+ characters
- Visual regression tests for dual dialogue layout
- Integration tests with auto-save system

### Technical Architecture
```javascript
// Character tracking
class CharacterRegistry {
  constructor() {
    this.characters = new Map(); // name -> {count, lastUsed}
  }

  getSuggestions(partial) {
    // Return sorted by frequency and recency
  }
}

// Page calculation
const LINES_PER_PAGE = 55;
const LINE_HEIGHTS = {
  'scene-heading': 2,
  'action': 1,
  'character': 1,
  'dialogue': 1,
  'parenthetical': 1,
  'transition': 2
};
```

### Dependencies
- Story 1.5.2a must be complete (Basic Screenplay)
- Auto-save system from Story 1.3
- ModeManager from Story 1.5.1

### Performance Considerations
- Auto-complete should respond in <100ms
- Scene list should handle 200+ scenes
- Page calculation should debounce
- Character tracking capped at 500 unique names

### UI Components
```
┌─────────────────────────────┐
│ [≡] Scenes │ Text Editor    │
├────────────┼─────────────────┤
│ • INT. CAFE│                 │
│ • EXT. PARK│  INT. CAFE - DAY│
│ • INT. HOME│                 │
│            │  Two friends... │
│ [Search...] │                 │
└────────────┴─────────────────┘
```

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-21 | 1.0 | Split from original 1.5.2 story | Bob (Scrum Master) |

## Dev Agent Record
*To be populated during implementation*

### Agent Model Used
*TBD*

### Debug Log References
*TBD*

### Completion Notes List
*TBD*

### File List
*TBD*

## QA Results
*To be completed after implementation*