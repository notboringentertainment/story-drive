# Story 1.5.2: Screenplay Mode Implementation - Brownfield Addition

## User Story

As a screenwriter,
I want a Final Draft-like screenplay writing environment,
So that I can write properly formatted scripts with industry-standard formatting and navigation.

## Story Context

**Existing System Integration:**

- Integrates with: Mode infrastructure from Story 1.5.1, TipTap editor, auto-save system
- Technology: Vanilla JavaScript, TipTap extensions, CSS3
- Follows pattern: Mode registration pattern established in Story 1.5.1
- Touch points: ModeManager, TipTap instance, toolbar, keyboard event system

## Acceptance Criteria

**Functional Requirements:**

1. **Scene Heading Formatting**
   - Auto-complete INT./EXT. when starting a scene
   - Auto-capitalize location names
   - DAY/NIGHT suggestions
   - Format: INT. LOCATION - TIME

2. **Character & Dialogue System**
   - TAB after empty line jumps to character name (auto-centered, uppercase)
   - Character name auto-complete from previously used names
   - ENTER after character name moves to dialogue (indented)
   - Parentheticals support (centered, in parentheses)
   - Dual dialogue columns support

3. **Action Lines**
   - Standard paragraph formatting
   - Auto-wrap at proper column width
   - No indentation

4. **Transitions**
   - CUT TO:, FADE IN:, FADE OUT: auto-format (right-aligned)
   - Quick insert via menu or shortcut

5. **Navigation**
   - TAB/SHIFT+TAB cycles through element types
   - ENTER behavior changes based on current element
   - Smart cursor positioning

**Formatting Requirements:**

6. Courier 12pt font throughout
7. Industry-standard margins:
   - Left: 1.5"
   - Right: 1"
   - Top: 1"
   - Bottom: 1"
8. Character names: 3.7" from left
9. Dialogue: 2.5" from left, 2" from right
10. Parentheticals: 3.1" from left
11. Page break indicators every ~55 lines

**Integration Requirements:**

12. Registers with ModeManager as "screenplay" mode
13. Preserves content when switching from other modes
14. Stores screenplay-specific metadata (character list, scene list)
15. Auto-save includes element type information

## Technical Notes

### Implementation Architecture

```
/editor/modes/screenplay/
  screenplayMode.js       # Main mode implementation
  screenplayElements.js   # Element type definitions
  screenplayFormatter.js  # Auto-formatting logic
  screenplayKeyboard.js   # Keyboard navigation
  screenplay.css         # Screenplay-specific styles
```

### Key Components

1. **Element Types Enum**
   ```javascript
   const ElementTypes = {
     SCENE_HEADING: 'scene-heading',
     ACTION: 'action',
     CHARACTER: 'character',
     DIALOGUE: 'dialogue',
     PARENTHETICAL: 'parenthetical',
     TRANSITION: 'transition',
     SHOT: 'shot'
   }
   ```

2. **TipTap Extensions**
   - Custom node types for each screenplay element
   - Keyboard handling extension
   - Auto-format extension

3. **Smart TAB Navigation**
   ```
   Empty line → TAB → Character name
   Character → TAB → Parenthetical
   Character → ENTER → Dialogue
   Dialogue → TAB → Character (dual dialogue)
   Any → SHIFT+TAB → Previous element type
   ```

4. **Character Tracking**
   - Auto-complete list built from document
   - Stores in modeData.screenplay.characters
   - Quick character insert menu

5. **Scene Navigation**
   - Scene list sidebar (collapsible)
   - Jump to scene functionality
   - Scene numbering (optional)

## Definition of Done

- [ ] All screenplay element types format correctly
- [ ] TAB/ENTER navigation works as specified
- [ ] Courier font and proper margins applied
- [ ] Character auto-complete functioning
- [ ] Scene heading auto-format working
- [ ] Transitions properly aligned
- [ ] Page break indicators shown
- [ ] Mode integrates with ModeManager
- [ ] Content preserved when switching modes
- [ ] Auto-save includes screenplay metadata
- [ ] Keyboard shortcuts documented

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Complex keyboard handling conflicts with browser/OS shortcuts
- **Mitigation:** Carefully scope keyboard capture, provide escape hatch
- **Secondary Risk:** Formatting complexity impacts performance
- **Mitigation:** Debounce formatting, use efficient algorithms

**Compatibility Verification:**

- [ ] TipTap editor remains stable with extensions
- [ ] Auto-save handles screenplay metadata
- [ ] Mode switching preserves text content
- [ ] Performance acceptable with long scripts

## Testing Scenarios

1. Write complete scene with all element types
2. TAB navigation through full cycle
3. Character name auto-complete
4. Scene heading auto-formatting
5. Switch from novel mode with prose text
6. Switch to outline mode and back
7. Page break calculation with 100+ pages
8. Dual dialogue creation
9. Copy/paste from Final Draft
10. Export to fountain format (future)

## Estimated Effort

- **Development:** 8-10 hours
  - Element types & formatting: 3 hours
  - Keyboard navigation: 2 hours
  - Auto-complete systems: 2 hours
  - UI components: 2 hours
  - Testing & refinement: 1-3 hours
- **Testing:** 1.5 hours
- **Documentation:** 30 minutes

## Dependencies

- **Required:** Story 1.5.1 (Mode Infrastructure) - must be complete
- **Required:** Story 1.1 (TipTap Editor) - core editing engine
- **Required:** Story 1.3 (Auto-save) - for screenplay metadata

## MVP vs Full Features

### MVP (This Story)
- Basic element types and formatting
- TAB/ENTER navigation
- Character auto-complete
- Scene heading format
- Page indicators

### Future Enhancements
- Import/export Fountain format
- Import/export FDX (Final Draft)
- Production features (scene numbers, revisions)
- Character reports
- Scene reports
- Smart type-ahead for locations
- Dual dialogue visual editor
- Notes and annotations
- Title page

## Implementation Order

1. Set up screenplay mode structure
2. Implement element types as TipTap nodes
3. Add CSS for proper formatting
4. Build keyboard navigation system
5. Add auto-formatting logic
6. Implement character tracking
7. Create scene list component
8. Add page break indicators
9. Test with real screenplay content
10. Polish and optimize