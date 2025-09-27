/**
 * UnifiedAgentService - Single entry point for all agent interactions
 * Replaces scattered context logic with centralized handling
 */

import ContextMiddleware from '../middleware/ContextMiddleware.js';

class UnifiedAgentService {
  constructor(agentSystem, contextAgent, teamSystem) {
    this.agentSystem = agentSystem;
    this.contextAgent = contextAgent;
    this.teamSystem = teamSystem;
    this.metrics = {
      totalRequests: 0,
      contextRequests: 0,
      errors: 0
    };
  }

  /**
   * Unified chat interface for all agent types
   * This is the single entry point that should be used
   */
  async chat(agentId, message, options = {}) {
    this.metrics.totalRequests++;

    try {
      // Extract and validate context
      const { context, cleanMessage, type } = ContextMiddleware.extract(message);
      const validatedContext = ContextMiddleware.validate(context, options.validation);

      if (validatedContext) {
        this.metrics.contextRequests++;
        ContextMiddleware.log('Processing context-aware request', {
          agentId,
          contextType: type,
          contextLength: validatedContext.length
        });
      }

      // Route to appropriate handler
      if (agentId === 'team') {
        return await this.handleTeamChat(cleanMessage, validatedContext, options);
      } else {
        return await this.handleIndividualChat(agentId, cleanMessage, validatedContext, options);
      }

    } catch (error) {
      this.metrics.errors++;
      ContextMiddleware.log('Chat error', {
        agentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle individual agent chat
   */
  async handleIndividualChat(agentId, message, context, options) {
    const { conversationId } = options;

    if (context && this.contextAgent) {
      // Use context-aware agent
      const agent = await this.agentSystem.loadAgent(agentId);
      const response = await this.contextAgent.chat(agent, message, context);

      ContextMiddleware.log('Individual agent responded with context', {
        agentId,
        tokensUsed: response.usage?.total_tokens
      });

      return {
        success: true,
        response,
        metadata: {
          contextUsed: true,
          contextLength: context.length
        }
      };
    } else {
      // Standard agent chat
      const response = await this.agentSystem.chat(agentId, message, conversationId);

      ContextMiddleware.log('Individual agent responded without context', {
        agentId,
        tokensUsed: response.usage?.total_tokens
      });

      return {
        success: true,
        response,
        metadata: {
          contextUsed: false
        }
      };
    }
  }

  /**
   * Handle team collaboration
   */
  async handleTeamChat(task, context, options) {
    // Load team if needed
    if (!this.teamSystem.getActiveTeam()) {
      await this.teamSystem.loadTeam('creative-writing');
    }

    const teamOptions = {
      ...options,
      documentContext: context,
      shareContext: true,
      synthesize: options.synthesize !== false
    };

    const result = await this.teamSystem.collaborateOnTask(task, teamOptions);

    ContextMiddleware.log('Team responded', {
      agentCount: result.agents?.length,
      hasSynthesis: !!result.synthesis,
      contextUsed: !!context
    });

    return {
      success: true,
      collaboration: result,
      metadata: {
        contextUsed: !!context,
        agentsInvolved: result.agents
      }
    };
  }

  /**
   * Validate context without processing a message
   * Useful for debugging and testing
   */
  validateContext(message) {
    try {
      const { context, cleanMessage, type } = ContextMiddleware.extract(message);
      const validated = ContextMiddleware.validate(context);
      const stats = ContextMiddleware.getStats(validated);

      return {
        valid: true,
        extracted: {
          hasContext: !!context,
          type,
          contextLength: context?.length || 0,
          cleanMessageLength: cleanMessage.length
        },
        stats
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get service metrics for monitoring
   */
  getMetrics() {
    return {
      ...this.metrics,
      contextRate: this.metrics.totalRequests > 0
        ? (this.metrics.contextRequests / this.metrics.totalRequests * 100).toFixed(1) + '%'
        : '0%',
      errorRate: this.metrics.totalRequests > 0
        ? (this.metrics.errors / this.metrics.totalRequests * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      contextRequests: 0,
      errors: 0
    };
  }

  /**
   * Test context flow end-to-end
   * Returns detailed diagnostic information
   */
  async testContextFlow(agentId, testMessage, testContext) {
    const steps = [];

    try {
      // Step 1: Build message
      const enriched = ContextMiddleware.buildMessage(testMessage, {
        currentParagraph: testContext
      });
      steps.push({
        step: 'Message Building',
        success: true,
        hasContext: enriched.hasContext,
        messageLength: enriched.message.length
      });

      // Step 2: Extract context
      const extracted = ContextMiddleware.extract(enriched.message);
      steps.push({
        step: 'Context Extraction',
        success: true,
        contextFound: !!extracted.context,
        type: extracted.type
      });

      // Step 3: Validate context
      const validated = ContextMiddleware.validate(extracted.context);
      steps.push({
        step: 'Context Validation',
        success: true,
        validated: !!validated
      });

      // Step 4: Process through agent
      const result = await this.chat(agentId, enriched.message, {
        conversationId: 'test-' + Date.now()
      });
      steps.push({
        step: 'Agent Processing',
        success: result.success,
        contextUsed: result.metadata?.contextUsed
      });

      return {
        success: true,
        steps,
        summary: 'Context flow test completed successfully'
      };

    } catch (error) {
      return {
        success: false,
        steps,
        error: error.message,
        summary: 'Context flow test failed'
      };
    }
  }
}

export default UnifiedAgentService;