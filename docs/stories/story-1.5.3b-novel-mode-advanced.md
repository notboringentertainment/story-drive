# Story 1.5.3b: Novel Mode Advanced Features

## Status
Draft

## Story
**As a** novelist,
**I want** advanced organizational features and writing analytics,
**so that** I can track detailed progress, organize complex narratives, and maintain a professional writing workflow

## Acceptance Criteria
1. Advanced Chapter Features - Drag-and-drop chapter reordering, scene subdivision within chapters, chapter numbering options
2. Daily Word Count Goals - Set daily targets, progress bars, 7-day history graph, session timer and tracking
3. Advanced Writing Modes - Typewriter mode (center current line), full-screen mode, dark/light theme toggle
4. Metadata & Research - Character list with quick insert, location tracking, research notes sidebar, scene tags
5. Chapter Summaries - Add summary/synopsis per chapter, collapsible in sidebar view
6. Advanced Word Analytics - Words per session, average words per day, projected completion date
7. Side-by-side View Compatibility - Work with Story 1.2 for outline alongside chapter
8. Export Statistics - Generate word count reports, progress summaries

## Tasks / Subtasks
- [ ] Implement drag-and-drop chapters (AC: 1)
  - [ ] Add drag handles to chapter items
  - [ ] Implement drop zones and reorder logic
  - [ ] Update data model on reorder
  - [ ] Animate reorder transitions

- [ ] Build scene management (AC: 1)
  - [ ] Add scene subdivision within chapters
  - [ ] Scene CRUD operations
  - [ ] Scene-level word counts
  - [ ] Scene navigation

- [ ] Create goal tracking system (AC: 2, 6)
  - [ ] Daily goal setting UI
  - [ ] Progress bar component
  - [ ] Session timer implementation
  - [ ] 7-day history chart (Canvas or SVG)
  - [ ] Calculate completion projections

- [ ] Add advanced writing modes (AC: 3)
  - [ ] Typewriter mode (scroll management)
  - [ ] Full-screen API implementation
  - [ ] Theme toggle for novel mode
  - [ ] Save mode preferences

- [ ] Build metadata system (AC: 4, 5)
  - [ ] Character/location registries
  - [ ] Quick-insert dropdowns
  - [ ] Research notes panel
  - [ ] Scene tagging system
  - [ ] Chapter summary fields

- [ ] Implement analytics (AC: 6, 8)
  - [ ] Session tracking logic
  - [ ] Statistical calculations
  - [ ] Export report generation
  - [ ] Progress visualization

- [ ] Side-by-side integration (AC: 7)
  - [ ] Test with outline mode
  - [ ] Adjust layouts for split view
  - [ ] Sync scroll positions
  - [ ] Handle mode switching in split view

## Dev Notes

### Testing Standards
- Performance tests with 100+ chapters
- Visual regression tests for drag-and-drop
- Test typewriter mode with various fonts/sizes
- Integration tests with side-by-side view

### Technical Architecture
```javascript
// Enhanced chapter structure
{
  chapters: [
    {
      id: 'ch-1',
      title: 'Chapter 1',
      number: 1, // manual or auto
      summary: 'Chapter synopsis...',
      scenes: [
        {
          id: 'sc-1-1',
          title: 'Opening',
          content: '...',
          wordCount: 1543,
          tags: ['introduction', 'protagonist']
        }
      ],
      wordCount: 3421
    }
  ],
  metadata: {
    characters: ['Alice', 'Bob'],
    locations: ['New York', 'Paris'],
    dailyGoal: 1000,
    sessionStart: Date,
    sessionWords: 543
  },
  statistics: {
    dailyHistory: [
      {date: '2025-09-21', words: 1523}
    ],
    totalSessions: 45,
    averageWordsPerDay: 1234
  }
}
```

### UI Components
```
┌────────────────────────────┐
│ Chapters │ Research │ Stats │
├──────────────────────────────
│ ▼ Ch 1: Opening    [≡] 1.5k │
│   • Scene 1         500w │
│   • Scene 2         1000w │
│ ▶ Ch 2: Rising...  [≡] 2.3k │
│                              │
│ [+ Add Chapter]              │
│                              │
│ Daily Goal: ████░░░ 750/1000│
└──────────────────────────────
```

### Performance Targets
- Drag-drop response < 16ms (60fps)
- Word count calculation < 100ms
- Chapter switch < 50ms
- Support 500+ chapters

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