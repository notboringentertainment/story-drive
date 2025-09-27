# Epic 1.5: Professional Writing Modes - Brownfield Enhancement

## Epic Goal

Transform the single-format editor into a multi-mode professional writing environment that replicates industry-standard writing applications, enabling writers to switch between specialized interfaces for screenplay, novel, outline, and story bible creation.

## Epic Description

**Existing System Context:**

- Current relevant functionality: TipTap editor with basic rich text editing (Story 1.1), auto-save to localStorage (Story 1.3), side-by-side layout support (Story 1.2)
- Technology stack: Vanilla JavaScript, HTML5, CSS3, TipTap editor framework, Express.js backend
- Integration points: TipTap editor instance, localStorage save system, toolbar components, main application layout

**Enhancement Details:**

- What's being added: Four professional writing modes that completely transform the UI/UX to match industry-standard applications (Final Draft, Scrivener/Ulysses, WorkFlowy, World Anvil)
- How it integrates: Mode switcher in toolbar triggers complete UI transformation while maintaining TipTap as core editing engine
- Success criteria: Each mode provides authentic professional writing experience with mode-specific features, shortcuts, and workflows

## Prerequisites - Design Sprint

**CRITICAL:** A design sprint must be completed before any development begins on this epic.

### Design Sprint Deliverables Required:
1. **UI/UX Mockups** - Detailed wireframes for each mode showing all states
2. **Interaction Patterns** - Document all keyboard shortcuts, navigation flows, and user interactions
3. **Visual Design System** - Color schemes, typography, spacing standards for each mode
4. **Responsive Breakpoints** - How each mode adapts to different screen sizes
5. **Accessibility Standards** - WCAG compliance requirements for each mode
6. **User Flow Diagrams** - Mode switching, data conversion, edge cases

### Design Sprint Timeline: 1 week (must complete before Story 1.5.1 begins)

## Stories

### Story 1.5.0: Storage Strategy Technical Spike
**Priority:** P0 - Must complete before any development
**Effort:** 2-4 hours
**Description:** Research and determine optimal storage strategy (localStorage vs IndexedDB) for handling large professional documents (>10MB). Create POC implementations, benchmark performance, and provide migration strategy.

### Story 1.5.1: Core Mode Infrastructure
**Priority:** P0 - Must complete before mode implementations
**Effort:** 4-6 hours
**Description:** Build the foundation for mode switching, including mode selector UI, state management, UI transformation framework, and data model extensions. This story enables all subsequent mode implementations.

### Story 1.5.2a: Screenplay Mode - Basic Features
**Priority:** P1
**Effort:** 4-5 hours
**Description:** Implement core screenplay formatting: scene headings, action lines, character names, dialogue, basic TAB navigation, and Courier font with proper margins.

### Story 1.5.2b: Screenplay Mode - Advanced Features
**Priority:** P2
**Effort:** 4-5 hours
**Description:** Add advanced screenplay features: character auto-complete, parentheticals, transitions, dual dialogue, page indicators, scene navigation sidebar.

### Story 1.5.3a: Novel Mode - Basic Features
**Priority:** P1
**Effort:** 4-5 hours
**Description:** Create basic novel environment with chapter organization, word count tracking, focus mode, and manuscript formatting.

### Story 1.5.3b: Novel Mode - Advanced Features
**Priority:** P2
**Effort:** 4-5 hours
**Description:** Add advanced novel features: drag-drop chapters, scene management, daily goals with history, typewriter mode, metadata tracking, analytics.

### Story 1.5.4: Outline Mode (WorkFlowy-like)
**Priority:** P2
**Effort:** 6-8 hours
**Description:** Build hierarchical outlining system with infinite nested bullets, drag-and-drop reordering, collapse/expand functionality, focus mode (zoom into bullets), tags/filtering, and keyboard navigation.

### Story 1.5.5: Story Bible Mode (World Anvil-like)
**Priority:** P2
**Effort:** 8-10 hours
**Description:** Develop story bible/world-building environment with template-based entries (characters, locations, timeline), relationship mapping, categorized sections, quick search, and wiki-style cross-referencing.

