# UI Mockup Specifications - Epic 3

## Full Application Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  📝 Story Drive     Script  Beats  Outline  Story Bible  Synopsis  Characters  │
│                          ═══════                                      ⚙️ 👤     │
├────────────────┬───────────────────────────────────────────┬──────────────────┤
│                │                                             │                  │
│  🔍 Search...  │          INT. LIVING ROOM - EVENING       S│  🌍 World Builder│
├────────────────┤                                            │  Scene 3, Page 7 │
│                │          Ben is testing out arc studio,    ├──────────────────┤
│ 📐 Plot        │          screenwriting app.               A│                  │
│ Story Structure│                                            │  Based on the    │
│                │                       BEN                 C│  scene you're    │
│ 🧠 Character   │               So far so good.             D│  writing, the    │
│ Development    │                                            │  living room     │
│                │          He was was frustrated for a       │  should reflect  │
│ 🌍 World       │          moment trying how to figure      A│  Ben's character │
│ Setting Creator│          out how to switch from character  │  - perhaps a     │
│ ◄──────────────│          dialogue to action line.          │  cluttered desk  │
│                │                                            │  with multiple   │
│ 💬 Dialog      │                       BEN                 C│  screens showing │
│ Conversation   │                    (CONT'D)                P│  various writing │
│                │             That wasn't to hard...         D│  apps...         │
│ 🎭 Genre       │                                            │                  │
│ Conventions    │                                            │  ┌─────────────┐ │
│                │                                            │  │ Describe... │ │
│ ✏️ Editor      │                                            │  │ Add mood... │ │
│ Style & Grammar│                                            │  └─────────────┘ │
│                │                                            │                  │
│ 👁️ Beta Reader │                                            │  💬 Type here... │
│ Perspective    │                                            │       [Send]     │
│                ├────────────────────────────────────────────┼──────────────────┤
│                │ Page 1 of 5 | 1,234 words | ● Saved       │                  │
└────────────────┴────────────────────────────────────────────┴──────────────────┘

Legend: S=Scene, A=Action, C=Character, D=Dialogue, P=Parenthetical
```

## Component State Variations

### 1. Agent Panel States

#### Default State
```
┌─────────────────┐
│ 📐 Plot Architect│
│ Story Structure  │
└─────────────────┘
```

#### Hover State
```
┌─────────────────┐
│ 📐 Plot Architect│ ← Slight right shift (2px)
│ Story Structure  │ ← Background: surface-hover
└─────────────────┘
```

#### Selected State
```
█────────────────┐
█ 🌍 World Builder│ ← 3px accent border-left
█ Setting Creator │ ← Background: surface-hover
█                 │ ← Green dot: online indicator
└─────────────────┘
```

#### With Expanded Chat
```
┌─────────────────┐
│ Agent List...   │
├─────────────────┤
│ ▼ Hide chat     │
├─────────────────┤
│ Recent messages │
│ from World      │
│ Builder...      │
│                 │
│ [Type here...]  │
└─────────────────┘
```

### 2. Smart Text Replacement UI

#### Initial Selection
```
User selects text: "walked slowly"
                    ^^^^^^^^^^^^^^
                    [highlighted in accent color]
```

#### Trigger Button Appears
```
         walked slowly
         └─ ✨ Replace with suggestion
```

#### Expanded Options
```
         walked slowly
         └─┬──────────────────────────────┐
           │ 📐 "trudged forward"         │
           │    Plot Architect            │
           ├──────────────────────────────┤
           │ 🧠 "ambled hesitantly"       │
           │    Character Psychologist    │
           ├──────────────────────────────┤
           │ 🎭 "crept silently"          │
           │    Genre Specialist          │
           └──────────────────────────────┘
```

### 3. Chat Panel Variations

#### Standard Message Flow
```
┌──────────────────────┐
│ 🌍 World Builder     │
│ Context: Scene 3     │
├──────────────────────┤
│                      │
│ ┌──────────────┐     │
│ │ Based on...  │     │ ← Agent message (left)
│ └──────────────┘     │
│                      │
│        ┌──────────┐  │
│        │ What...? │  │ ← User message (right)
│        └──────────┘  │
│                      │
│ ┌──────────────┐     │
│ │ Consider...  │     │
│ └──────────────┘     │
│                      │
├──────────────────────┤
│ [Describe] [Add mood]│ ← Quick suggestions
├──────────────────────┤
│ Type your message... │
│                [Send]│
└──────────────────────┘
```

#### Context Broadcasting Indicator
```
┌──────────────────────┐
│ 🌍 World Builder  ⚡ │ ← Lightning bolt = active
│ Broadcasting context │ ← Real-time status
└──────────────────────┘
```

### 4. Navigation Tab States

#### Tab Bar
```
Script    Beats    Outline    Story Bible    Synopsis    Characters
══════                        ← Active tab with underline

Script    Beats    Outline    Story Bible    Synopsis    Characters
         ░░░░░░                ← Hover state with bg-hover
```

### 5. Editor Format Indicators

#### Left Margin Indicators
```
│ S │  INT. OFFICE - DAY        ← Scene heading
│   │
│ A │  John enters hurriedly.   ← Action line
│   │
│ C │          JOHN              ← Character name
│   │
│ P │       (nervous)            ← Parenthetical
│   │
│ D │  I need to tell you...    ← Dialogue
│   │
│ T │                     CUT TO:← Transition
```

## Responsive Layouts

### Desktop (1440px+)
```
[240px Agents] [Flexible Editor] [360px Chat]
```

### Laptop (1024px-1440px)
```
[↔ Agents] [Flexible Editor] [320px Chat]
   (collapsible)
```

### Tablet (768px-1024px)
```
Tab: [Agents] [Editor] [Chat]
     ════════
[Full width editor view]
```

### Mobile (<768px)
```
┌─────────────┐
│   Editor    │
├─────────────┤  ← Swipe between panels
│   Agents    │
├─────────────┤
│    Chat     │
└─────────────┘
```

## Color Application Examples

### Light Mode
```
Background: #FAFAFA (subtle gray)
┌─────────────────────────┐
│ Surface: #FFFFFF (white)│
│ ┌─────────────────────┐ │
│ │ Hover: #F9FAFB      │ │
│ └─────────────────────┘ │
│ ─────────────────────── │ ← Divider: #E5E7EB
│ Text Primary: #1A1A1A   │
│ Text Secondary: #6B7280 │
│ Accent: #5B5FDE → #7B7FFF (gradient)
└─────────────────────────┘
```

### Dark Mode
```
Background: #1A1A1A (warm black)
┌─────────────────────────┐
│ Surface: #242424        │
│ ┌─────────────────────┐ │
│ │ Hover: #2A2A2A      │ │
│ └─────────────────────┘ │
│ ─────────────────────── │ ← Divider: #374151
│ Text Primary: #E4E4E4   │
│ Text Secondary: #9CA3AF │
│ Accent: #5155CE → #6B6FEE (dimmed gradient)
└─────────────────────────┘
```

## Animation Sequences

### Message Arrival
```
Frame 1 (0ms):    [empty]
Frame 2 (100ms):  [·····] ← Fade in starts
Frame 3 (200ms):  [Message] ← Slide up complete
```

### Panel Resize
```
Start:   [240px]━━━━━[Editor]━━━━━[360px]
Drag:    [200px]━━━━━━[Editor]━━━━━[360px]
End:     [200px]━━━━━━[Editor]━━━━━[360px]
         ← Smooth transition over 200ms
```

### Context Pulse
```
Frame 1: ● (solid)
Frame 2: ◉ (ring starts)
Frame 3: ○ (ring expands)
Frame 4: · (fades out)
```

## Interaction Flow Diagrams

### Agent Selection Flow
```
1. User hovers agent card → Background lightens
2. User clicks agent card → Border appears, selection state
3. Previous agent fades → New agent context loads
4. Chat panel updates → Shows new agent info
5. Context broadcasts → All agents receive update
```

### Text Replacement Flow
```
1. User selects text in editor
2. Smart replace button fades in above selection
3. User clicks button → Dropdown expands with options
4. User hovers option → Background highlights
5. User clicks option → Text morphs to new content
6. UI elements fade out → Editor returns to normal
```

### Writing Mode Switch Flow
```
1. User clicks "Outline" tab
2. Current editor fades out (100ms)
3. Layout reconfigures for outline mode
4. New editor structure fades in (100ms)
5. Agents update to outline-specific helpers
```

## Critical UI Details

### Spacing Rhythm
- All spacing follows 8px grid
- Component padding: 12px (1.5 units)
- Panel padding: 16px (2 units)
- Section gaps: 24px (3 units)

### Shadow Hierarchy
- Surface elements: 0 1px 3px (subtle)
- Floating buttons: 0 4px 6px (medium)
- Dropdowns: 0 10px 25px (pronounced)
- Modals: 0 25px 50px (dramatic)

### Border Treatments
- Default borders: 1px solid divider color
- Focus borders: 2px solid accent color
- Selected borders: 3px solid accent (left side only)

### Corner Radius Consistency
- Small elements (chips): 4px
- Medium elements (buttons): 6px
- Large elements (panels): 8px
- Extra large (cards): 12px
- Round elements: 9999px

## Implementation Priority

### MVP (Week 1)
1. Three-panel layout structure
2. Basic agent cards
3. Simple chat interface
4. Editor with screenplay formatting

### Enhancement (Week 2)
1. Smart text replacement
2. Context broadcasting animations
3. Panel resize functionality
4. Keyboard navigation

### Polish (Week 3)
1. All micro-animations
2. Dark mode toggle
3. Responsive breakpoints
4. Performance optimizations