# Story 1.5.3a: Novel Mode Basic Features

## Status
Draft

## Story
**As a** novelist,
**I want** basic chapter organization and word count tracking,
**so that** I can structure my novel and monitor my writing progress

## Acceptance Criteria
1. Chapter & Scene Organization - Sidebar with chapter list, add/delete/rename chapters, navigate between chapters
2. Basic Word Count - Live total word count, word count per chapter display
3. Simple Manuscript Formatting - First-line paragraph indentation, scene breaks (***), basic double-spacing option
4. Focus Mode - Hide all UI except text editor for distraction-free writing
5. Chapter Structure Storage - Auto-save includes chapter organization
6. Mode Registration - Registers with ModeManager as "novel" mode
7. Content Preservation - Maintains text when switching between modes

## Tasks / Subtasks
- [ ] Setup novel mode structure (AC: 6)
  - [ ] Create /editor/modes/novel/ directory
  - [ ] Create novelMode.js with mode registration
  - [ ] Add novel.css for formatting
  - [ ] Register with ModeManager

- [ ] Implement chapter data model (AC: 1, 5)
  - [ ] Define chapter/scene structure
  - [ ] Create chapterManager.js
  - [ ] Implement add/delete/rename methods
  - [ ] Connect to auto-save system

- [ ] Build chapter sidebar (AC: 1)
  - [ ] Create collapsible chapter list component
  - [ ] Add chapter CRUD UI controls
  - [ ] Implement navigation click handlers
  - [ ] Show current chapter indicator

- [ ] Add word counting (AC: 2)
  - [ ] Create wordCounter.js module
  - [ ] Display total word count in UI
  - [ ] Calculate per-chapter counts
  - [ ] Update counts on text changes (debounced)

- [ ] Implement focus mode (AC: 4)
  - [ ] Create focus mode toggle button
  - [ ] Hide all UI elements except editor
  - [ ] Add keyboard shortcut (e.g., F11)
  - [ ] Maintain escape key to exit

- [ ] Add manuscript formatting (AC: 3)
  - [ ] Style first-line indentation
  - [ ] Implement scene break insertion
  - [ ] Add double-spacing toggle
  - [ ] Test print preview

## Dev Notes

### Testing Standards
- Unit tests in `src/__tests__/editor/modes/novel/`
- Test chapter CRUD operations
- Verify word count accuracy
- Test focus mode toggle
- Integration test with ModeManager

### Technical Architecture
```javascript
// Chapter structure
{
  chapters: [
    {
      id: 'ch-1',
      title: 'Chapter 1',
      content: '...', // TipTap content
      wordCount: 1543,
      created: Date,
      modified: Date
    }
  ],
  currentChapter: 'ch-1',
  metadata: {
    totalWordCount: 15430
  }
}
```

### Dependencies
- Story 1.5.1 must be complete (Mode Infrastructure)
- TipTap editor from Story 1.1
- Auto-save from Story 1.3

### Performance Requirements
- Word count updates debounced to 500ms
- Chapter switching < 100ms
- Support documents up to 500k words

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-21 | 1.0 | Split from original 1.5.3 story | Bob (Scrum Master) |

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