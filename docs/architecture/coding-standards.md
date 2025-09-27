# Coding Standards

## General Principles
- Clean, readable code over clever optimizations
- Consistent patterns throughout the codebase
- Comment only when necessary - code should be self-documenting
- Follow existing conventions in neighboring files

## TypeScript/JavaScript
- Use TypeScript for all new code
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Destructure objects when possible
- Use template literals for string interpolation

## React Components
- Functional components with hooks
- One component per file
- Props interfaces defined with TypeScript
- Use semantic HTML elements

## CSS
- Use CSS modules or styled-components
- Follow BEM naming when using classes
- Use CSS variables for theming
- Mobile-first responsive design

## File Naming
- Components: PascalCase (e.g., `AgentCard.tsx`)
- Utilities: camelCase (e.g., `formatScreenplay.ts`)
- Styles: kebab-case (e.g., `agent-panel.css`)
- Tests: `.test.ts` or `.spec.ts` suffix

## Git Commits
- Conventional commits format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused