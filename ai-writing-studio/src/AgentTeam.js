import AgentPersona from './AgentPersona.js';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

class AgentTeam {
  constructor(agentSystem, contextAgent = null) {
    this.agentSystem = agentSystem;
    this.contextAgent = contextAgent;
    this.teams = new Map();
    this.activeTeam = null;
    this.teamConversations = new Map();
  }

  async loadTeam(teamName = 'creative-writing') {
    try {
      // Load team configuration
      const teamPath = path.join(
        process.cwd(),
        '../expansion-packs/bmad-creative-writing/agent-teams/agent-team.yaml'
      );

      let content = await fs.readFile(teamPath, 'utf8');

      // Remove HTML comments from YAML (BMAD format includes these)
      content = content.replace(/<!--.*?-->/g, '');

      const teamConfig = yaml.load(content);

      // Load all agents in the team
      const loadedAgents = [];
      for (const agentName of teamConfig.agents) {
        try {
          await this.agentSystem.loadAgent(agentName);
          loadedAgents.push(agentName);
          console.log(`✅ Loaded team member: ${agentName}`);
        } catch (error) {
          console.warn(`⚠️ Could not load ${agentName}: ${error.message}`);
        }
      }

      // Store team configuration
      this.teams.set(teamName, {
        name: teamConfig.bundle.name,
        icon: teamConfig.bundle.icon,
        description: teamConfig.bundle.description,
        agents: loadedAgents,
        workflows: teamConfig.workflows
      });

      this.activeTeam = teamName;
      console.log(`🎭 Team "${teamConfig.bundle.name}" activated with ${loadedAgents.length} agents`);

      return this.teams.get(teamName);

    } catch (error) {
      console.error(`Failed to load team ${teamName}:`, error);
      throw error;
    }
  }

