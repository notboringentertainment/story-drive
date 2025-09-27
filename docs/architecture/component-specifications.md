# Component Specifications for Epic 3

## Core Layout Components

### 1. Three-Panel Layout Container
```html
<div class="app-container">
  <nav class="top-nav">...</nav>
  <div class="workspace">
    <aside class="panel-agents">...</aside>
    <main class="panel-editor">...</main>
    <aside class="panel-chat">...</aside>
  </div>
</div>
```

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
}

.workspace {
  display: grid;
  grid-template-columns: var(--panel-agent-width) 1fr var(--panel-chat-width);
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Resizable panels */
.panel-agents {
  position: relative;
  background: var(--color-surface);
  border-right: 1px solid var(--color-divider);
  min-width: var(--panel-agent-min);
  max-width: var(--panel-agent-max);
}

.panel-chat {
  background: var(--color-surface);
  border-left: 1px solid var(--color-divider);
  min-width: var(--panel-chat-min);
  max-width: var(--panel-chat-max);
}

/* Resize handles */
.resize-handle {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background var(--duration-fast);
}

.resize-handle:hover {
  background: var(--color-accent);
}
```

### 2. Top Navigation Component

```html
<nav class="top-nav">
  <div class="nav-logo">
    <span class="logo-icon">📝</span>
    <span class="logo-text">Story Drive</span>
  </div>

  <div class="nav-tabs">
    <button class="nav-tab active" data-mode="script">Script</button>
    <button class="nav-tab" data-mode="beats">Beats</button>
    <button class="nav-tab" data-mode="outline">Outline</button>
    <button class="nav-tab" data-mode="bible">Story Bible</button>
    <button class="nav-tab" data-mode="synopsis">Synopsis</button>
    <button class="nav-tab" data-mode="characters">Characters</button>
  </div>

  <div class="nav-actions">
    <button class="icon-button" aria-label="Settings">⚙️</button>
    <button class="user-avatar">
      <img src="avatar.jpg" alt="User">
    </button>
  </div>
</nav>
```

```css
.top-nav {
  display: flex;
  align-items: center;
  height: var(--nav-height);
  padding: 0 var(--spacing-md);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  gap: var(--spacing-lg);
}

.nav-tabs {
  display: flex;
  flex: 1;
  gap: var(--spacing-xs);
  justify-content: center;
}

.nav-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.nav-tab:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
}

.nav-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
```

### 3. Agent Panel Component

```html
<aside class="panel-agents">
  <div class="agent-search">
    <input type="search"
           placeholder="Search agents..."
           class="search-input">
  </div>

  <div class="agent-list">
    <button class="agent-card" data-agent="plot">
      <div class="agent-avatar" style="background: var(--agent-plot)">
        📐
      </div>
      <div class="agent-info">
        <div class="agent-name">Plot Architect</div>
        <div class="agent-role">Story Structure</div>
      </div>
    </button>

    <button class="agent-card selected" data-agent="world">
      <div class="agent-avatar" style="background: var(--agent-world)">
        🌍
      </div>
      <div class="agent-info">
        <div class="agent-name">World Builder</div>
        <div class="agent-role">Setting Creator</div>
      </div>
      <div class="agent-status online"></div>
    </button>
  </div>

  <div class="agent-chat-preview collapsed">
    <button class="chat-toggle">
      <span>▼ Show conversation</span>
    </button>
    <div class="chat-preview-content">
      <!-- Mini chat view -->
    </div>
  </div>
</aside>
```

```css
.agent-search {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-divider);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.agent-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.agent-card {
  width: 100%;
  height: var(--agent-card-height);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  transition: all var(--duration-fast) var(--ease-out);
}

.agent-card:hover {
  background: var(--color-surface-hover);
  transform: translateX(2px);
}

.agent-card.selected {
  background: var(--color-surface-hover);
  border-left: 3px solid var(--color-accent);
}

.agent-status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
}