## Timeline & Effort Estimates

### Original Estimate vs Revised Estimate
- **Original (as single story):** 4-6 hours (severely underestimated)
- **Initial Epic Estimate:** 34-44 hours
- **Revised Epic Estimate:** 40-52 hours (includes spike and splits)
- **With Buffer (20%):** 48-62 hours

### Sprint Planning Recommendations

**Sprint 0: Design & Research (1 week)**
- Design Sprint for all modes
- Story 1.5.0: Storage Spike (2-4 hrs)

**Sprint 1: Foundation (1 week)**
- Story 1.5.1: Mode Infrastructure (4-6 hrs)
- Story 1.5.2a: Screenplay Basic (4-5 hrs)
- Story 1.5.3a: Novel Basic (4-5 hrs)

**Sprint 2: Core Modes Enhanced (1 week)**
- Story 1.5.2b: Screenplay Advanced (4-5 hrs)
- Story 1.5.3b: Novel Advanced (4-5 hrs)
- Begin Story 1.5.4: Outline Mode (6-8 hrs)

**Sprint 3: Planning Tools (1 week)**
- Complete Story 1.5.4: Outline Mode
- Story 1.5.5: Story Bible Mode (8-10 hrs)
- Integration testing & bug fixes

**Total Timeline:** 4 weeks (1 design, 3 development)

## Compatibility Requirements

- [x] Existing TipTap editor APIs remain functional
- [x] localStorage schema supports mode-specific metadata without breaking existing saves
- [x] UI transformations respect existing layout patterns (single and side-by-side views)
- [x] Performance remains responsive (mode switches < 500ms, typing latency < 50ms)
- [x] All existing Stories 1.1-1.4 features continue working in each mode

## Risk Mitigation

- **Primary Risk:** Scope creep - each mode could expand infinitely with features
- **Mitigation:** Define MVP feature set per mode, implement core differentiators first, gather user feedback before adding advanced features
- **Secondary Risk:** Complex state management across modes causing data loss
- **Mitigation:** Implement robust conversion layer, maintain undo history, preview conversions before applying
- **Rollback Plan:** Each mode can be disabled via feature flag in localStorage; mode selector can be hidden if critical issues arise

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] Each mode provides authentic professional writing experience
- [ ] Mode switching preserves content integrity with appropriate conversions
- [ ] Existing editor functionality verified in all modes
- [ ] Integration with auto-save and localStorage working correctly
- [ ] Performance benchmarks met (switch time, typing latency)
- [ ] Documentation created for each mode's features and shortcuts
- [ ] No regression in Stories 1.1-1.4 functionality

## Technical Architecture Overview

```
Application
├── Mode Manager (new)
│   ├── Mode Switcher UI
│   ├── Mode State Controller
│   └── Content Converter
├── Writing Modes (new)
│   ├── Screenplay Module
│   ├── Novel Module
│   ├── Outline Module
│   └── Story Bible Module
└── Core Systems (existing)
    ├── TipTap Editor (enhanced)
    ├── Auto-save System
    └── Layout Manager
```

## Success Metrics

1. Users can switch between all four modes without data loss
2. Each mode's core features match professional tool expectations
3. Mode-specific shortcuts and workflows function correctly
4. Content conversions handle edge cases gracefully
5. System maintains < 500ms mode switch time
6. No increase in bug reports for existing features

## Dependencies

- **Required:** Story 1.1 (TipTap Editor) must be complete
- **Required:** Story 1.3 (Auto-save) must be complete
- **Optional:** Story 1.2 (Side-by-side Layout) - modes should work with or without
- **External:** No external service dependencies

## Notes for Development Team

- Start with Story 1.5.1 to establish the framework
- Each mode should be developed in isolation after infrastructure is ready
- Focus on MVP features that differentiate each mode
- Consider progressive enhancement approach for advanced features
- Maintain vanilla JavaScript approach (no build tools required)
- Test mode switching extensively with various content types
- Document keyboard shortcuts and mode-specific behaviors