# Epic 3: Intelligent Screenplay Editor with Real-Time Context Awareness

## Epic Overview
Build a professional screenplay editor with smart formatting and real-time context awareness that broadcasts to all Story-Drive personas, enabling instant contextual assistance and seamless text replacement.

## Success Criteria
- [ ] Full screenplay editor with industry-standard formatting
- [ ] Real-time context broadcasting to all agents
- [ ] Smart text replacement from agent suggestions
- [ ] Automatic line type detection and formatting
- [ ] Context-aware agent responses based on cursor position
- [ ] Performance under 100ms for all context updates

## Story Breakdown

### Story 3.1: Core Editor Foundation & Smart Formatting
**Size**: L (13 points)
**Priority**: P0 - Critical Path

#### Acceptance Criteria
- [ ] Rich text editor component for screenplay writing
- [ ] Line type system (scene, action, character, dialogue, parenthetical, transition)
- [ ] Automatic formatting based on line type
- [ ] Keyboard shortcuts for type switching (Tab/Enter)
- [ ] Smart capitalization (scenes/characters = UPPERCASE)
- [ ] Proper indentation per line type
- [ ] Export to .fdx, .pdf, .fountain formats

#### Technical Requirements
```javascript
// Core editor with line type management
class ScreenplayEditor {
  lines: Line[];
  currentLineType: LineType;
  formatRules: FormattingRules;

  handleLineTypeChange(type: LineType) { }
  applyFormatting(text: string, type: LineType) { }
  exportScreenplay(format: 'fdx' | 'pdf' | 'fountain') { }
}
```

---

### Story 3.2: Real-Time Context Broadcasting System
**Size**: L (13 points)
**Priority**: P0 - Critical Path

#### Acceptance Criteria
- [ ] ScreenplayContext data structure implementation
- [ ] Real-time context updates on every edit/cursor move
- [ ] Broadcast to all personas (active and passive)
- [ ] Context includes: current line, scene, act, surrounding lines
- [ ] Track metadata: page count, characters in scene, position
- [ ] Performance: Context updates < 100ms
- [ ] Lazy evaluation for non-active personas

#### Technical Requirements
```javascript
interface ScreenplayContext {
  currentPage: number;
  currentLine: number;
  activeLine: { type: LineType; text: string; };
  currentScene: { heading: string; sceneNumber: number; };
  currentAct: string;
  charactersInScene: string[];
  previousLines: Line[];
  nextLines: Line[];
}

class ContextBroadcaster {
  broadcastToPersonas(context: ScreenplayContext) { }
  updateOnEdit(change: EditEvent) { }
}
```

---

### Story 3.3: Smart Text Replacement System
**Size**: M (8 points)
**Priority**: P0 - Critical Feature

#### Acceptance Criteria
- [ ] Text selection in editor triggers replacement mode
- [ ] Chat window shows "Replacement Mode Active" indicator
- [ ] Agent suggestions become actionable with buttons
- [ ] One-click replace of selected text
- [ ] Insert before/after options
- [ ] Preview changes before applying
- [ ] Undo support for replacements
- [ ] Visual feedback on successful replacement

#### Technical Requirements
```javascript
class ReplacementSystem {
  selectedContext: SelectionContext;

  activateReplacementMode(selection: TextSelection) { }
  renderReplaceableResponse(agentText: string) { }
  executeReplacement(action: 'replace' | 'before' | 'after') { }
  previewChange(suggestion: string) { }
}
```

---

### Story 3.4: Context-Aware Agent Integration
**Size**: M (8 points)
**Priority**: P1 - Core Feature

#### Acceptance Criteria
- [ ] All agents receive real-time context
- [ ] Agents provide contextual greetings based on cursor position
- [ ] Proactive suggestions based on writing patterns
- [ ] Dialogue Specialist analyzes rhythm in real-time
- [ ] Plot Architect tracks pacing and structure
- [ ] Character Specialist monitors consistency
- [ ] Suggestions appear as sidebar notifications
- [ ] Severity levels (info, warning, error)

