# Story-Drive UI Design System
## Epic 3: Professional Writing Environment

### Design Philosophy
**"Professional Creative Workspace"** - The intersection of industry-standard tools and modern collaborative platforms.

### Visual Identity

#### Color System

##### Light Mode
```css
--color-background: #FAFAFA;
--color-surface: #FFFFFF;
--color-surface-hover: #F9FAFB;
--color-text-primary: #1A1A1A;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
--color-divider: #E5E7EB;
--color-accent: linear-gradient(135deg, #5B5FDE 0%, #7B7FFF 100%);
--color-accent-solid: #5B5FDE;
--color-accent-hover: #6B6FEE;
```

##### Dark Mode
```css
--color-background: #1A1A1A;
--color-surface: #242424;
--color-surface-hover: #2A2A2A;
--color-text-primary: #E4E4E4;
--color-text-secondary: #9CA3AF;
--color-text-muted: #6B7280;
--color-divider: #374151;
--color-accent: linear-gradient(135deg, #5155CE 0%, #6B6FEE 100%);
--color-accent-solid: #5155CE;
--color-accent-hover: #5B5FDE;
```

##### Agent Persona Colors
```css
--agent-plot: #E11D48;       /* Rose */
--agent-character: #9333EA;   /* Purple */
--agent-world: #059669;       /* Emerald */
--agent-dialog: #0891B2;      /* Cyan */
--agent-genre: #EA580C;       /* Orange */
--agent-editor: #EAB308;      /* Amber */
--agent-reader: #6366F1;      /* Indigo */
--agent-narrative: #EC4899;   /* Pink */
```

#### Typography

##### Font Stack
```css
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
--font-screenplay: 'Courier Prime', 'Courier New', monospace;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
```

##### Type Scale
```css
--text-xs: 11px;    /* Labels, metadata */
--text-sm: 12px;    /* Secondary text */
--text-base: 13px;  /* Body text */
--text-md: 14px;    /* Headers */
--text-lg: 16px;    /* Page titles */
--text-xl: 18px;    /* Main headers */
```

##### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-screenplay: 1.2;  /* Industry standard */
```

### Layout System

#### Grid & Spacing
```css
--spacing-unit: 8px;
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

#### Panel Dimensions
```css
--panel-agent-width: 240px;
--panel-agent-min-width: 180px;
--panel-chat-width: 360px;
--panel-chat-min-width: 320px;
--panel-chat-max-width: 480px;
--nav-height: 48px;
--toolbar-height: 40px;
```

#### Responsive Breakpoints
```css
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-laptop: 1024px;
--breakpoint-desktop: 1440px;
--breakpoint-wide: 1920px;
```

### Component Specifications

#### Agent Card
```css
.agent-card {
  height: 56px;
  padding: 12px;
  border-radius: 6px;
  transition: all 200ms ease-out;
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-card:hover {
  background: var(--color-surface-hover);
  transform: translateX(2px);
}

.agent-card.selected {
  border-left: 3px solid var(--color-accent-solid);
  background: var(--color-surface-hover);
}

.agent-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-role {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

#### Chat Message
```css
.chat-message {
  padding: 12px 16px;
  margin-bottom: 12px;
  animation: messageSlideIn 200ms ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message-agent {
  background: var(--color-surface);
  border-radius: 12px 12px 12px 4px;
  border: 1px solid var(--color-divider);
}

.chat-message-user {
  background: var(--color-accent);
  color: white;
  border-radius: 12px 12px 4px 12px;
  margin-left: 20%;
}
```

#### Smart Replace Button
```css
.smart-replace-trigger {
  position: absolute;
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  animation: fadeIn 150ms ease-out;
}

.smart-replace-options {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 240px;
  max-width: 360px;
  animation: expandDown 200ms ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    transform: scaleY(0.8);
    transform-origin: top;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.smart-replace-option {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  transition: background 150ms ease-out;
}

.smart-replace-option:hover {
  background: var(--color-surface-hover);
}
```

### Animation System

#### Timing Functions
```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Standard Durations
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

#### Context Broadcast Animation
```css
@keyframes contextPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(91, 95, 222, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(91, 95, 222, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(91, 95, 222, 0);
  }
}

.broadcasting {
  animation: contextPulse 1s ease-out;
}
```

### Accessibility Guidelines

#### Keyboard Navigation
- `Tab`: Navigate between panels
- `Arrow Up/Down`: Navigate agent list
- `Enter`: Select agent or send message
- `Escape`: Close panels or cancel operations
- `Cmd/Ctrl + /`: Focus search
- `Cmd/Ctrl + Enter`: Send message

#### ARIA Requirements
```html
<!-- Agent Card -->
<div role="button"
     tabindex="0"
     aria-label="Select Plot Architect agent"
     aria-pressed="false">

<!-- Chat Panel -->
<div role="region"
     aria-label="Chat with World Builder">

<!-- Message Input -->
<textarea aria-label="Type your message"
          aria-describedby="context-indicator">
```

#### Focus Management
```css
:focus-visible {
  outline: 2px solid var(--color-accent-solid);
  outline-offset: 2px;
}

.focus-trap {
  position: relative;
}
```

### Performance Specifications

#### Critical Metrics
- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Layout Shift: < 0.1
- Animation Frame Rate: 60fps
- Context Broadcast Latency: < 100ms
- Agent Response Time: < 2s

#### Optimization Strategies
1. **CSS Containment**: Use `contain: layout style` on panels
2. **Will-Change**: Apply to animated properties
3. **Transform/Opacity**: Prefer for animations
4. **Virtual Scrolling**: For agent lists > 20 items
5. **Throttling**: Context updates at 100ms intervals
6. **Lazy Loading**: Agent avatars and non-visible content

### Dark Mode Implementation
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variables */
  }
}

[data-theme="dark"] {
  /* Manual dark mode override */
}
```

### Responsive Behavior

#### Desktop (>1440px)
- Full three-panel layout
- All panels visible
- Resizable chat panel

#### Laptop (1024px - 1440px)
- Collapsible agent panel
- Fixed-width chat panel
- Editor takes remaining space

#### Tablet (768px - 1024px)
- Tab-based panel switching
- Full-screen editor mode available
- Floating agent selector

#### Mobile (<768px)
- Stack panels vertically
- Swipe navigation between panels
- Collapsed navigation bar
- Bottom sheet for agent selection

### Implementation Checklist

#### Phase 1: Foundation
- [ ] Set up CSS custom properties
- [ ] Implement color system
- [ ] Configure typography
- [ ] Create base layout grid
- [ ] Build responsive breakpoints

#### Phase 2: Components
- [ ] Agent card component
- [ ] Chat message bubbles
- [ ] Navigation tabs
- [ ] Smart replace UI
- [ ] Context indicators

#### Phase 3: Interactions
- [ ] Panel resize functionality
- [ ] Smooth animations
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Context broadcasting

#### Phase 4: Polish
- [ ] Dark mode toggle
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsiveness