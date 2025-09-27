# Story 1.2: Side-by-Side Layout Implementation - Brownfield Addition

## User Story

As a writer,
I want to see my document and agent chat side-by-side,
So that I can write while consulting AI agents.

## Story Context

**Existing System Integration:**

- Integrates with: Current single-column layout, agent chat container, new editor module
- Technology: CSS3 Grid/Flexbox, vanilla JavaScript for interactions
- Follows pattern: Responsive design patterns, existing CSS class naming conventions
- Touch points: Main application container, agent chat wrapper, editor container

## Acceptance Criteria

**Functional Requirements:**

1. Document editor displays at 60% width on desktop, agent chat at 40%
2. Draggable divider allows adjustment of split ratio between 30%-70% for each panel
3. Layout automatically stacks vertically on screens <768px width

**Integration Requirements:**

4. Existing agent chat panel maintains all current functionality
5. New layout follows existing responsive design patterns
6. Integration with current CSS framework maintains visual consistency
7. Agent messages continue to appear correctly without overflow issues

**Quality Requirements:**

8. Layout change is covered by visual regression tests
9. Documentation updated with layout customization options
10. No regression in agent chat UX verified through user testing
11. Both panels scroll independently without affecting each other
12. Layout preference persists across sessions via localStorage

## Technical Notes

- **Integration Approach:** Wrap existing containers in new flexbox parent, preserve existing DOM structure internally
- **Existing Pattern Reference:** Follow responsive patterns from existing navigation menu implementation
- **Key Constraints:** Must maintain existing CSS class names for agent chat, preserve all existing JavaScript event bindings

## Implementation Details

```css
/* Layout structure following existing patterns */
.app-layout {
  display: flex;
  height: 100vh;
  gap: var(--spacing-md);
}

.editor-panel {
  flex: 0 0 60%;
  min-width: 30%;
  max-width: 70%;
  overflow-y: auto;
}

.chat-panel {
  flex: 0 0 40%;
  min-width: 30%;
  max-width: 70%;
  overflow-y: auto;
}

.layout-divider {
  width: 4px;
  cursor: col-resize;
  background: var(--color-border);
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .editor-panel,
  .chat-panel {
    flex: 1 1 auto;
    max-width: 100%;
  }
}
```

```javascript
// Draggable divider implementation
const LayoutManager = {
  init: function() {
    this.divider = document.querySelector('.layout-divider');
    this.leftPanel = document.querySelector('.editor-panel');
    this.rightPanel = document.querySelector('.chat-panel');
    this.setupDragHandlers();
    this.restoreLayout();
  },

  setupDragHandlers: function() {
    let isResizing = false;

    this.divider.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const containerWidth = this.divider.parentElement.offsetWidth;
      const leftWidth = (e.clientX / containerWidth) * 100;

      if (leftWidth >= 30 && leftWidth <= 70) {
        this.leftPanel.style.flex = `0 0 ${leftWidth}%`;
        this.rightPanel.style.flex = `0 0 ${100 - leftWidth}%`;
        this.saveLayout(leftWidth);
      }
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = '';
    });
  }
};
```

## Testing Approach

1. **Visual Tests:**
   - Layout renders correctly at various screen sizes
   - Divider drag functionality works smoothly
   - Responsive breakpoint triggers correctly

2. **Integration Tests:**
   - Agent chat continues to function in new layout
   - Editor content remains accessible
   - Layout preference persistence works

3. **Cross-browser Tests:**
   - Chrome, Firefox, Safari, Edge compatibility
   - Mobile responsiveness on iOS/Android

## Definition of Done

- [x] Functional requirements met (split layout, draggable, responsive)
- [x] Integration requirements verified (chat works, patterns followed)
- [x] Existing agent chat functionality preserved
- [x] Code follows existing CSS conventions
- [x] Visual regression tests pass
- [x] Documentation updated with layout options
- [x] Tested on all supported browsers
- [x] Layout preferences persist correctly

## Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** Layout change breaks existing agent chat positioning or scrolling
- **Mitigation:** Preserve internal structure of chat container, only modify wrapper
- **Rollback:** Remove layout wrapper, restore original single-column CSS

**Compatibility Verification:**

- [x] No breaking changes to existing APIs
- [x] No database changes required
- [x] UI changes follow existing design patterns
- [x] Performance impact is negligible (CSS-only changes)

## Deployment Notes

- Can be deployed with Story 1.1 as part of editor feature
- No separate feature flag needed (controlled by editor flag)
- Monitor for CSS-related console errors
- Check analytics for mobile vs desktop usage patterns

## Estimation

- **Development:** 3 hours
- **Testing:** 2 hours
- **Cross-browser testing:** 1 hour
- **Total:** 6 hours (1 day)