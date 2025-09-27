import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import AgentPersona from './src/AgentPersona.js';
import AgentTeam from './src/AgentTeam.js';
import ContextAwareAgent from './src/ContextAwareAgent.js';
import UnifiedAgentService from './src/services/UnifiedAgentService.js';
import ContextMiddleware from './src/middleware/ContextMiddleware.js';
import SessionMemoryStore from './src/services/SessionMemoryStore.js';
import ContextInjector from './src/services/ContextInjector.js';
import StoryDriveAgents from './src/services/StoryDriveAgents.js';
import createMemoryRoutes from './src/routes/memoryRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: Please add your OpenAI API key to the .env file');
  console.error('   Edit .env and add: OPENAI_API_KEY=your-key-here');
  process.exit(1);
}

// Initialize agent system
const agentSystem = new AgentPersona(
  process.env.OPENAI_API_KEY,
  process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
);

// Initialize context-aware agent for document editing
const contextAgent = new ContextAwareAgent(
  process.env.OPENAI_API_KEY,
  process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
);

// Initialize team system with context-aware support
const teamSystem = new AgentTeam(agentSystem, contextAgent);

// Initialize unified service for cleaner architecture
const unifiedService = new UnifiedAgentService(agentSystem, contextAgent, teamSystem);

// Initialize session memory store
const memoryStore = new SessionMemoryStore({
  maxEntriesPerSession: 100,
  sessionTTL: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 60 * 60 * 1000  // 1 hour
});

// Initialize context injector
const contextInjector = new ContextInjector(memoryStore);
contextAgent.setContextInjector(contextInjector);

// Initialize Story-Drive agents
const storyDriveAgents = new StoryDriveAgents();