.agent-status.online {
  background: var(--color-success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 4. Chat Panel Component

```html
<aside class="panel-chat">
  <div class="chat-header">
    <div class="chat-agent-info">
      <div class="chat-agent-avatar" style="background: var(--agent-world)">
        🌍
      </div>
      <div>
        <div class="chat-agent-name">World Builder</div>
        <div class="chat-context">Scene 3, Page 7</div>
      </div>
    </div>
    <button class="icon-button" aria-label="Chat options">⋮</button>
  </div>

  <div class="chat-messages">
    <div class="chat-message agent">
      <div class="message-content">
        Based on the scene you're writing, the living room should...
      </div>
      <div class="message-time">2:34 PM</div>
    </div>

    <div class="chat-message user">
      <div class="message-content">
        What about the lighting in this scene?
      </div>
      <div class="message-time">2:35 PM</div>
    </div>
  </div>

  <div class="chat-input-container">
    <div class="chat-suggestions">
      <button class="suggestion-chip">Describe the room</button>
      <button class="suggestion-chip">Add atmosphere</button>
    </div>
    <div class="chat-input-wrapper">
      <textarea class="chat-input"
                placeholder="Type your message..."
                rows="1"></textarea>
      <button class="send-button" aria-label="Send message">
        <svg>...</svg>
      </button>
    </div>
  </div>
</aside>
```

```css
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-divider);
}

.chat-agent-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chat-agent-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.chat-context {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chat-message {
  max-width: 80%;
  animation: messageSlideIn var(--duration-fast) var(--ease-out);
}

.chat-message.agent {
  align-self: flex-start;
}

.chat-message.user {
  align-self: flex-end;
}

.message-content {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.chat-message.agent .message-content {
  background: var(--color-background);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
}

.chat-message.user .message-content {
  background: var(--color-accent-gradient);
  color: var(--color-text-inverse);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
}

.chat-suggestions {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
}

.suggestion-chip {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-instant);
}

.suggestion-chip:hover {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
}
```

### 5. Smart Text Replacement Component

```html
<div class="smart-replace-container" style="top: 200px; left: 400px;">
  <button class="smart-replace-trigger">
    ✨ Replace with suggestion
  </button>

  <div class="smart-replace-dropdown hidden">
    <div class="smart-replace-option" data-agent="plot">
      <span class="option-icon">📐</span>
      <div class="option-content">
        <div class="option-text">"He walked slowly through the door"</div>
        <div class="option-agent">Plot Architect</div>
      </div>
    </div>

    <div class="smart-replace-option" data-agent="character">
      <span class="option-icon">🧠</span>
      <div class="option-content">
        <div class="option-text">"Ben trudged through the doorway"</div>
        <div class="option-agent">Character Psychologist</div>
      </div>
    </div>
  </div>
</div>
```

```css
.smart-replace-container {
  position: absolute;
  z-index: var(--z-dropdown);
}

.smart-replace-trigger {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.smart-replace-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs);
  min-width: 280px;
  max-width: 400px;
  animation: dropdownExpand var(--duration-fast) var(--ease-out);
}

.smart-replace-dropdown.hidden {
  display: none;
}

@keyframes dropdownExpand {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.smart-replace-option {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  transition: background var(--duration-instant) var(--ease-out);
}

.smart-replace-option:hover {
  background: var(--color-surface-hover);
}

.option-icon {
  font-size: 16px;
  margin-top: 2px;
}

.option-text {
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
}

.option-agent {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}
```

### 6. Screenplay Editor Component

```html
<main class="panel-editor">
  <div class="editor-toolbar">
    <select class="format-selector">
      <option value="scene">Scene Heading</option>
      <option value="action">Action</option>
      <option value="character">Character</option>
      <option value="dialogue">Dialogue</option>
      <option value="parenthetical">Parenthetical</option>
      <option value="transition">Transition</option>
    </select>

    <div class="toolbar-divider"></div>

    <button class="toolbar-button" data-format="bold">B</button>
    <button class="toolbar-button" data-format="italic">I</button>
    <button class="toolbar-button" data-format="underline">U</button>
  </div>

  <div class="editor-container">
    <div class="editor-margins">
      <div class="line-markers">
        <span class="marker scene">S</span>
        <span class="marker action">A</span>
        <span class="marker character">C</span>
        <span class="marker dialogue">D</span>
      </div>
    </div>

    <div class="editor-content" contenteditable="true">
      <div class="screenplay-scene">INT. LIVING ROOM - EVENING</div>
      <div class="screenplay-action">
        Ben is testing out arc studio, screenwriting app.
      </div>
      <div class="screenplay-character">BEN</div>
      <div class="screenplay-dialogue">So far so good.</div>
      <div class="screenplay-action">
        He was was frustrated for a moment trying how to figure out
        how to switch from character dialogue to action line.
      </div>
      <div class="screenplay-character">BEN</div>
      <div class="screenplay-parenthetical">(CONT'D)</div>
      <div class="screenplay-dialogue">That wasn't to hard...</div>
    </div>
  </div>

  <div class="editor-status">
    <span class="status-item">Page 1 of 5</span>
    <span class="status-item">1,234 words</span>
    <span class="status-item">
      <span class="save-indicator saved">Saved</span>
    </span>
  </div>
</main>
```

```css
.editor-container {
  flex: 1;
  overflow-y: auto;
  background: var(--color-surface);
  display: flex;
}

.editor-margins {
  width: 40px;
  background: var(--color-background);
  border-right: 1px solid var(--color-divider);
  padding-top: var(--spacing-lg);
}

.line-markers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  align-items: center;
}

.marker {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-inverse);
  opacity: 0.3;
  transition: opacity var(--duration-fast);
}

.marker.active {
  opacity: 1;
}

.marker.scene { background: var(--agent-plot); }
.marker.action { background: var(--color-text-secondary); }
.marker.character { background: var(--agent-character); }
.marker.dialogue { background: var(--agent-dialog); }

.editor-content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
  font-family: var(--font-screenplay);
  font-size: 12pt;
  line-height: var(--leading-screenplay);
}

/* Screenplay Formatting */
.screenplay-scene {
  margin: 24pt 0 12pt 0;
  text-transform: uppercase;
  font-weight: bold;
}

.screenplay-action {
  margin: 12pt 0;
  max-width: 100%;
}

.screenplay-character {
  margin: 12pt 0 0 0;
  margin-left: 2.2in;
  text-transform: uppercase;
}

.screenplay-parenthetical {
  margin: 0;
  margin-left: 1.6in;
  max-width: 2in;
}

.screenplay-dialogue {
  margin: 0 0 12pt 0;
  margin-left: 1in;
  max-width: 3.5in;
}

.screenplay-transition {
  margin: 12pt 0;
  text-align: right;
  text-transform: uppercase;
}

.editor-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background);
  border-top: 1px solid var(--color-divider);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.save-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.save-indicator::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-warning);
}

.save-indicator.saved::before {
  background: var(--color-success);
}

.save-indicator.error::before {
  background: var(--color-error);
}
```

## Animation Specifications

### Context Broadcasting Animation
```css
@keyframes contextPulse {
  0% {
    box-shadow: 0 0 0 0 var(--color-accent);
  }
  50% {
    box-shadow: 0 0 0 8px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

.broadcasting {
  animation: contextPulse 1s ease-out;
}
```

### Panel Collapse/Expand
```javascript
// Smooth panel animation
function togglePanel(panel, show) {
  const width = show ? 'var(--panel-agent-width)' : '0px';
  panel.style.transition = 'width var(--duration-normal) var(--ease-smooth)';
  panel.style.width = width;
}
```

## Responsive Behavior Implementation

### Breakpoint Handlers
```javascript
const breakpoints = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1440
};

function handleResponsive() {
  const width = window.innerWidth;

  if (width < breakpoints.tablet) {
    // Mobile: Stack panels vertically
    document.querySelector('.workspace').style.gridTemplateColumns = '1fr';
    enableSwipeNavigation();
  } else if (width < breakpoints.laptop) {
    // Tablet: Tab-based switching
    enableTabSwitching();
  } else if (width < breakpoints.desktop) {
    // Laptop: Collapsible agent panel
    document.querySelector('.panel-agents').classList.add('collapsible');
  } else {
    // Desktop: Full three-panel
    document.querySelector('.workspace').style.gridTemplateColumns =
      'var(--panel-agent-width) 1fr var(--panel-chat-width)';
  }
}
```

## Accessibility Implementation

### Keyboard Navigation
```javascript
// Agent panel keyboard navigation
document.querySelector('.agent-list').addEventListener('keydown', (e) => {
  const current = document.activeElement;
  const agents = Array.from(document.querySelectorAll('.agent-card'));
  const index = agents.indexOf(current);

  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      agents[Math.min(index + 1, agents.length - 1)]?.focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      agents[Math.max(index - 1, 0)]?.focus();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      current?.click();
      break;
  }
});
```

### Screen Reader Announcements
```javascript
// Announce context changes
function announceContext(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

## Performance Optimizations

### Virtual Scrolling for Agent List
```javascript
// Implement virtual scrolling for large agent lists
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.render();
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;

    // Only render visible items
    const visibleItems = this.items.slice(startIndex, endIndex);
    // ... render logic
  }
}
```

### Context Broadcasting Throttle
```javascript
// Throttle context updates
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;

  return function(...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

const broadcastContext = throttle((context) => {
  // Send context to agents
  socket.emit('context:update', context);
}, 100);
```