# Story 1.5.5: Story Bible Mode Implementation - Brownfield Addition

## User Story

As a worldbuilder/writer,
I want a World Anvil-like story bible environment,
So that I can organize characters, locations, timeline, and lore with rich relationships and cross-references.

## Story Context

**Existing System Integration:**

- Integrates with: Mode infrastructure from Story 1.5.1, TipTap editor for entry content
- Technology: Vanilla JavaScript, TipTap for rich text entries, CSS3
- Follows pattern: Mode registration pattern established in Story 1.5.1
- Touch points: ModeManager, TipTap instance, localStorage for complex data

## Acceptance Criteria

**Functional Requirements:**

1. **Template-Based Entries**
   - Character template (name, age, appearance, backstory, goals, relationships)
   - Location template (name, description, inhabitants, history, significance)
   - Event/Timeline template (date, participants, location, impact)
   - Item/Artifact template (name, description, powers, history, owner)
   - Custom templates (user-defined fields)

2. **Category Organization**
   - Main categories: Characters, Locations, Timeline, Items, Lore, Notes
   - Subcategories with nesting (e.g., Characters → Main, Supporting, Antagonists)
   - Visual category browser with icons
   - Quick category switching
   - Entry count per category

3. **Relationship Mapping**
   - Link entries together (character → location, event → participants)
   - Relationship types (family, ally, enemy, owns, located at)
   - Visual relationship graph view
   - Bidirectional links auto-update
   - Relationship history tracking

4. **Search & Cross-Reference**
   - Global search across all entries
   - Filter by category, tags, or custom fields
   - Wiki-style [[links]] to other entries
   - Auto-complete for entry names
   - Backlinks panel showing references

5. **Rich Entry Features**
   - Image gallery per entry
   - File attachments (PDFs, etc.)
   - Version history per entry
   - Private notes separate from main content
   - Tags and custom metadata fields
   - Entry templates with pre-filled sections

**Integration Requirements:**

6. Registers with ModeManager as "bible" mode
7. Maintains rich data structure in localStorage
8. Uses TipTap for entry content editing
9. Cross-references work across all entries
10. Data exports to JSON for backup

## Technical Notes

### Implementation Architecture

```
/editor/modes/bible/
  bibleMode.js           # Main mode implementation
  entryManager.js        # Entry CRUD operations
  templateEngine.js      # Template system
  relationshipGraph.js   # Relationship management
  bibleSearch.js        # Search and cross-reference
  categoryBrowser.js    # Category UI component
  bible.css            # Bible-specific styles
```

### Key Components

1. **Entry Structure**
   ```javascript
   {
     id: 'entry-uuid',
     type: 'character',  // character|location|event|item|custom
     template: 'character-main',
     category: ['Characters', 'Main Characters'],
     title: 'Hero Name',
     fields: {
       // Template-defined fields
       name: 'Full Name',
       age: 28,
       appearance: '<p>Rich text description...</p>',
       backstory: '<p>Rich text...</p>',
       // Custom fields
       customField1: 'value'
     },
     relationships: [
       {
         type: 'family',
         target: 'entry-uuid-2',
         description: 'Sister'
       }
     ],
     images: ['image-id-1', 'image-id-2'],
     tags: ['protagonist', 'warrior'],
     metadata: {
       created: timestamp,
       modified: timestamp,
       version: 1
     }
   }
   ```

2. **Template System**
   ```javascript
   {
     id: 'character-main',
     name: 'Main Character',
     icon: '👤',
     fields: [
       {name: 'name', type: 'text', required: true},
       {name: 'age', type: 'number'},
       {name: 'appearance', type: 'richtext'},
       {name: 'personality', type: 'richtext'},
       {name: 'backstory', type: 'richtext'},
       {name: 'goals', type: 'list'},
       {name: 'fears', type: 'list'}
     ]
   }
   ```

3. **Category Browser Layout**
   ```
   [Sidebar]              [Main Content]
   📚 All Entries (127)   [Current Entry Editor]
   👥 Characters (45)
     └ Main (8)          Title: [Entry Name]
     └ Supporting (20)
     └ Antagonists (5)   Template: [Dropdown]
   📍 Locations (32)
   📅 Timeline (25)       [Template Fields...]
   🗡️ Items (15)
   📜 Lore (10)          [Relationships Panel]
                         [Images Gallery]
   ```

4. **Cross-Reference System**
   - [[Character Name]] auto-links
   - Hover preview of linked entries
   - Backlinks panel updates live
   - Broken link detection

5. **Relationship Graph**
   - Interactive node graph
   - Filter by relationship type
   - Zoom and pan
   - Click node to open entry

## Definition of Done

- [ ] All template types created and functional
- [ ] Category browser with nesting working
- [ ] Entry creation/edit/delete operations
- [ ] Relationship system with bidirectional links
- [ ] Wiki-style cross-references working
- [ ] Search and filter functionality
- [ ] Image gallery per entry
- [ ] Tags and custom fields
- [ ] Mode integrates with ModeManager
- [ ] Data structure persists to localStorage
- [ ] Export to JSON backup

## Risk and Compatibility Check

**Risk Assessment:**

- **Primary Risk:** Complex data structure may exceed localStorage limits
- **Mitigation:** Implement data compression, consider IndexedDB for large bibles
- **Secondary Risk:** Relationship graph performance with many connections
- **Mitigation:** Limit visible nodes, use virtualization

**Compatibility Verification:**

- [ ] TipTap handles entry content editing
- [ ] localStorage handles complex nested data
- [ ] Cross-references don't break with renames
- [ ] Mode switching preserves bible data

## Testing Scenarios

1. Create 100+ entries across categories
2. Complex relationship web (20+ connections)
3. Deep category nesting (4+ levels)
4. Wiki-links with auto-complete
5. Search across 500+ entries
6. Image gallery with 20+ images
7. Template switching preserves data
8. Export and reimport JSON
9. Broken link detection
10. Relationship graph with 50+ nodes

## Estimated Effort

- **Development:** 8-10 hours
  - Template system: 2 hours
  - Entry management: 2 hours
  - Category browser: 1.5 hours
  - Relationship system: 2 hours
  - Search & cross-reference: 1.5 hours
  - Testing & polish: 1-3 hours
- **Testing:** 1.5 hours
- **Documentation:** 30 minutes

## Dependencies

- **Required:** Story 1.5.1 (Mode Infrastructure) - must be complete
- **Required:** Story 1.1 (TipTap Editor) - for rich text fields
- **Required:** Story 1.3 (Auto-save) - for bible persistence

## MVP vs Full Features

### MVP (This Story)
- Basic templates (character, location, event)
- Category organization
- Simple relationships
- Wiki-style links
- Basic search
- Tags

### Future Enhancements
- Custom template builder UI
- Relationship graph visualization
- Timeline visualization
- Map integration for locations
- Campaign/series management
- Collaborative editing
- AI-assisted entry generation
- Export to various formats (PDF, Wiki)
- Import from other tools
- Advanced queries and reports
- Entry comparison tool

## Implementation Order

1. Set up bible mode structure
2. Create template system
3. Build entry manager (CRUD)
4. Implement category browser
5. Add relationship system
6. Build wiki-link parser
7. Implement search functionality
8. Add image gallery support
9. Create relationship graph view
10. Test with complex world data