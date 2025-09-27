# AI-Powered Creative Writing Studio - System Architecture Plan

## 🎯 Project Vision
Build a production-ready web application that fully implements the BMAD Creative Writing system with real AI personas, workflow orchestration, and persistent project management.

## 📊 System Requirements Analysis

### Core Functionality Needed
1. **AI Persona Management**: Each agent maintains consistent personality/expertise
2. **Workflow Orchestration**: Multi-step workflows with agent handoffs
3. **State Persistence**: Save writing projects, drafts, and progress
4. **Template Processing**: Dynamic forms with elicitation flows
5. **Multi-user Support**: Individual workspaces and projects
6. **Real-time Collaboration**: Agent interactions feel conversational

## 🏗️ Proposed Architecture

### 1. Frontend Layer (React/Next.js)
```
┌─────────────────────────────────────────┐
│           User Interface                │
├─────────────────────────────────────────┤
│ • Project Dashboard                     │
│ • Agent Chat Interface                  │
│ • Workflow Pipeline Visualizer          │
│ • Document Editor (Rich Text)           │
│ • Template Forms                        │
│ • Progress Tracking                     │
└─────────────────────────────────────────┘
```

### 2. API Layer (Node.js/Python)
```
┌─────────────────────────────────────────┐
│          API Gateway                    │
├─────────────────────────────────────────┤
│ • Authentication & Authorization        │
│ • Workflow Orchestration Engine         │
│ • Agent Management Service              │
│ • Template Processing Service           │
│ • WebSocket for Real-time Updates       │
└─────────────────────────────────────────┘
```

### 3. AI Integration Layer
```
┌─────────────────────────────────────────┐
│      AI Model Integration               │
├─────────────────────────────────────────┤
│ • OpenAI GPT-4 API                     │
│ • Claude API (Anthropic)               │
│ • Persona Injection System             │
│ • Context Management                    │
│ • Response Formatting                   │
└─────────────────────────────────────────┘
```

### 4. Data Layer
```
┌─────────────────────────────────────────┐
│         Database Schema                 │
├─────────────────────────────────────────┤
│ PostgreSQL:                             │
│ • Users & Authentication               │
│ • Projects & Documents                 │
│ • Workflow Executions                  │
│ • Agent Conversations                  │
│ • Templates & Forms                    │
│                                        │
│ Redis:                                 │
│ • Session Management                   │
│ • Workflow State Cache                 │
│ • Real-time Subscriptions             │
│                                        │
│ S3/Storage:                           │
│ • Document Exports                     │
│ • Generated Assets                     │
└─────────────────────────────────────────┘
```

## 🔧 Technical Stack Recommendation

### Frontend
- **Framework**: Next.js 14 (React)
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query
- **Rich Text Editor**: TipTap or Lexical
- **Real-time**: Socket.io client

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS or Express
- **API**: GraphQL with Apollo Server
- **Queue**: BullMQ for workflow orchestration
- **WebSockets**: Socket.io

### AI Integration
- **Primary**: OpenAI GPT-4 API
- **Secondary**: Anthropic Claude API
- **Embedding**: OpenAI Embeddings for context
- **Vector DB**: Pinecone or Weaviate

### Infrastructure
- **Hosting**: AWS/Vercel/Railway
- **Database**: PostgreSQL (Supabase/Neon)
- **Cache**: Redis (Upstash)
- **File Storage**: AWS S3
- **Monitoring**: Sentry + Datadog

## 📋 Database Schema (Simplified)

