import express from 'express';

const router = express.Router();

export default function createMemoryRoutes(memoryStore) {
  // GET /api/memory/conversations - Get all conversations for session
  router.get('/conversations', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'No session found'
        });
      }

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const allConversations = await memoryStore.getAllConversations(sessionId);

      const paginatedConversations = allConversations.slice(offset, offset + limit);

      res.json({
        success: true,
        data: {
          conversations: paginatedConversations,
          metadata: {
            total: allConversations.length,
            returned: paginatedConversations.length,
            offset: offset,
            limit: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversations'
      });
    }
  });

  // GET /api/memory/conversations/:agentId - Get specific agent's history
  router.get('/conversations/:agentId', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { agentId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'No session found'
        });
      }

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID is required'
        });
      }

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const agentConversations = await memoryStore.getConversationHistory(sessionId, agentId);

      const paginatedConversations = agentConversations.slice(offset, offset + limit);

      res.json({
        success: true,
        data: {
          agentId: agentId,
          conversations: paginatedConversations,
          metadata: {
            total: agentConversations.length,
            returned: paginatedConversations.length,
            offset: offset,
            limit: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching agent conversations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve agent conversations'
      });
    }
  });

  // GET /api/memory/context/:agentId - Get relevant context for agent (prep for Story 2.3)
  router.get('/context/:agentId', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { agentId } = req.params;
      const { includeOtherAgents } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'No session found'
        });
      }

      let context = [];

      if (includeOtherAgents === 'true') {
        // Get all conversations for cross-agent context
        const allConversations = await memoryStore.getAllConversations(sessionId);
        // Get last 10 messages across all agents
        context = allConversations.slice(-10);
      } else {
        // Get only current agent's history
        const agentConversations = await memoryStore.getConversationHistory(sessionId, agentId);
        // Get last 5 messages from this agent
        context = agentConversations.slice(-5);
      }

      res.json({
        success: true,
        data: {
          agentId: agentId,
          context: context,
          includesOtherAgents: includeOtherAgents === 'true'
        }
      });
    } catch (error) {
      console.error('Error fetching context:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve context'
      });
    }
  });

  // POST /api/memory/conversation - Add new conversation entry
  router.post('/conversation', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { agentId, role, message } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'No session found'
        });
      }

      // Validate required fields
      if (!agentId || !role || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: agentId, role, and message are required'
        });
      }

      // Validate role
      if (!['user', 'assistant', 'system'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be one of: user, assistant, system'
        });
      }

      // Add conversation to memory store
      const entry = await memoryStore.addConversation(sessionId, agentId, role, message);

      res.json({
        success: true,
        data: {
          message: 'Conversation entry added successfully',
          entry: entry
        }
      });
    } catch (error) {
      console.error('Error adding conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add conversation entry'
      });
    }
  });

  // DELETE /api/memory/session - Clear current session memory
  router.delete('/session', async (req, res) => {
    try {
      const sessionId = req.sessionID;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'No session found'
        });
      }

      // Add a confirmation check
      const { confirm } = req.query;
      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'Confirmation required. Add ?confirm=true to proceed'
        });
      }

      // For production, you might want to add admin authorization here
      // For now, we'll allow any session to clear its own memory

      await memoryStore.clearSession(sessionId);

      res.json({
        success: true,
        data: {
          message: 'Session memory cleared successfully',
          sessionId: sessionId
        }
      });
    } catch (error) {
      console.error('Error clearing session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear session memory'
      });
    }
  });

  // GET /api/memory/stats - Get memory statistics (debug endpoint)
  router.get('/stats', async (req, res) => {
    try {
      const stats = memoryStore.getSessionStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memory statistics'
      });
    }
  });

  return router;
}