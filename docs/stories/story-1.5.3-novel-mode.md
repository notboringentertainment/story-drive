# Story 1.5.3: Novel Mode Implementation - Brownfield Addition

## User Story

As a novelist,
I want a Scrivener/Ulysses-like novel writing environment,
So that I can organize chapters and scenes, track word counts, and focus on long-form narrative writing.

## Story Context

**Existing System Integration:**

- Integrates with: Mode infrastructure from Story 1.5.1, TipTap editor, auto-save system
- Technology: Vanilla JavaScript, TipTap extensions, CSS3
- Follows pattern: Mode registration pattern established in Story 1.5.1
- Touch points: ModeManager, TipTap instance, sidebar components, localStorage

## Acceptance Criteria

**Functional Requirements:**

1. **Chapter & Scene Organization**
   - Sidebar with expandable chapter list
   - Drag-and-drop reordering of chapters/scenes
   - Add/delete/rename chapters and scenes
   - Visual indication of current chapter/scene
   - Quick navigation between sections

2. **Word Count Tracking**
   - Live word count display (current session, total)
   - Daily word count goal setting
   - Progress bar for goals
   - Word count per chapter/scene
   - Historical word count graph (7-day)

3. **Writing Modes**
   - Focus mode: Hide all UI except text
   - Typewriter mode: Keep current line centered
   - Full-screen mode: Maximize writing area
   - Dark/light theme toggle for novel mode

4. **Manuscript Features**
   - Chapter numbering (automatic or manual)
   - Scene breaks (*** or ###)
   - First-line indentation for paragraphs
   - Proper manuscript formatting (double-space option)
   - Title page information

5. **Metadata Tracking**
   - Character list with quick insert
   - Location list with quick insert
   - Research notes sidebar (collapsible)
   - Chapter/scene summaries
   - Tags for scenes (plot, subplot markers)

**Integration Requirements:**

6. Registers with ModeManager as "novel" mode
7. Content structure preserves when switching modes
8. Stores novel-specific metadata (chapters, word counts, characters)
9. Auto-save includes chapter structure and metadata
10. Side-by-side view compatible (outline on left, chapter on right)

## Technical Notes

### Implementation Architecture

```
/editor/modes/novel/
  novelMode.js           # Main mode implementation
  chapterManager.js      # Chapter/scene organization
  wordCounter.js         # Word count tracking
  novelSidebar.js        # Sidebar components
  focusModes.js          # Focus/typewriter modes
  novel.css             # Novel-specific styles
```

### Key Components

1. **Document Structure**
   ```javascript
   {
     chapters: [
       {
         id: 'ch-1',
         title: 'Chapter 1',
         scenes: [
           {
             id: 'sc-1-1',
             title: 'Opening',
             content: '...',
             wordCount: 1543,
             tags: ['introduction']
           }
         ],
         wordCount: 3421
       }
     ],
     metadata: {
       title: 'My Novel',
       author: 'Author Name',
       targetWordCount: 80000,
       dailyGoal: 1000
     }
   }
   ```

2. **Sidebar Components**
   - Chapter navigator (tree view)
   - Word count panel
   - Character quick list
   - Location quick list
   - Research notes

3. **Writing Modes Toggle**
   ```javascript
   const WritingModes = {
     STANDARD: 'standard',
     FOCUS: 'focus',        // Hide all UI
     TYPEWRITER: 'typewriter', // Center current line
     FULLSCREEN: 'fullscreen'  // Maximize area
   }
   ```

4. **Word Count Features**
   - Session timer and word count
   - Rolling 7-day history
   - Chapter/scene breakdowns
   - Export word count report

5. **Manuscript Formatting**
   - Industry-standard formatting
   - Export to DOCX with proper formatting
   - Print-ready PDF generation
   - Standard manuscript headers

## Definition of Done

- [ ] Chapter/scene organization working with drag-drop
- [ ] Word count tracking accurate and live
- [ ] All writing modes functional (focus, typewriter, fullscreen)
- [ ] Character/location tracking implemented
- [ ] Research sidebar functional
- [ ] Manuscript formatting correct
- [ ] Mode integrates with ModeManager
- [ ] Content structure preserved during mode switches
- [ ] Auto-save includes all novel metadata
- [ ] Daily word count goals and tracking working

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Complex chapter structure difficult to convert to other modes
- **Mitigation:** Flatten to linear text for other modes, preserve structure in metadata
- **Secondary Risk:** Word count performance with large documents
- **Mitigation:** Debounce counting, use web workers if needed

**Compatibility Verification:**

- [ ] Chapter structure doesn't break TipTap
- [ ] Sidebar works with side-by-side layout
- [ ] Word counting doesn't impact typing performance
- [ ] Mode switching handles chapter structure

## Testing Scenarios

1. Create multi-chapter novel with 10+ chapters
2. Rearrange chapters via drag-and-drop
3. Track word count across writing session
4. Test focus mode with all UI hidden
5. Typewriter mode scrolling behavior
6. Switch to screenplay mode and back
7. Daily goal tracking across multiple days
8. Export to manuscript format
9. Character/location quick insert
10. Research notes with images

## Estimated Effort

- **Development:** 8-10 hours
  - Chapter organization: 3 hours
  - Word count system: 2 hours
  - Writing modes: 2 hours
  - Sidebar components: 2 hours
  - Testing & polish: 1-3 hours
- **Testing:** 1.5 hours
- **Documentation:** 30 minutes

## Dependencies

- **Required:** Story 1.5.1 (Mode Infrastructure) - must be complete
- **Required:** Story 1.1 (TipTap Editor) - core editing engine
- **Required:** Story 1.3 (Auto-save) - for novel structure persistence
- **Works with:** Story 1.2 (Side-by-side) - outline view compatible

## MVP vs Full Features

### MVP (This Story)
- Basic chapter/scene organization
- Live word count
- Focus mode
- Character/location lists
- Basic manuscript formatting

### Future Enhancements
- Scrivener import/export
- Version history per chapter
- Compile to various formats (ePub, MOBI)
- Advanced metadata (POV, timeline)
- Writing statistics and analytics
- Distraction-free themes
- Chapter templates
- Series bible support
- Beta reader comments
- Revision mode

## Implementation Order

1. Set up novel mode structure
2. Build chapter/scene data model
3. Create sidebar with chapter navigator
4. Implement word count tracking
5. Add focus/typewriter modes
6. Build character/location tracking
7. Add research notes panel
8. Implement manuscript formatting
9. Create daily goal system
10. Test with real novel content