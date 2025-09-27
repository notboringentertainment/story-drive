class SessionMemoryStore {
  constructor(options = {}) {
    this.maxEntriesPerSession = options.maxEntriesPerSession || 100;
    this.sessionTTL = options.sessionTTL || 24 * 60 * 60 * 1000; // 24 hours default
    this.cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 1 hour

    this.sessions = new Map();
    this.locks = new Map();

    this.startCleanupTask();
  }

  startCleanupTask() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  stopCleanupTask() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  async acquireLock(sessionId) {
    while (this.locks.get(sessionId)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.locks.set(sessionId, true);
  }

  releaseLock(sessionId) {
    this.locks.delete(sessionId);
  }

  validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
  }

  initializeSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        conversations: [],
        metadata: {
          created: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          entryCount: 0
        }
      });
    }
  }

  async addConversation(sessionId, agentId, role, message) {
    this.validateSessionId(sessionId);

    await this.acquireLock(sessionId);
    try {
      this.initializeSession(sessionId);

      const session = this.sessions.get(sessionId);
      const entry = {
        agentId,
        timestamp: new Date().toISOString(),
        role,
        message
      };

      session.conversations.push(entry);
      session.metadata.lastAccessed = new Date().toISOString();
      session.metadata.entryCount++;

      if (session.conversations.length > this.maxEntriesPerSession) {
        const removeCount = session.conversations.length - this.maxEntriesPerSession;
        session.conversations.splice(0, removeCount);
        session.metadata.entryCount = session.conversations.length;
      }

      return entry;
    } finally {
      this.releaseLock(sessionId);
    }
  }

  async getConversationHistory(sessionId, agentId) {
    this.validateSessionId(sessionId);

    await this.acquireLock(sessionId);
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return [];
      }

      session.metadata.lastAccessed = new Date().toISOString();

      if (agentId) {
        return session.conversations.filter(conv => conv.agentId === agentId);
      }

      return session.conversations;
    } finally {
      this.releaseLock(sessionId);
    }
  }

  async getAllConversations(sessionId) {
    return this.getConversationHistory(sessionId);
  }

  async clearSession(sessionId) {
    this.validateSessionId(sessionId);

    await this.acquireLock(sessionId);
    try {
      this.sessions.delete(sessionId);
    } finally {
      this.releaseLock(sessionId);
    }
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessions) {
      const lastAccessed = new Date(session.metadata.lastAccessed).getTime();
      if (now - lastAccessed > this.sessionTTL) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`[SessionMemoryStore] Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  getSessionStats() {
    const stats = {
      totalSessions: this.sessions.size,
      totalConversations: 0,
      sessionDetails: []
    };

    for (const [sessionId, session] of this.sessions) {
      stats.totalConversations += session.conversations.length;
      stats.sessionDetails.push({
        sessionId,
        conversationCount: session.conversations.length,
        created: session.metadata.created,
        lastAccessed: session.metadata.lastAccessed
      });
    }

    return stats;
  }

  destroy() {
    this.stopCleanupTask();
    this.sessions.clear();
    this.locks.clear();
  }
}

export default SessionMemoryStore;