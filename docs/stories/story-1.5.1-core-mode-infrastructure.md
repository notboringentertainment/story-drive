# Story 1.5.1: Core Mode Infrastructure - Brownfield Addition

## User Story

As a developer,
I want to implement the core infrastructure for mode switching,
So that different professional writing modes can be built on top of this foundation.

## Story Context

**Existing System Integration:**

- Integrates with: TipTap editor instance, toolbar components, localStorage system
- Technology: Vanilla JavaScript, HTML5, CSS3, TipTap framework
- Follows pattern: Modular JavaScript pattern with event-driven UI updates
- Touch points: Main application container, editor toolbar, save system, CSS framework

## Acceptance Criteria

**Functional Requirements:**

1. Mode selector dropdown appears in editor toolbar with placeholder options (Screenplay, Novel, Outline, Story Bible)
2. Mode state persists to localStorage and restores on page reload
3. Mode switching triggers UI transformation events that other modules can listen to
4. Content preservation layer ensures text is maintained during mode switches

**Integration Requirements:**

5. Existing TipTap editor continues to function as the core editing engine
6. Auto-save system from Story 1.3 continues working with mode metadata
7. Side-by-side layout from Story 1.2 remains functional
8. Mode infrastructure follows existing modular JavaScript patterns

**Technical Requirements:**

9. Mode manager module exposes clean API for mode registration
10. Event system allows modes to hook into switch events
11. CSS class system enables mode-specific styling
12. Data model supports mode-specific metadata without breaking existing saves

## Technical Notes

- **Architecture:** Create ModeManager singleton that coordinates all mode operations
- **State Management:** Use localStorage with versioned schema for backward compatibility
- **UI Framework:** CSS class-based theming with data-mode attribute on root element
- **Event System:** Custom events for mode-will-change, mode-did-change
- **Content Conversion:** Abstract content adapter interface for future mode implementations

## Implementation Details

### File Structure
```
/editor/
  modes/
    modeManager.js       # Core mode switching logic
    modeRegistry.js      # Mode registration system
    contentAdapter.js    # Content conversion interface
  modes.css             # Mode-specific styling hooks
```

### Key Components

1. **ModeManager**
   - `getCurrentMode()`: Returns active mode
   - `switchMode(modeName)`: Triggers mode change
   - `registerMode(modeConfig)`: Allows modes to register themselves
   - `addEventListener(event, callback)`: Hook into mode events

2. **Mode Selector UI**
   - Dropdown in toolbar
   - Visual indicator of current mode
   - Disabled state during mode transitions

3. **Content Adapter**
   - `canConvert(fromMode, toMode)`: Check if conversion is possible
   - `convert(content, fromMode, toMode)`: Perform conversion
   - `getWarnings(content, fromMode, toMode)`: List potential data loss

4. **Storage Schema**
   ```javascript
   {
     version: 2,  // Schema version
     mode: "novel",  // Current mode
     content: {...},  // TipTap content
     modeData: {  // Mode-specific data
       novel: {...},
       screenplay: {...}
     },
     lastModified: timestamp
   }
   ```

## Definition of Done

- [ ] Mode selector UI integrated into toolbar
- [ ] Mode state persists and restores correctly
- [ ] Mode switching events fire reliably
- [ ] Content preservation verified during switches
- [ ] Existing features continue working (editor, save, layout)
- [ ] API documented for mode developers
- [ ] CSS hooks established for mode styling
- [ ] Manual testing covers all switching scenarios

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Breaking existing localStorage saves
- **Mitigation:** Implement versioned schema with migration logic
- **Rollback:** Mode selector can be hidden; app defaults to basic editor mode

**Compatibility Verification:**

- [ ] Existing saves load correctly with new schema
- [ ] TipTap editor functions unchanged
- [ ] Auto-save continues working
- [ ] No performance degradation

## Testing Scenarios

1. Fresh load with no existing data
2. Load with existing Story 1.1-1.3 saves
3. Mode switch with unsaved changes
4. Mode switch with empty document
5. Mode switch with large document
6. Rapid mode switching
7. Browser refresh mid-switch
8. localStorage quota exceeded

## Estimated Effort

- **Development:** 4-6 hours
- **Testing:** 1 hour
- **Documentation:** 30 minutes

## Dependencies

- **Required:** Story 1.1 (TipTap Editor) - need editor instance
- **Required:** Story 1.3 (Auto-save) - must integrate with save system
- **Optional:** Story 1.2 (Side-by-side) - should work but not required

## Notes for Next Stories

This infrastructure enables Stories 1.5.2-1.5.5 to:
- Register their modes with the manager
- Hook into mode switch events
- Add mode-specific UI components
- Store mode-specific data
- Implement content conversions