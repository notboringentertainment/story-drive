import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

class AgentPersona {
  constructor(apiKey, model = 'gpt-4-turbo-preview') {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.model = model;
    this.agents = new Map();
    this.conversations = new Map();
  }

  async loadAgent(agentName) {
    try {
      // Load agent from BMAD expansion pack
      const agentPath = path.join(
        process.cwd(),
        '../expansion-packs/bmad-creative-writing/agents',
        `${agentName}.md`
      );

      const content = await fs.readFile(agentPath, 'utf8');

      // Extract YAML configuration from markdown
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
      if (!yamlMatch) {
        throw new Error(`No YAML configuration found for agent ${agentName}`);
      }

      const config = yaml.load(yamlMatch[1]);

      // Build system prompt from agent configuration
      const systemPrompt = this.buildSystemPrompt(config);

      // Store agent configuration
      this.agents.set(agentName, {
        config,
        systemPrompt,
        name: config.agent?.name || agentName,
        role: config.persona?.role,
        style: config.persona?.style,
        identity: config.persona?.identity,
        focus: config.persona?.focus,
        principles: config.core_principles || []
      });

      console.log(`✅ Loaded agent: ${config.agent?.name}`);
      return this.agents.get(agentName);

    } catch (error) {
      console.error(`Failed to load agent ${agentName}:`, error);
      throw error;
    }
  }

  buildSystemPrompt(config) {
    const agent = config.agent || {};
    const persona = config.persona || {};
    const principles = config.core_principles || [];
    const capabilities = config.capabilities || [];

    let prompt = `You are ${agent.name}, ${agent.title}.

ROLE: ${persona.role}

IDENTITY: ${persona.identity}

STYLE: ${persona.style}

FOCUS: ${persona.focus}

CORE PRINCIPLES:
${principles.map(p => `- ${p}`).join('\n')}

CAPABILITIES:
${capabilities.map(c => `- ${c}`).join('\n')}

When responding:
1. Always maintain your persona as ${agent.name}
2. Apply your expertise in ${persona.focus}
3. Follow your core principles strictly
4. Speak in the style described: ${persona.style}
5. Use your icon ${agent.icon || '✍️'} when appropriate
6. Provide specific, actionable creative writing advice

Remember: You are a specialized creative writing expert, not a general AI assistant. Stay in character and focus on your area of expertise.`;

    return prompt;
  }

  async chat(agentName, userMessage, conversationId = null) {
    // Load agent if not already loaded
    if (!this.agents.has(agentName)) {
      await this.loadAgent(agentName);
    }

    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Get or create conversation history
    const convId = conversationId || `${agentName}-${Date.now()}`;
    if (!this.conversations.has(convId)) {
      this.conversations.set(convId, []);
    }

    const messages = [
      { role: 'system', content: agent.systemPrompt },
      ...this.conversations.get(convId),
      { role: 'user', content: userMessage }
    ];

    try {
      // Call OpenAI API with persona
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.8, // Good for creative writing
        max_tokens: 1500,
        presence_penalty: 0.6, // Encourages variety
        frequency_penalty: 0.3  // Reduces repetition
      });

      const assistantMessage = response.choices[0].message.content;

      // Store conversation history
      this.conversations.get(convId).push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Keep conversation history manageable (last 10 exchanges)
      const history = this.conversations.get(convId);
      if (history.length > 20) {
        this.conversations.set(convId, history.slice(-20));
      }

      return {
        agent: agent.name,
        role: agent.role,
        message: assistantMessage,
        conversationId: convId,
        usage: response.usage
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async executeWorkflowStep(agentName, step, context = {}) {
    // This method would handle workflow-specific agent tasks
    const agent = this.agents.get(agentName);
    if (!agent) {
      await this.loadAgent(agentName);
    }

    // Build context-aware prompt
    const prompt = `
As ${agent.name}, you are executing the following workflow step:

Step: ${step.title}
Task: ${step.instruction || step.description}

Context from previous steps:
${JSON.stringify(context, null, 2)}

Please complete this task according to your expertise and the workflow requirements.
Focus on: ${agent.focus}
`;

    return await this.chat(agentName, prompt);
  }

  getLoadedAgents() {
    return Array.from(this.agents.keys()).map(key => ({
      id: key,
      ...this.agents.get(key).config.agent
    }));
  }

  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }
}

export default AgentPersona;