// Enable debug logging if configured
if (process.env.DEBUG_CONTEXT === 'true') {
  console.log('🔍 Context debug mode enabled');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'story-drive-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// API Routes

// Memory API routes
app.use('/api/memory', createMemoryRoutes(memoryStore));

// Load an agent
app.post('/api/agents/:name/load', async (req, res) => {
  try {
    const agent = await agentSystem.loadAgent(req.params.name);
    res.json({
      success: true,
      agent: {
        name: agent.name,
        role: agent.role,
        style: agent.style,
        focus: agent.focus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat with an agent
app.post('/api/agents/:name/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const sessionId = req.sessionID;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Extract context from message if present
    let documentContext = null;
    let cleanMessage = message;

    // Check for context in the message
    const contextMatch = message.match(/\[Context - [^:]+: "([^"]+)"\]\s*\n\n(.+)/s);
    if (contextMatch) {
      documentContext = contextMatch[1];
      cleanMessage = contextMatch[2];
      console.log('📄 Document context found:', documentContext.substring(0, 50) + '...');
      console.log('💬 User message:', cleanMessage);
    } else {
      console.log('💬 User message (no context):', message);
    }

    // Try to load Story-Drive agent first
    let agent = storyDriveAgents.findAgent(req.params.name);

    // Fallback to BMAD agent if not found
    if (!agent) {
      try {
        agent = await agentSystem.loadAgent(req.params.name);
      } catch (error) {
        console.error(`Failed to load BMAD agent ${req.params.name}:`, error);
        // Return a more helpful error
        return res.status(404).json({
          success: false,
          error: `Agent '${req.params.name}' not found. Available agents: plot, character, world, dialog, genre, editor, reader, narrative`
        });
      }
    }

    // Store user message in memory
    await memoryStore.addConversation(sessionId, req.params.name, 'user', cleanMessage);

    // Use context-aware chat if context is provided
    let response;
    if (documentContext) {
      response = await contextAgent.chat(agent, cleanMessage, documentContext, sessionId);
      console.log('🤖 Context-aware response sent');
    } else {
      // Still use contextAgent for cross-agent memory even without document context
      response = await contextAgent.chat(agent, cleanMessage, null, sessionId);
      console.log('🤖 Response sent with cross-agent context');
    }

    // Store agent response in memory
    await memoryStore.addConversation(sessionId, req.params.name, 'assistant', response.message);

    console.log(`   ${response.agent} responded (${response.usage?.total_tokens} tokens used)`);

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get loaded agents
app.get('/api/agents/loaded', (req, res) => {
  res.json({
    agents: agentSystem.getLoadedAgents()
  });
});

// Get available agents from BMAD pack
app.get('/api/agents/available', async (req, res) => {
  const agents = [
    { id: 'plot-architect', name: 'Plot Architect', icon: '🏗️', role: 'Story Structure Specialist' },
    { id: 'character-psychologist', name: 'Character Psychologist', icon: '🧠', role: 'Character Development Expert' },
    { id: 'world-builder', name: 'World Builder', icon: '🌍', role: 'Setting & Universe Creator' },
    { id: 'dialog-specialist', name: 'Dialog Specialist', icon: '💬', role: 'Conversation & Voice Expert' },
    { id: 'genre-specialist', name: 'Genre Specialist', icon: '📚', role: 'Genre Conventions Expert' },
    { id: 'editor', name: 'Editor', icon: '✏️', role: 'Style & Grammar Refinement' },
    { id: 'beta-reader', name: 'Beta Reader', icon: '👁️', role: 'First Reader Perspective' },
    { id: 'narrative-designer', name: 'Narrative Designer', icon: '🎮', role: 'Interactive Story Expert' }
  ];

  res.json({ agents });
});

// TEAM MODE ENDPOINTS

// Load team
app.post('/api/team/load', async (req, res) => {
  try {
    const team = await teamSystem.loadTeam('creative-writing');
    res.json({
      success: true,
      team: {
        name: team.name,
        icon: team.icon,
        description: team.description,
        agents: team.agents,
        workflows: team.workflows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Team collaboration
app.post('/api/team/collaborate', async (req, res) => {
  try {
    const { task, options = {} } = req.body;

    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task is required'
      });
    }

    // Extract context from task if present (same as individual chat)
    let documentContext = null;
    let cleanTask = task;

    const contextMatch = task.match(/\[Context - [^:]+: "([^"]+)"\]\s*\n\n(.+)/s);
    if (contextMatch) {
      documentContext = contextMatch[1];
      cleanTask = contextMatch[2];
      console.log('📄 Team - Document context found:', documentContext.substring(0, 50) + '...');
      console.log('🎭 Team task:', cleanTask);
    } else {
      console.log('🎭 Team task (no context):', task);
    }

    // Pass document context in options for team to use
    const teamOptions = {
      ...options,
      documentContext: documentContext || null
    };

    const result = await teamSystem.collaborateOnTask(cleanTask, teamOptions);

    res.json({
      success: true,
      collaboration: result
    });

  } catch (error) {
    console.error('Team collaboration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Team discussion (agents talk among themselves)
app.post('/api/team/discuss', async (req, res) => {
  try {
    const { topic, rounds = 2 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    console.log(`💬 Team discussion requested: ${topic}`);

    const discussion = await teamSystem.discussAmongAgents(topic, rounds);

    res.json({
      success: true,
      discussion: discussion
    });

  } catch (error) {
    console.error('Team discussion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear conversation
app.post('/api/conversations/:id/clear', (req, res) => {
  agentSystem.clearConversation(req.params.id);
  res.json({ success: true });
});

// DOCUMENT SAVE ENDPOINT - Story 1.3 Implementation
app.post('/api/documents/save', async (req, res) => {
  try {
    const { documentId, content, timestamp, version, wordCount } = req.body;

    if (!content || !documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and content are required'
      });
    }

    // Since we don't have authentication yet, use a default user folder
    // In production, this would use req.user.id from authentication middleware
    const userId = 'default-user';

    // Create documents directory structure if it doesn't exist
    const documentsPath = path.join(__dirname, 'documents', userId);

    try {
      await fs.mkdir(documentsPath, { recursive: true });
    } catch (error) {
      console.error('Error creating documents directory:', error);
    }

    // Create filename with version
    const filename = `${documentId}-v${version || 1}.json`;
    const filePath = path.join(documentsPath, filename);

    // Document data to save
    const documentData = {
      documentId,
      content,
      timestamp: timestamp || Date.now(),
      version: version || 1,
      wordCount: wordCount || 0,
      userId,
      savedAt: new Date().toISOString()
    };

    // Save to file system with atomic write
    const tempPath = filePath + '.tmp';
    await fs.writeFile(tempPath, JSON.stringify(documentData, null, 2));
    await fs.rename(tempPath, filePath);

    // Maintain version history - clean up old versions (keep last 10)
    try {
      const files = await fs.readdir(documentsPath);
      const versionFiles = files.filter(f => f.startsWith(documentId + '-v'));

      if (versionFiles.length > 10) {
        // Sort by version number and delete oldest
        versionFiles.sort((a, b) => {
          const versionA = parseInt(a.match(/-v(\d+)\.json/)?.[1] || '0');
          const versionB = parseInt(b.match(/-v(\d+)\.json/)?.[1] || '0');
          return versionA - versionB;
        });

        // Delete oldest versions
        const toDelete = versionFiles.slice(0, versionFiles.length - 10);
        for (const file of toDelete) {
          await fs.unlink(path.join(documentsPath, file)).catch(() => {});
        }
      }
    } catch (error) {
      console.warn('Error managing version history:', error);
    }

    console.log(`✅ Document saved: ${documentId} v${version} (${wordCount} words)`);

    res.json({
      success: true,
      documentId,
      version: version || 1,
      savedAt: documentData.savedAt
    });

  } catch (error) {
    console.error('Document save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save document'
    });
  }
});

// Load document endpoint (for recovery)
app.get('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { version } = req.query;

    // Default user for now (no auth)
    const userId = 'default-user';
    const documentsPath = path.join(__dirname, 'documents', userId);

    let filePath;
    if (version) {
      filePath = path.join(documentsPath, `${documentId}-v${version}.json`);
    } else {
      // Find latest version
      const files = await fs.readdir(documentsPath);
      const versionFiles = files.filter(f => f.startsWith(documentId + '-v'));

      if (versionFiles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Get highest version
      versionFiles.sort((a, b) => {
        const versionA = parseInt(a.match(/-v(\d+)\.json/)?.[1] || '0');
        const versionB = parseInt(b.match(/-v(\d+)\.json/)?.[1] || '0');
        return versionB - versionA;
      });

      filePath = path.join(documentsPath, versionFiles[0]);
    }

    const documentData = await fs.readFile(filePath, 'utf8');
    res.json({
      success: true,
      document: JSON.parse(documentData)
    });

  } catch (error) {
    console.error('Document load error:', error);
    res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
    debugMode: process.env.DEBUG_CONTEXT === 'true'
  });
});

// DEBUG ENDPOINTS - Only enabled in debug mode
if (process.env.DEBUG_CONTEXT === 'true') {
  // Validate context extraction
  app.post('/api/debug/validate-context', (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const validation = unifiedService.validateContext(message);
    res.json(validation);
  });

  // Test context flow end-to-end
  app.post('/api/debug/test-context-flow', async (req, res) => {
    const { agentId = 'plot-architect', message = 'Review this', context = 'Test document content' } = req.body;

    try {
      const result = await unifiedService.testContextFlow(agentId, message, context);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  });

  // Get service metrics
  app.get('/api/debug/metrics', (req, res) => {
    res.json({
      service: unifiedService.getMetrics(),
      timestamp: new Date().toISOString()
    });
  });

  // Test context injection
  app.post('/api/debug/test-injection', (req, res) => {
    const { systemPrompt = 'You are a helpful assistant.', context = 'Test content', agentName = 'Assistant' } = req.body;

    const injected = ContextMiddleware.inject(systemPrompt, context, agentName);

    res.json({
      original: systemPrompt,
      injected: injected,
      contextLength: context.length
    });
  });

  console.log('🔍 Debug endpoints enabled:');
  console.log('   POST /api/debug/validate-context');
  console.log('   POST /api/debug/test-context-flow');
  console.log('   GET  /api/debug/metrics');
  console.log('   POST /api/debug/test-injection');
}

// Start server
app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 AI Writing Studio Server Running!        ║
║                                                ║
║   API: http://localhost:${PORT}                   ║
║   UI:  http://localhost:${PORT}                   ║
║                                                ║
║   Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}          ║
║   Status: Ready to use real AI agents!        ║
║                                                ║
╚════════════════════════════════════════════════╝

✅ OpenAI API Key configured
  `);

  // Load Story-Drive agents
  console.log('🎭 Loading Story-Drive Creative Writing Agents...');
  await storyDriveAgents.loadAllAgents();

  console.log('✨ Story-Drive agents ready with Epic 2 context awareness!');
});