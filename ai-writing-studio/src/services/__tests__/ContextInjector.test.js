import ContextInjector from '../ContextInjector.js';
import SessionMemoryStore from '../SessionMemoryStore.js';

describe('ContextInjector', () => {
  let injector;
  let memoryStore;
  const testSessionId = 'test-session-123';

  beforeEach(() => {
    memoryStore = new SessionMemoryStore({ maxEntriesPerSession: 50 });
    injector = new ContextInjector(memoryStore);
  });

  afterEach(() => {
    memoryStore.destroy();
  });

  describe('Relevance Scoring', () => {
    test('should extract keywords correctly', () => {
      const text = 'The space adventure with alien characters and trust issues';
      const keywords = injector.extractKeywords(text);

      expect(keywords).toContain('space');
      expect(keywords).toContain('adventure');
      expect(keywords).toContain('alien');
      expect(keywords).toContain('characters');
      expect(keywords).toContain('trust');
      expect(keywords).toContain('issues');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('and');
    });

    test('should calculate keyword overlap', () => {
      const keywords1 = ['space', 'adventure', 'alien'];
      const keywords2 = ['space', 'alien', 'contact'];

      const overlap = injector.calculateKeywordOverlap(keywords1, keywords2);

      expect(overlap).toBeCloseTo(0.667, 2); // 2 out of 3
    });

    test('should calculate semantic similarity', () => {
      const text1 = 'space adventure with aliens';
      const text2 = 'alien adventure in space';

      const similarity = injector.calculateSemanticSimilarity(text1, text2);

      expect(similarity).toBeGreaterThanOrEqual(0.5);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    test('should get agent relationship score', () => {
      const score1 = injector.getAgentRelationScore('plot-architect', 'character-psychologist');
      const score2 = injector.getAgentRelationScore('editor', 'style-mentor');
      const score3 = injector.getAgentRelationScore('plot-architect', 'editor');

      expect(score1).toBe(0.9); // High relationship
      expect(score2).toBe(0.9); // High relationship
      expect(score3).toBe(0.4); // Low relationship
    });

    test('should score conversations by relevance', async () => {
      await memoryStore.addConversation(testSessionId, 'plot-architect', 'user', 'I want to write a space adventure');
      await memoryStore.addConversation(testSessionId, 'character-psychologist', 'user', 'The protagonist has trust issues');
      await memoryStore.addConversation(testSessionId, 'world-builder', 'user', 'The story is set on Mars');

      const conversations = await memoryStore.getAllConversations(testSessionId);
      const scored = injector.scoreConversations(
        conversations,
        'dialogue-coach',
        'How should the alien character speak?'
      );

      expect(scored.length).toBeGreaterThan(0);
      expect(scored[0].relevanceScore).toBeDefined();
      expect(scored[0].relevanceScore).toBeGreaterThan(0);
    });
  });

  describe('Context Selection', () => {
    test('should select top context within token limit', () => {
      const scoredConversations = [
        { message: 'Short message', relevanceScore: 0.9 },
        { message: 'A'.repeat(1000), relevanceScore: 0.8 },
        { message: 'Another short message', relevanceScore: 0.7 }
      ];

      const selected = injector.selectTopContext(scoredConversations, 100);

      expect(selected.length).toBeGreaterThan(0);
      expect(selected[0].message).toBe('Short message');
    });

    test('should truncate single message if exceeds limit', () => {
      const scoredConversations = [
        { message: 'A'.repeat(1000), relevanceScore: 0.9 }
      ];

      const selected = injector.selectTopContext(scoredConversations, 50);

      expect(selected.length).toBe(1);
      expect(selected[0].truncated).toBe(true);
      expect(selected[0].message).toContain('...');
    });
  });

  describe('Context Formatting', () => {
    test('should format context correctly', () => {
      const selectedContext = [
        {
          agentId: 'plot-architect',
          role: 'user',
          message: 'Help with space adventure',
          timestamp: new Date().toISOString()
        },
        {
          agentId: 'character-psychologist',
          role: 'assistant',
          message: 'Consider trust issues',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString()
        }
      ];

      const formatted = injector.formatContext(selectedContext, 'dialogue-coach');

      expect(formatted.formattedText).toContain('[CONTEXT FROM OTHER AGENTS]');
      expect(formatted.formattedText).toContain('[END CONTEXT]');
      expect(formatted.formattedText).toContain('Plot Architect');
      expect(formatted.formattedText).toContain('Character Psychologist');
      expect(formatted.metadata.contextCount).toBe(2);
      expect(formatted.metadata.targetAgent).toBe('dialogue-coach');
    });

    test('should format time ago correctly', () => {
      const now = new Date().toISOString();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60000).toISOString();

      expect(injector.formatTimeAgo(now)).toBe('just now');
      expect(injector.formatTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
      expect(injector.formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');
    });
  });

  describe('Integration', () => {
    test('should get relevant context end-to-end', async () => {
      // Add conversations to memory store
      await memoryStore.addConversation(testSessionId, 'plot-architect', 'user',
        'I want to write a space adventure with alien first contact');
      await memoryStore.addConversation(testSessionId, 'plot-architect', 'assistant',
        'Great! Consider the classic three-act structure for your space adventure');
      await memoryStore.addConversation(testSessionId, 'character-psychologist', 'user',
        'The protagonist should have trust issues from a past betrayal');

      // Get relevant context for dialogue coach
      const context = await injector.getRelevantContext(
        testSessionId,
        'dialogue-coach',
        'How should the alien character speak to someone with trust issues?'
      );

      expect(context).not.toBeNull();
      expect(context.formattedText).toContain('space adventure');
      expect(context.formattedText).toContain('trust issues');
      expect(context.metadata.agents).toContain('character-psychologist');
    });

    test('should return null when no context available', async () => {
      const context = await injector.getRelevantContext(
        'empty-session',
        'dialogue-coach',
        'How should characters speak?'
      );

      expect(context).toBeNull();
    });

    test('should respect agent enabled settings', async () => {
      await memoryStore.addConversation(testSessionId, 'plot-architect', 'user',
        'Space adventure story');

      injector.setAgentEnabled('dialogue-coach', false);

      const context = await injector.getRelevantContext(
        testSessionId,
        'dialogue-coach',
        'Character dialogue'
      );

      expect(context).toBeNull();
    });

    test('should respect global enabled setting', async () => {
      await memoryStore.addConversation(testSessionId, 'plot-architect', 'user',
        'Space adventure story');

      injector.setGlobalEnabled(false);

      const context = await injector.getRelevantContext(
        testSessionId,
        'dialogue-coach',
        'Character dialogue'
      );

      expect(context).toBeNull();
    });
  });

  describe('Configuration', () => {
    test('should get injection stats', () => {
      const stats = injector.getInjectionStats();

      expect(stats.enabled).toBe(true);
      expect(stats.agentSettings).toBeDefined();
      expect(stats.tokenLimits).toBeDefined();
      expect(stats.relevanceWeights).toBeDefined();
    });

    test('should toggle agent settings', () => {
      injector.setAgentEnabled('plot-architect', false);
      injector.setAgentEnabled('dialogue-coach', true);

      const stats = injector.getInjectionStats();

      expect(stats.agentSettings['plot-architect'].enabled).toBe(false);
      expect(stats.agentSettings['dialogue-coach'].enabled).toBe(true);
    });
  });
});