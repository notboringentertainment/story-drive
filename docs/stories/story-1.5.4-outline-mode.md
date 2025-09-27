# Story 1.5.4: Outline Mode Implementation - Brownfield Addition

## User Story

As a writer/planner,
I want a WorkFlowy-like outlining environment,
So that I can organize ideas hierarchically with infinite nesting and quick navigation.

## Story Context

**Existing System Integration:**

- Integrates with: Mode infrastructure from Story 1.5.1, TipTap editor core
- Technology: Vanilla JavaScript, custom tree structure, CSS3
- Follows pattern: Mode registration pattern established in Story 1.5.1
- Touch points: ModeManager, keyboard event system, localStorage

## Acceptance Criteria

**Functional Requirements:**

1. **Hierarchical Bullet Structure**
   - Infinite nesting levels (practical limit ~20)
   - TAB to indent, SHIFT+TAB to outdent
   - Bullet style changes by level (•, ◦, ▪, -, →)
   - Collapse/expand individual nodes
   - Collapse/expand all descendants

2. **Navigation & Manipulation**
   - Arrow keys navigate between bullets
   - ENTER creates new sibling bullet
   - CTRL+ENTER creates child bullet
   - BACKSPACE on empty bullet removes it
   - Drag-and-drop to reorder (including children)
   - Multi-select with SHIFT+click or CTRL+click

3. **Focus Mode**
   - Zoom into any bullet (shows only that branch)
   - Breadcrumb navigation showing zoom path
   - ESC or breadcrumb click to zoom out
   - Maintain zoom level in localStorage

4. **Search & Filter**
   - Real-time search across all bullets
   - Filter to show only matching branches
   - Highlight search terms
   - Search history

5. **Tags & Metadata**
   - Add #tags anywhere in bullet text
   - Click tag to filter by it
   - Tag autocomplete
   - Note attachment to any bullet (hidden by default)
   - Mark bullets as complete with strikethrough

**Integration Requirements:**

6. Registers with ModeManager as "outline" mode
7. Converts content intelligently from other modes
8. Stores outline structure in localStorage
9. Auto-save preserves hierarchy and collapsed states
10. Keyboard shortcuts don't conflict with other modes

## Technical Notes

### Implementation Architecture

```
/editor/modes/outline/
  outlineMode.js         # Main mode implementation
  outlineTree.js         # Tree data structure
  outlineRenderer.js     # DOM rendering logic
  outlineKeyboard.js     # Keyboard navigation
  outlineDragDrop.js     # Drag-and-drop handler
  outline.css           # Outline-specific styles
```

### Key Components

1. **Tree Node Structure**
   ```javascript
   {
     id: 'node-uuid',
     content: 'Bullet text with #tags',
     children: [...],
     collapsed: false,
     completed: false,
     note: 'Extended note text',
     metadata: {
       created: timestamp,
       modified: timestamp,
       tags: ['tag1', 'tag2']
     }
   }
   ```

2. **Focus Mode State**
   ```javascript
   {
     focusedNodeId: 'node-uuid',
     breadcrumbs: [
       {id: 'root', title: 'Home'},
       {id: 'node-1', title: 'Chapter 1'},
       {id: 'node-1-2', title: 'Scene 2'}
     ]
   }
   ```

3. **Keyboard Commands**
   ```
   TAB: Indent
   SHIFT+TAB: Outdent
   ENTER: New sibling
   CTRL+ENTER: New child
   SPACE: Toggle collapse (when on bullet)
   CTRL+UP/DOWN: Move node up/down
   ALT+ENTER: Zoom into node
   ESC: Zoom out
   CTRL+F: Search
   CTRL+SHIFT+C: Toggle complete
   ```

4. **Rendering Strategy**
   - Virtual scrolling for large outlines
   - Only render visible nodes
   - Lazy load children when expanded
   - Debounced updates

5. **Import/Export from Other Modes**
   - Novel: Chapters → Level 1, Scenes → Level 2
   - Screenplay: Scenes → Level 1, Beats → Level 2
   - Story Bible: Categories → Level 1, Entries → Level 2

## Definition of Done

- [ ] Infinite nesting with smooth indentation
- [ ] All keyboard shortcuts working
- [ ] Drag-and-drop reordering functional
- [ ] Focus mode with breadcrumbs
- [ ] Search and filter working
- [ ] Tags system implemented
- [ ] Note attachments working
- [ ] Collapse/expand with state persistence
- [ ] Mode integrates with ModeManager
- [ ] Content conversion from other modes
- [ ] Auto-save preserves full outline state

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Performance with very large outlines (10,000+ nodes)
- **Mitigation:** Virtual scrolling, lazy loading, indexed search
- **Secondary Risk:** Complex tree operations causing data loss
- **Mitigation:** Operation history, undo/redo system

**Compatibility Verification:**

- [ ] Doesn't conflict with TipTap key bindings
- [ ] Tree structure converts to linear text
- [ ] Drag-drop doesn't interfere with text selection
- [ ] Search performance acceptable

## Testing Scenarios

1. Create 10-level deep outline
2. 1000+ node outline performance
3. Drag node with 50+ children
4. Focus mode at various depths
5. Search with 100+ results
6. Convert novel chapters to outline
7. Convert outline to linear text
8. Collapse all/expand all with large tree
9. Multiple tag filtering
10. Undo/redo complex operations

## Estimated Effort

- **Development:** 6-8 hours
  - Tree structure & rendering: 2 hours
  - Keyboard navigation: 1.5 hours
  - Drag-and-drop: 1.5 hours
  - Focus mode & search: 1.5 hours
  - Tags & notes: 1 hour
  - Testing & optimization: 0.5-2.5 hours
- **Testing:** 1 hour
- **Documentation:** 30 minutes

## Dependencies

- **Required:** Story 1.5.1 (Mode Infrastructure) - must be complete
- **Uses:** TipTap for note editing only
- **Required:** Story 1.3 (Auto-save) - for outline persistence

## MVP vs Full Features

### MVP (This Story)
- Basic hierarchical bullets
- Keyboard navigation
- Collapse/expand
- Focus mode
- Basic search
- Tags

### Future Enhancements
- OPML import/export
- Markdown export
- Multiple columns view
- Mind map visualization
- Gantt chart view for timelines
- Collaborative editing
- Version history
- Templates
- Smart indent (maintain at current level)
- Bullet styles customization
- Themes

## Implementation Order

1. Create tree data structure
2. Build basic rendering engine
3. Implement keyboard navigation
4. Add collapse/expand functionality
5. Build drag-and-drop system
6. Implement focus mode
7. Add search and filter
8. Build tag system
9. Add note attachments
10. Optimize performance