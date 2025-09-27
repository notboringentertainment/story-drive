# Source Tree Structure

```
story-drive/
├── .bmad-core/           # BMAD agent system
│   ├── agents/          # Agent persona definitions
│   ├── tasks/           # Reusable task workflows
│   ├── templates/       # Document templates
│   └── core-config.yaml # Project configuration
│
├── docs/
│   ├── architecture/    # Technical documentation
│   │   ├── ui-design-system.md
│   │   ├── component-specifications.md
│   │   └── ui-mockup-specifications.md
│   ├── stories/         # User stories and epics
│   │   └── epic-3-developer-handoff.md
│   ├── prd/            # Product requirements (sharded)
│   └── qa/             # QA documentation
│
├── public/
│   ├── styles/         # Global styles
│   │   └── design-tokens.css  # CSS variables
│   └── index.html      # App entry point
│
├── src/
│   ├── components/     # React components
│   │   ├── AgentPanel/
│   │   ├── Editor/
│   │   └── ChatPanel/
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── services/       # API/business logic
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # App entry point
│
├── tests/              # Test files
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite configuration
└── CLAUDE.md           # AI assistant instructions
```

## Key Directories

### `/src/components/`
Organized by feature - each major UI section has its own folder with component, styles, and tests.

### `/docs/architecture/`
Technical specifications, design systems, and architectural decisions.

### `/docs/stories/`
User stories for implementation, following Epic structure.

### `/.bmad-core/`
BMAD agent system - DO NOT MODIFY unless updating agent behaviors.

## Import Patterns

```typescript
// Absolute imports from src
import { AgentCard } from '@/components/AgentPanel';
import { formatScreenplay } from '@/utils/screenplay';

// Design tokens
import '@/styles/design-tokens.css';
```