#### Technical Requirements
```javascript
class ContextAwareAgent {
  analyzeContext(context: ScreenplayContext): Suggestion[] { }
  generateContextualResponse(query: string, context: ScreenplayContext) { }
  getProactiveSuggestions(context: ScreenplayContext) { }
}
```

---

### Story 3.5: Three-Panel Integrated UI Layout
**Size**: L (13 points)
**Priority**: P0 - Critical Path

#### Acceptance Criteria
- [ ] Left panel: Agent directory with all personas
- [ ] Center panel: Screenplay editor workspace
- [ ] Right panel: Active agent chat interface
- [ ] Unified workspace - no context switching needed
- [ ] Active agent highlighting in directory
- [ ] Cross-Agent Memory System status indicator
- [ ] Responsive panels with adjustable widths
- [ ] Mobile/tablet responsive design
- [ ] Agent switch preserves screenplay position
- [ ] Chat history maintained per agent session

#### Technical Requirements
```javascript
class IntegratedUILayout {
  panels: {
    left: AgentDirectory;
    center: ScreenplayEditor;
    right: ChatInterface;
  };

  handleAgentSwitch(agentId: string) { }
  synchronizePanels() { }
  maintainFocus() { }
}
```

---

### Story 3.6: Advanced Editor Features
**Size**: M (8 points)
**Priority**: P2 - Enhancement

#### Acceptance Criteria
- [ ] Draft management (main, alt, experimental versions)
- [ ] Quick switch between drafts
- [ ] Beat/outline markers inline
- [ ] Scene navigation sidebar
- [ ] Toolbar with format controls
- [ ] Add scene/character shortcuts
- [ ] Comment system for notes
- [ ] Scene splitting capability
- [ ] Favorite/bookmark scenes
- [ ] Auto-save every 30 seconds

#### Technical Requirements
```javascript
class DraftManager {
  drafts: Map<string, Screenplay>;
  switchDraft(draftId: string) { }
  compareDrafts(draft1: string, draft2: string) { }
}

class EditorToolbar {
  tools: Tool[];
  addScene() { }
  splitScene(lineNumber: number) { }
  toggleBookmark(sceneId: string) { }
}
```

---

### Story 3.7: Performance & Polish
**Size**: S (5 points)
**Priority**: P1 - Quality

#### Acceptance Criteria
- [ ] Optimize context broadcasting for performance
- [ ] Implement smart caching for agent analysis
- [ ] Smooth animations for UI transitions
- [ ] Responsive design for tablet/desktop
- [ ] Full keyboard navigation support
- [ ] Local storage for drafts
- [ ] Cloud sync capability
- [ ] Error recovery for failed saves
- [ ] Loading states for async operations

#### Technical Requirements
- Context broadcast latency < 100ms
- Editor responsive with 100+ page screenplays
- Auto-save completes < 500ms
- Text replacement animation < 300ms

---

## Technical Architecture

```
User Input → ScreenplayEditor
    ↓
Line Type Detector → Smart Formatter
    ↓
Context Broadcaster → All Personas (passive/active)
    ↓
Text Selection → Replacement Mode Activation
    ↓
Agent Response → Actionable Suggestions
    ↓
One-Click Replace → Editor Update
```

## Implementation Order
1. **Phase 1**: Stories 3.1 + 3.2 + 3.5 (Editor + Context + UI Layout)
2. **Phase 2**: Stories 3.3 + 3.4 (Replacement + Agent Integration)
3. **Phase 3**: Stories 3.6 + 3.7 (Advanced Features + Polish)

## Dependencies
- Requires Epic 1 & 2 completion (document system + memory)
- Rich text editor library (Quill.js or similar)
- Screenplay format parsers
- PDF generation library

## Risk Mitigation
- **Performance Risk**: Implement throttling for context broadcasts
- **Complexity Risk**: Build MVP with core features first
- **Integration Risk**: Test with single agent before full broadcast

## Definition of Done
- [ ] All stories complete with tests
- [ ] Performance benchmarks met
- [ ] User can write formatted screenplay
- [ ] Agents provide contextual help
- [ ] Text replacement working smoothly
- [ ] Export formats validated
- [ ] Documentation complete

---

**Epic Owner**: Story-Drive Team
**Target Completion**: 6 sprints
**Total Points**: 58 points