import SessionMemoryStore from '../SessionMemoryStore.js';

describe('SessionMemoryStore', () => {
  let store;

  beforeEach(() => {
    store = new SessionMemoryStore({
      maxEntriesPerSession: 5,
      sessionTTL: 1000,
      cleanupInterval: 500
    });
  });

  afterEach(() => {
    store.destroy();
  });

  describe('Basic CRUD operations', () => {
    test('should add conversation to session', async () => {
      const entry = await store.addConversation(
        'session1',
        'plot-architect',
        'user',
        'Help me with a space adventure'
      );

      expect(entry).toMatchObject({
        agentId: 'plot-architect',
        role: 'user',
        message: 'Help me with a space adventure'
      });
      expect(entry.timestamp).toBeDefined();
    });

    test('should retrieve conversation history by session', async () => {
      await store.addConversation('session1', 'plot-architect', 'user', 'Question 1');
      await store.addConversation('session1', 'plot-architect', 'assistant', 'Answer 1');

      const history = await store.getConversationHistory('session1');

      expect(history).toHaveLength(2);
      expect(history[0].message).toBe('Question 1');
      expect(history[1].message).toBe('Answer 1');
    });

    test('should retrieve conversation history filtered by agent', async () => {
      await store.addConversation('session1', 'plot-architect', 'user', 'Plot question');
      await store.addConversation('session1', 'character-psychologist', 'user', 'Character question');
      await store.addConversation('session1', 'plot-architect', 'assistant', 'Plot answer');

      const history = await store.getConversationHistory('session1', 'plot-architect');

      expect(history).toHaveLength(2);
      expect(history.every(h => h.agentId === 'plot-architect')).toBe(true);
    });

    test('should clear session', async () => {
      await store.addConversation('session1', 'plot-architect', 'user', 'Question');
      await store.clearSession('session1');

      const history = await store.getConversationHistory('session1');

      expect(history).toEqual([]);
    });

    test('should validate session ID', async () => {
      await expect(store.addConversation(null, 'agent', 'user', 'message'))
        .rejects.toThrow('Invalid session ID');
      await expect(store.addConversation(123, 'agent', 'user', 'message'))
        .rejects.toThrow('Invalid session ID');
    });
  });

  describe('Memory limits and eviction', () => {
    test('should evict oldest entries when limit exceeded', async () => {
      for (let i = 1; i <= 7; i++) {
        await store.addConversation('session1', 'agent', 'user', `Message ${i}`);
      }

      const history = await store.getConversationHistory('session1');

      expect(history).toHaveLength(5);
      expect(history[0].message).toBe('Message 3');
      expect(history[4].message).toBe('Message 7');
    });

    test('should track entry count correctly after eviction', async () => {
      for (let i = 1; i <= 10; i++) {
        await store.addConversation('session1', 'agent', 'user', `Message ${i}`);
      }

      const stats = store.getSessionStats();
      const sessionDetail = stats.sessionDetails.find(s => s.sessionId === 'session1');

      expect(sessionDetail.conversationCount).toBe(5);
    });
  });

  describe('Session isolation', () => {
    test('should isolate conversations between sessions', async () => {
      await store.addConversation('session1', 'agent1', 'user', 'Session 1 message');
      await store.addConversation('session2', 'agent2', 'user', 'Session 2 message');

      const history1 = await store.getConversationHistory('session1');
      const history2 = await store.getConversationHistory('session2');

      expect(history1).toHaveLength(1);
      expect(history1[0].message).toBe('Session 1 message');

      expect(history2).toHaveLength(1);
      expect(history2[0].message).toBe('Session 2 message');
    });

    test('should not affect other sessions when clearing', async () => {
      await store.addConversation('session1', 'agent', 'user', 'Message 1');
      await store.addConversation('session2', 'agent', 'user', 'Message 2');

      await store.clearSession('session1');

      const history1 = await store.getConversationHistory('session1');
      const history2 = await store.getConversationHistory('session2');

      expect(history1).toEqual([]);
      expect(history2).toHaveLength(1);
    });
  });

  describe('Concurrent access', () => {
    test('should handle concurrent writes safely', async () => {
      const promises = [];

      for (let i = 0; i < 20; i++) {
        promises.push(
          store.addConversation('session1', 'agent', 'user', `Message ${i}`)
        );
      }

      await Promise.all(promises);

      const history = await store.getConversationHistory('session1');
      expect(history.length).toBeLessThanOrEqual(5);
    });

    test('should handle concurrent reads and writes', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          promises.push(
            store.addConversation('session1', 'agent', 'user', `Message ${i}`)
          );
        } else {
          promises.push(
            store.getConversationHistory('session1')
          );
        }
      }

      const results = await Promise.all(promises);

      expect(results).toBeDefined();
    });
  });

  describe('Session expiration', () => {
    test('should cleanup expired sessions', async () => {
      await store.addConversation('session1', 'agent', 'user', 'Message');

      const session = store.sessions.get('session1');
      session.metadata.lastAccessed = new Date(Date.now() - 2000).toISOString();

      store.cleanupExpiredSessions();

      const history = await store.getConversationHistory('session1');
      expect(history).toEqual([]);
    });

    test('should not cleanup active sessions', async () => {
      await store.addConversation('session1', 'agent', 'user', 'Message');

      store.cleanupExpiredSessions();

      const history = await store.getConversationHistory('session1');
      expect(history).toHaveLength(1);
    });

    test('should run cleanup periodically', async () => {
      await store.addConversation('session1', 'agent', 'user', 'Message');

      const session = store.sessions.get('session1');
      session.metadata.lastAccessed = new Date(Date.now() - 2000).toISOString();

      await new Promise(resolve => setTimeout(resolve, 600));

      const history = await store.getConversationHistory('session1');
      expect(history).toEqual([]);
    });
  });

  describe('Session statistics', () => {
    test('should provide accurate session stats', async () => {
      await store.addConversation('session1', 'agent', 'user', 'Message 1');
      await store.addConversation('session1', 'agent', 'assistant', 'Response 1');
      await store.addConversation('session2', 'agent', 'user', 'Message 2');

      const stats = store.getSessionStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalConversations).toBe(3);
      expect(stats.sessionDetails).toHaveLength(2);
    });
  });
});