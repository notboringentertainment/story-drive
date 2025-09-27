markdown
# Story-Drive Screenplay Editor PRD
## Real-Time Context Awareness & Smart Formatting

### Executive Summary
The Screenplay Editor is a professional-grade writing tool with smart formatting that automatically handles industry conventions while providing real-time context awareness to all Story-Drive personas, enabling instant, intelligent assistance based on exactly what the writer is working on.

---

## 1. Critical Requirement: Real-Time Context Awareness

### 1.1 Core Principle
Every Story-Drive persona has immediate visibility into the active screenplay workspace, regardless of whether they were explicitly summoned. This creates an omniscient support system where any specialist can provide instant, contextual help.

### 1.2 Context Data Structure
```javascript
interface ScreenplayContext {
  // Current position
  currentPage: number;
  currentLine: number;
  cursorPosition: number;
  
  // Active content
  activeLine: {
    type: 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
    text: string;
    lineNumber: number;
  };
  
  // Surrounding context
  previousLines: Line[]; // Last 10 lines
  nextLines: Line[]; // Next 5 lines
  
  // Structural awareness
  currentScene: {
    heading: string;
    sceneNumber: number;
    pageCount: number;
    beatDescription?: string;
  };
  currentAct: 'Act 1' | 'Act 2A' | 'Act 2B' | 'Act 3';
  
  // Metadata
  totalPages: number;
  charactersInScene: string[];
  lastEdit: timestamp;
  selectedText?: string;
}
1.3 Persona Context Integration
Synopsis Specialist
Sees overall story progression through pages
Identifies if scenes align with pitched concept
Notices when story drifts from logline
Dialogue Specialist
Instantly analyzes dialogue being written
Tracks character voice consistency
Identifies rhythm and subtext issues
Plot Architect
Monitors pacing and structure
Identifies act breaks and timing
Sees when scenes run long/short
World Builder
Tracks location consistency
Monitors world rules in action lines
Identifies setting description opportunities
Character Specialist
Tracks character behavior in scenes
Monitors character arc progression
Identifies out-of-character moments
1.4 Context Awareness Implementation
javascript
// Context broadcast system
class ScreenplayContextBroadcaster {
  private context: ScreenplayContext;
  
  updateContext(changes: Partial<ScreenplayContext>) {
    this.context = { ...this.context, ...changes };
    this.broadcastToPersonas();
  }
  
  broadcastToPersonas() {
    // All personas receive updates in real-time
    PersonaService.updateAllContexts(this.context);
  }
  
  onLineEdit(lineNumber: number, newText: string, type: LineType) {
    this.updateContext({
      activeLine: { lineNumber, text: newText, type },
      lastEdit: Date.now()
    });
  }
}

2. Smart Formatting Features
2.1 Line Type System
Each line in the screenplay has a defined type that determines its formatting:
Type
Formatting
Capitalization
Indentation
scene
Scene heading
UPPERCASE
None
action
Action description
Normal
Visual padding
character
Character name
UPPERCASE
4 spaces
dialogue
Character speech
Normal
8 spaces
parenthetical
Direction
Normal
6 spaces + ()
transition
Scene transition
UPPERCASE
Tab indent

2.2 Automatic Formatting Rules
javascript
class SmartFormatter {
  formatLine(text: string, type: LineType): FormattedLine {
    switch(type) {
      case 'scene':
        return {
          text: this.toUpperCase(this.collapseSpaces(text)),
          style: 'scene-heading'
        };
      
      case 'character':
        return {
          text: this.toUpperCase(text),
          style: 'character-name',
          indent: 4
        };
      
      case 'dialogue':
        return {
          text: text,
          style: 'dialogue',
          indent: 8
        };
      
      case 'parenthetical':
        return {
          text: this.wrapInParens(text),
          style: 'parenthetical',
          indent: 6
        };
      
      // etc...
    }
  }
}
2.3 Type Switching Workflow
Keyboard Navigation: Tab/Enter cycles through line types contextually
Smart Defaults: System predicts next line type based on current
Quick Toggle: Single keystroke to change any line type
javascript
const typeSequence = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition'];

function getNextType(currentType: LineType, context: ScreenplayContext): LineType {
  // Smart prediction based on context
  if (currentType === 'character') return 'dialogue';
  if (currentType === 'dialogue' && context.nextExpected === 'parenthetical') return 'parenthetical';
  if (currentType === 'scene') return 'action';
  // etc...
}

3. Context-Aware Assistance Features
3.1 Proactive Suggestions
javascript
interface ContextualSuggestion {
  persona: string;
  trigger: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

// Examples of context-aware suggestions
const suggestions: ContextualSuggestion[] = [
  {
    persona: 'Dialogue Specialist',
    trigger: 'consecutive_dialogue_same_rhythm',
    message: "These three lines all have the same cadence. Try varying sentence length.",
    severity: 'warning'
  },
  {
    persona: 'Plot Architect',
    trigger: 'scene_exceeds_3_pages',
    message: "This scene is running long. Consider splitting or tightening action.",
    severity: 'info'
  },
  {
    persona: 'World Builder',
    trigger: 'new_location_no_description',
    message: "New location needs establishing details. What does the audience see?",
    severity: 'info'
  }
];
3.2 Instant Persona Response
When any persona is summoned, they immediately reference the active context:
javascript
class PersonaResponse {
  generateGreeting(persona: string, context: ScreenplayContext): string {
    switch(persona) {
      case 'Dialogue Specialist':
        if (context.activeLine.type === 'dialogue') {
          return `I see you're writing ${context.activeLine.character}'s dialogue. 
                  The rhythm feels ${this.analyzeRhythm(context.activeLine.text)}...`;
        }
        break;
        
      case 'Plot Architect':
        return `You're in ${context.currentAct}, page ${context.currentPage}. 
                This scene ${this.analyzePacing(context)}...`;
        
      // etc...
    }
  }
}

4. Additional Features
4.1 Draft Management
Save multiple versions (main, alt, experimental)
Quick switch between drafts
Compare versions side-by-side
4.2 Beat/Outline Integration
Inline beat markers
Outline fields for structure notes
Visual connection to story structure
4.3 Toolbar Features
Format controls (Bold, Italic, Underline)
Line type selector
Undo/Redo
Quick save
Add scene button
4.4 Contextual Actions
Hover icons for scene actions
Quick comment addition
Scene splitting
Favorite marking

5. Success Metrics
5.1 Context Awareness
Persona suggestions match actual problems (>90% relevance)
Response time to context changes (<100ms)
Accurate scene/act detection (100%)
5.2 Formatting
Correct industry formatting (100%)
Type switching speed (<50ms)
Smart prediction accuracy (>80%)
5.3 User Experience
Reduced formatting time (50% faster than manual)
Increased writing flow (fewer interruptions)
Helpful persona interventions (user rates >4/5)

6. Implementation Priorities
Phase 1: Core Context System
Build ScreenplayContext data structure
Implement context broadcaster
Connect to all personas
Phase 2: Smart Formatting
Line type system
Automatic formatting rules
Keyboard navigation
Phase 3: Proactive Assistance
Context analysis engine
Suggestion system
Persona integration
Phase 4: Advanced Features
Draft management
Beat integration
Toolbar and contextual actions

7. Technical Requirements
Performance: Context updates in <100ms
Storage: Screenplay data persisted locally + cloud
Compatibility: Export to .fdx, .pdf, .fountain
Accessibility: Full keyboard navigation
Responsiveness: Works on tablet + desktop

8. Critical Implementation Notes
8.1 Real-Time Context is Non-Negotiable
This is not a "nice-to-have" feature. The entire value proposition of WriterOS depends on personas having immediate, real-time awareness of what the writer is working on. Without this, the system is just another screenplay formatter with chatbots attached.
8.2 Context Broadcast Architecture
Every keystroke, cursor movement, and formatting change must be broadcast to the context system. All personas maintain a live view of the screenplay state, enabling them to provide instant, relevant assistance without requiring the writer to explain their situation.
8.3 Privacy and Performance Balance
While all personas have access to context, only actively engaged personas should process it deeply. Use lazy evaluation and smart caching to maintain sub-100ms performance even with multiple personas available.

This PRD ensures that the screenplay editor isn't just a formatting tool, but an intelligent writing environment where every persona understands exactly what the writer is doing and can provide immediate, contextual assistance.


