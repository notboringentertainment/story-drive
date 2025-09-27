import OpenAI from 'openai';
import ResponseEnhancer from './services/ResponseEnhancer.js';

class ContextAwareAgent {
    constructor(apiKey, model = 'gpt-4-turbo-preview') {
        this.openai = new OpenAI({ apiKey });
        this.model = model;
        this.contextInjector = null; // Will be set by server
        this.responseEnhancer = new ResponseEnhancer();
        this.injectionHistory = [];
    }

    setContextInjector(injector) {
        this.contextInjector = injector;
    }

    async chat(agentPersona, userMessage, documentContext = null, sessionId = null) {
        // Start with base system prompt
        const basePrompt = agentPersona.systemPrompt || `You are ${agentPersona.name}, ${agentPersona.role}.`;
        let injectedContext = null;

        // Get cross-agent context if available
        if (this.contextInjector && sessionId) {
            const agentId = this.getAgentId(agentPersona.name);
            const rawContext = await this.contextInjector.getRelevantContext(
                sessionId,
                agentId,
                userMessage
            );

            // Filter context for relevance to current message
            if (rawContext) {
                injectedContext = this.responseEnhancer.filterRelevantContext(rawContext, userMessage);

                if (injectedContext) {
                    // Store injection history
                    this.injectionHistory.push({
                        timestamp: new Date().toISOString(),
                        agentId: agentId,
                        metadata: injectedContext.metadata
                    });
                }
            }
        }

        // Use ResponseEnhancer to build sophisticated prompt
        const systemPrompt = this.responseEnhancer.enhanceSystemPrompt(
            basePrompt,
            agentPersona.name,
            agentPersona.role,
            documentContext,
            injectedContext
        );

        // Create the messages array for OpenAI
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userMessage
            }
        ];

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            });

            // Post-process response for natural flow
            const rawResponse = response.choices[0].message.content;
            const finalResponse = this.responseEnhancer.createNaturalResponse(
                rawResponse,
                injectedContext?.metadata
            );

            // Measure response quality
            const quality = this.responseEnhancer.measureResponseQuality(
                finalResponse,
                !!injectedContext
            );

            return {
                agent: agentPersona.name,
                message: finalResponse,
                usage: response.usage,
                contextInjected: !!injectedContext,
                injectionMetadata: injectedContext?.metadata || null,
                responseQuality: quality
            };
        } catch (error) {
            throw new Error(`Agent chat failed: ${error.message}`);
        }
    }

    getAgentId(agentName) {
        // Convert agent name to ID format
        const nameToId = {
            'Plot Architect': 'plot-architect',
            'Character Psychologist': 'character-psychologist',
            'Dialogue Coach': 'dialogue-coach',
            'World Builder': 'world-builder',
            'Genre Specialist': 'genre-specialist',
            'Style Mentor': 'style-mentor',
            'Editor': 'editor',
            'Research Assistant': 'research-assistant'
        };
        return nameToId[agentName] || agentName.toLowerCase().replace(/\s+/g, '-');
    }

    getInjectionHistory() {
        return this.injectionHistory;
    }

    clearInjectionHistory() {
        this.injectionHistory = [];
    }
}

export default ContextAwareAgent;