  async collaborateOnTask(task, options = {}) {
    if (!this.activeTeam) {
      throw new Error('No team activated');
    }

    const team = this.teams.get(this.activeTeam);
    const conversationId = options.conversationId || `team-${Date.now()}`;

    // Extract document context if present
    const documentContext = options.documentContext || null;

    // Initialize team conversation
    if (!this.teamConversations.has(conversationId)) {
      this.teamConversations.set(conversationId, {
        task: task,
        responses: [],
        synthesis: null
      });
    }

    const conversation = this.teamConversations.get(conversationId);
    const responses = [];

    // Determine which agents should respond based on task
    const relevantAgents = this.selectRelevantAgents(task, team.agents, options);

    console.log(`\n🎯 Team collaborating on: "${task}"`);
    console.log(`📋 Relevant agents: ${relevantAgents.join(', ')}`);

    // Phase 1: Each agent provides their perspective
    for (const agentName of relevantAgents) {
      try {
        // Build context-aware prompt for each agent
        const agentPrompt = this.buildAgentPrompt(agentName, task, responses, options);

        console.log(`\n💭 ${agentName} is thinking...`);

        let response;
        // Use context-aware agent if we have document context
        if (documentContext && this.contextAgent) {
          // Load the agent to get their persona
          const agent = await this.agentSystem.loadAgent(agentName);
          response = await this.contextAgent.chat(agent, agentPrompt, documentContext);
        } else {
          response = await this.agentSystem.chat(
            agentName,
            agentPrompt,
            `${conversationId}-${agentName}`
          );
        }

        responses.push({
          agent: agentName,
          response: response.message,
          role: response.role,
          timestamp: new Date().toISOString()
        });

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ ${agentName} failed to respond: ${error.message}`);
      }
    }

    // Phase 2: Synthesize responses (optional lead agent)
    let synthesis = null;
    if (options.synthesize !== false && responses.length > 1) {
      const leadAgent = options.leadAgent || this.selectLeadAgent(task, relevantAgents);
      synthesis = await this.synthesizeResponses(leadAgent, task, responses, conversationId);
    }

    // Store conversation
    conversation.responses = responses;
    conversation.synthesis = synthesis;

    return {
      task: task,
      team: team.name,
      agents: relevantAgents,
      responses: responses,
      synthesis: synthesis,
      conversationId: conversationId
    };
  }

  selectRelevantAgents(task, availableAgents, options) {
    // If specific agents requested, use those
    if (options.agents) {
      return options.agents.filter(a => availableAgents.includes(a));
    }

    // Otherwise, select based on task keywords
    const taskLower = task.toLowerCase();
    const selected = [];

    // Agent selection logic based on keywords
    const agentKeywords = {
      'plot-architect': ['plot', 'structure', 'outline', 'story arc', 'three act', 'pacing'],
      'character-psychologist': ['character', 'protagonist', 'antagonist', 'motivation', 'personality', 'backstory'],
      'world-builder': ['world', 'setting', 'location', 'magic system', 'universe', 'environment'],
      'dialog-specialist': ['dialogue', 'dialog', 'conversation', 'voice', 'speech', 'talking'],
      'genre-specialist': ['genre', 'trope', 'convention', 'market', 'audience', 'thriller', 'fantasy', 'romance'],
      'editor': ['edit', 'grammar', 'style', 'prose', 'revision', 'polish'],
      'beta-reader': ['feedback', 'review', 'opinion', 'perspective', 'read'],
      'narrative-designer': ['interactive', 'branching', 'choices', 'gameplay', 'narrative']
    };

    // Select agents whose keywords match the task
    for (const [agent, keywords] of Object.entries(agentKeywords)) {
      if (availableAgents.includes(agent)) {
        if (keywords.some(keyword => taskLower.includes(keyword))) {
          selected.push(agent);
        }
      }
    }

    // If no specific matches, use core team
    if (selected.length === 0) {
      selected.push('plot-architect', 'character-psychologist', 'world-builder');
    }

    // Limit to max agents to prevent token overload
    const maxAgents = options.maxAgents || 4;
    return selected.slice(0, maxAgents);
  }

  buildAgentPrompt(agentName, task, previousResponses, options) {
    let prompt = task;

    // Add context from previous agent responses
    if (previousResponses.length > 0 && options.shareContext !== false) {
      prompt += '\n\nPrevious team member insights:\n';

      for (const prev of previousResponses) {
        // Summarize previous responses to avoid token explosion
        const summary = prev.response.substring(0, 500);
        prompt += `\n${prev.agent} noted: ${summary}...\n`;
      }

      prompt += '\nBuilding on these perspectives, provide your specialized insight.';
    }

    // Add collaboration instruction
    if (options.collaborative !== false) {
      prompt += '\n\nYou are collaborating with other writing experts. Provide your unique perspective based on your specialty, and feel free to agree, disagree, or build upon what others have said.';
    }

    return prompt;
  }

  selectLeadAgent(task, agents) {
    // Select lead agent based on task type
    const taskLower = task.toLowerCase();

    if (taskLower.includes('plot') || taskLower.includes('structure')) {
      return 'plot-architect';
    } else if (taskLower.includes('character')) {
      return 'character-psychologist';
    } else if (taskLower.includes('world') || taskLower.includes('setting')) {
      return 'world-builder';
    }

    // Default to first available agent
    return agents[0];
  }

  async synthesizeResponses(leadAgent, task, responses, conversationId) {
    // Build synthesis prompt
    let synthesisPrompt = `As the lead agent for this task, synthesize the team's insights into a cohesive recommendation.

Original task: ${task}

Team insights:
`;

    for (const response of responses) {
      synthesisPrompt += `\n${response.agent} (${response.role}):\n${response.response}\n`;
    }

    synthesisPrompt += `
Please provide a unified recommendation that:
1. Combines the best insights from each expert
2. Resolves any conflicting advice
3. Provides clear, actionable next steps
4. Maintains the unique value each expert brought`;

    console.log(`\n🎯 ${leadAgent} is synthesizing team responses...`);

    const synthesis = await this.agentSystem.chat(
      leadAgent,
      synthesisPrompt,
      `${conversationId}-synthesis`
    );

    return {
      leadAgent: leadAgent,
      summary: synthesis.message,
      timestamp: new Date().toISOString()
    };
  }

  async discussAmongAgents(topic, rounds = 2) {
    // Agents discuss among themselves for multiple rounds
    const team = this.teams.get(this.activeTeam);
    const discussion = [];
    const conversationId = `discussion-${Date.now()}`;

    for (let round = 0; round < rounds; round++) {
      console.log(`\n🔄 Discussion Round ${round + 1}`);

      const roundResponses = await this.collaborateOnTask(
        round === 0 ? topic : `Continue discussing: ${topic}`,
        {
          conversationId: conversationId,
          shareContext: true,
          synthesize: false,
          maxAgents: 3
        }
      );

      discussion.push({
        round: round + 1,
        responses: roundResponses.responses
      });
    }

    return {
      topic: topic,
      rounds: discussion,
      conversationId: conversationId
    };
  }

  getActiveTeam() {
    return this.teams.get(this.activeTeam);
  }

  getTeamConversation(conversationId) {
    return this.teamConversations.get(conversationId);
  }

  clearTeamConversation(conversationId) {
    this.teamConversations.delete(conversationId);
  }
}

export default AgentTeam;