```sql
-- Users and workspace
users (id, email, name, settings)
workspaces (id, user_id, name, preferences)

-- Projects and documents
projects (id, workspace_id, title, type, workflow_id, status)
documents (id, project_id, title, content, version)
document_versions (id, document_id, content, created_at)

-- Workflow execution
workflow_executions (id, project_id, workflow_name, status, context)
workflow_steps (id, execution_id, step_name, agent_id, status, output)

-- Agent interactions
agent_sessions (id, project_id, agent_name, persona_config)
conversations (id, session_id, role, content, metadata)

-- Templates and forms
template_instances (id, project_id, template_name, data, completed)
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Next.js project with TypeScript
- [ ] Design database schema
- [ ] Create authentication system
- [ ] Build basic project management CRUD

### Phase 2: Agent System (Weeks 3-4)
- [ ] Implement AI persona injection
- [ ] Create agent chat interface
- [ ] Build context management system
- [ ] Test with 2-3 agents (Plot Architect, Character Psychologist)

### Phase 3: Workflow Engine (Weeks 5-6)
- [ ] Build workflow orchestration engine
- [ ] Implement step execution and state management
- [ ] Create workflow visualizer UI
- [ ] Test with simple novel-writing workflow

### Phase 4: Template System (Weeks 7-8)
- [ ] Build dynamic form generator from YAML
- [ ] Implement elicitation flows
- [ ] Create template UI components
- [ ] Add validation and progress tracking

### Phase 5: Editor & Export (Weeks 9-10)
- [ ] Integrate rich text editor
- [ ] Add document versioning
- [ ] Implement export formats (DOCX, PDF, Markdown)
- [ ] Create publishing preparation tools

### Phase 6: Polish & Deploy (Weeks 11-12)
- [ ] Add real-time collaboration features
- [ ] Implement progress analytics
- [ ] Performance optimization
- [ ] Deploy to production

## 💡 Key Design Decisions

### 1. AI Persona Implementation
```typescript
class AgentPersona {
  private systemPrompt: string;
  private personality: PersonalityTraits;
  private expertise: string[];

  async generateResponse(userInput: string, context: Context) {
    // Inject persona into prompt
    const prompt = this.buildPromptWithPersona(userInput, context);

    // Call AI API with consistent personality
    return await ai.complete(prompt);
  }
}
```

### 2. Workflow State Machine
```typescript
class WorkflowOrchestrator {
  async executeStep(step: WorkflowStep) {
    // Load appropriate agent
    const agent = await this.loadAgent(step.agent);

    // Process with template if specified
    if (step.template) {
      return await this.processWithTemplate(agent, step.template);
    }

    // Execute and pass to next step
    const output = await agent.execute(step.inputs);
    await this.saveStepOutput(output);

    // Trigger next step
    this.triggerNextStep();
  }
}
```

### 3. Real-time Updates
- WebSocket events for agent responses
- Live workflow progress indicators
- Collaborative editing notifications

## 🎨 UI/UX Concepts

### Main Dashboard
- **Project Cards**: Visual project status
- **Active Agents**: Currently activated personas
- **Workflow Pipeline**: Visual progress tracker
- **Recent Documents**: Quick access to drafts

### Agent Interaction
- **Chat Interface**: Conversational UI with agent
- **Context Sidebar**: Shows relevant project info
- **Suggestion Panel**: Agent provides inline suggestions
- **Voice Toggle**: Each agent has distinct "voice"

### Workflow Visualization
- **Pipeline View**: See all steps and progress
- **Agent Handoffs**: Visual representation of data flow
- **Step Details**: Expand to see inputs/outputs
- **Skip/Retry Options**: Manual workflow control

## 🔐 Security Considerations
- JWT-based authentication
- Rate limiting on AI API calls
- Input sanitization for prompts
- Project-level access control
- Encrypted storage for API keys

## 📈 Scalability Planning
- Horizontal scaling for API servers
- Queue-based workflow processing
- Caching layer for AI responses
- CDN for static assets
- Database read replicas

## 🎯 Success Metrics
- Agent response quality (user ratings)
- Workflow completion rates
- Document export success
- User retention (30-day active)
- AI token usage optimization

## Next Steps

1. **Technology Decision**: Finalize tech stack based on your preferences
2. **MVP Scope**: Define minimum viable features
3. **API Design**: Create OpenAPI specification
4. **UI Mockups**: Design key interfaces
5. **Prototype**: Build proof-of-concept for agent system

This is a comprehensive plan for building a production-ready system. Where would you like to start?