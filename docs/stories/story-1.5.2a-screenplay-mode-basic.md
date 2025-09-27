# Story 1.5.2a: Screenplay Mode Basic Features

## Status
Draft

## Story
**As a** screenwriter,
**I want** basic Final Draft-like formatting with core screenplay elements,
**so that** I can write properly formatted scripts with essential industry-standard formatting

## Acceptance Criteria
1. Scene Heading Formatting - Auto-complete INT./EXT., auto-capitalize locations, DAY/NIGHT suggestions
2. Action Lines - Standard paragraph formatting with proper margins
3. Character Names - Centered, uppercase, proper positioning
4. Basic Dialogue - Proper indentation and width constraints
5. Basic TAB Navigation - TAB to move between element types in logical order
6. Courier 12pt font with industry-standard margins (Left: 1.5", Right: 1", Top/Bottom: 1")
7. Mode registration with ModeManager as "screenplay"
8. Content preservation when switching from other modes

## Tasks / Subtasks
- [ ] Setup screenplay mode structure (AC: 7)
  - [ ] Create /editor/modes/screenplay/ directory
  - [ ] Create screenplayMode.js with mode registration
  - [ ] Add screenplay.css for formatting
  - [ ] Register with ModeManager

- [ ] Implement core element types (AC: 1, 2, 3, 4)
  - [ ] Create scene heading TipTap node
  - [ ] Create action line TipTap node
  - [ ] Create character name TipTap node
  - [ ] Create dialogue TipTap node
  - [ ] Define element type enum

- [ ] Apply screenplay formatting (AC: 6)
  - [ ] Set Courier 12pt font
  - [ ] Configure proper margins in CSS
  - [ ] Style each element type with correct positioning
  - [ ] Test print preview matches standards

- [ ] Implement basic navigation (AC: 5)
  - [ ] TAB handler for element type cycling
  - [ ] ENTER behavior based on current element
  - [ ] Basic cursor positioning logic

- [ ] Mode switching integration (AC: 7, 8)
  - [ ] Implement content adapter from prose
  - [ ] Test content preservation
  - [ ] Handle edge cases in conversion

## Dev Notes

### Testing Standards
- Unit tests in `src/__tests__/editor/modes/screenplay/`
- Use Vitest framework
- Test each element type formatting
- Test keyboard navigation sequences
- Integration test with ModeManager

### Technical Architecture
```javascript
// Element positioning (CSS)
.screenplay-character {
  margin-left: 3.7in;
  text-align: center;
}
.screenplay-dialogue {
  margin-left: 2.5in;
  margin-right: 2in;
}
.screenplay-scene {
  text-transform: uppercase;
}
```

### Dependencies
- Story 1.5.1 must be complete (Mode Infrastructure)
- TipTap editor from Story 1.1
- ModeManager singleton pattern

### Acceptance Testing Script
1. Create new document in screenplay mode
2. Type scene heading "int. coffee shop - day"
3. Verify auto-capitalization to "INT. COFFEE SHOP - DAY"
4. Press ENTER, type action line
5. Press TAB, type character name
6. Press ENTER, type dialogue
7. Switch to novel mode and back
8. Verify content preserved

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