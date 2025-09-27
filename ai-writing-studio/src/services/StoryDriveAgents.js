import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Story-Drive Agent Manager
 * Loads and manages the 8 core creative writing agents with full personas
 */
class StoryDriveAgents {
  constructor() {
    this.agents = new Map();
    this.agentMetadata = new Map();
  }

  /**
   * Load all Story-Drive agents from JSON definitions
   */
  async loadAllAgents() {
    const agentIds = [
      'plot-doctor',
      'character-coach',
      'world-builder',
      'dialog-director',
      'genre-guide',
      'editor',
      'reader',
      'narrative'
    ];

    for (const agentId of agentIds) {
      try {
        await this.loadAgent(agentId);
      } catch (error) {
        console.error(`Failed to load agent ${agentId}:`, error);
      }
    }

    console.log(`✅ Loaded ${this.agents.size} Story-Drive agents`);
    return this.agents;
  }

  /**
   * Load a single agent from JSON definition
   */
  async loadAgent(agentId) {
    const agentPath = path.join(__dirname, '../../agents', `${agentId}.json`);

    try {
      const content = await fs.readFile(agentPath, 'utf8');
      const agentData = JSON.parse(content);

      // Create agent persona object
      const agent = {
        id: agentData.id,
        name: agentData.name,
        role: agentData.role,
        icon: agentData.icon,
        systemPrompt: agentData.systemPrompt,
        expertise: agentData.expertise,
        collaboratesWith: agentData.collaboratesWith,
        contextPriority: agentData.contextPriority
      };

      this.agents.set(agentData.id, agent);
      this.agentMetadata.set(agentData.id, {
        collaboratesWith: agentData.collaboratesWith,
        contextPriority: agentData.contextPriority
      });

      console.log(`  📚 ${agent.name} (${agent.role}) loaded`);
      return agent;
    } catch (error) {
      console.error(`Error loading agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId) {
    // Handle various ID formats
    const normalizedId = agentId.toLowerCase()
      .replace('plot-doctor', 'plot')
      .replace('character-coach', 'character')
      .replace('world-builder', 'world')
      .replace('dialog-director', 'dialog')
      .replace('genre-guide', 'genre')
      .replace('dialogue', 'dialog'); // Handle alternative spelling

    return this.agents.get(normalizedId);
  }

  /**
   * Get all loaded agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent relationships for context sharing
   */
  getAgentRelationships() {
    // Build relationship matrix for ContextInjector
    const relationships = {};

    this.agents.forEach((agent, agentId) => {
      relationships[agentId] = {};
      const metadata = this.agentMetadata.get(agentId);

      if (metadata && metadata.collaboratesWith) {
        // Set high collaboration scores for specified relationships
        metadata.collaboratesWith.forEach(collaboratorId => {
          relationships[agentId][collaboratorId] = 0.8 + (Math.random() * 0.2); // 0.8-1.0 range
        });
      }

      // Add moderate scores for other agents
      this.agents.forEach((otherAgent, otherAgentId) => {
        if (otherAgentId !== agentId && !relationships[agentId][otherAgentId]) {
          relationships[agentId][otherAgentId] = 0.3 + (Math.random() * 0.3); // 0.3-0.6 range
        }
      });
    });

    return relationships;
  }

  /**
   * Get agent by various name formats (flexible matching)
   */
  findAgent(query) {
    const normalizedQuery = query.toLowerCase().trim();

    // Direct ID match
    if (this.agents.has(normalizedQuery)) {
      return this.agents.get(normalizedQuery);
    }

    // Try to find by name
    for (const [id, agent] of this.agents) {
      if (agent.name.toLowerCase().includes(normalizedQuery) ||
          agent.role.toLowerCase().includes(normalizedQuery) ||
          id.includes(normalizedQuery)) {
        return agent;
      }
    }

    // Try alternative names
    const alternativeNames = {
      'plot': ['plot-doctor', 'plot doctor', 'structure'],
      'character': ['character-coach', 'character coach', 'characters'],
      'world': ['world-builder', 'world builder', 'setting', 'worldbuilding'],
      'dialog': ['dialog-director', 'dialog director', 'dialogue', 'dialogue-director'],
      'genre': ['genre-guide', 'genre guide'],
      'editor': ['editing', 'edit'],
      'reader': ['audience', 'beta', 'beta-reader'],
      'narrative': ['narrator', 'storytelling', 'story']
    };

    for (const [id, alternatives] of Object.entries(alternativeNames)) {
      if (alternatives.some(alt => alt.includes(normalizedQuery))) {
        return this.agents.get(id);
      }
    }

    return null;
  }
}

export default StoryDriveAgents;