/**
 * Perplexity AI Integration Module
 * Provides AI-powered insights and code assistance for the Solidarity Platform
 * 
 * @author Scott Charles Olson (Charly)
 */

import https from 'https';

/**
 * Query Perplexity AI for insights and assistance
 * @param {string} query - The question or prompt to send to Perplexity
 * @param {Object} options - Additional options for the query
 * @returns {Promise<Object>} The AI response
 */
export async function queryPerplexity(query, options = {}) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY not found in environment variables');
    }

    const requestData = JSON.stringify({
        model: options.model || 'llama-3.1-sonar-small-128k-online',
        messages: [
            {
                role: 'system',
                content: options.systemPrompt || 'You are a helpful AI assistant for the Solidarity Platform, which implements the Henry 7 Step 14 Shoe Waltz numerological framework with harmonic processing and temporal control.'
            },
            {
                role: 'user',
                content: query
            }
        ],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.2,
        top_p: options.topP || 0.9,
        return_citations: options.returnCitations ?? true,
        return_images: options.returnImages ?? false
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.perplexity.ai',
            port: 443,
            path: '/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode !== 200) {
                        reject(new Error(`Perplexity API error: ${response.error?.message || 'Unknown error'}`));
                        return;
                    }

                    resolve({
                        content: response.choices?.[0]?.message?.content || '',
                        citations: response.citations || [],
                        model: response.model,
                        usage: response.usage
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse Perplexity response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Perplexity request failed: ${error.message}`));
        });

        req.write(requestData);
        req.end();
    });
}

/**
 * Perplexity AI Agent for autonomous insights and recommendations
 */
export class PerplexityAIAgent {
    constructor(config = {}) {
        this.config = {
            model: config.model || 'llama-3.1-sonar-small-128k-online',
            systemPrompt: config.systemPrompt || 'You are an AI agent for the Solidarity Platform. Provide insights about harmonic processing, temporal control, and the Henry 7 Step 14 Shoe Waltz framework.',
            ...config
        };
    }

    /**
     * Provide autonomous insights for a given context
     * @param {string} context - The context or command to analyze
     * @returns {Promise<Object>} AI insights and recommendations
     */
    async provideInsights(context) {
        const query = `Analyze this context and provide insights: ${context}\n\nConsider the Henry 7 Step 14 Shoe Waltz framework (7→14→49 progression) and harmonic principles.`;
        
        try {
            const response = await queryPerplexity(query, {
                model: this.config.model,
                systemPrompt: this.config.systemPrompt
            });

            return {
                insights: response.content,
                citations: response.citations,
                timestamp: new Date().toISOString(),
                confidence: this._calculateConfidence(response)
            };
        } catch (error) {
            return {
                error: error.message,
                insights: 'Unable to generate insights at this time.',
                timestamp: new Date().toISOString(),
                confidence: 0
            };
        }
    }

    /**
     * Recommend next actions based on current state
     * @param {Object} state - Current system state
     * @returns {Promise<Object>} Recommended actions
     */
    async recommendActions(state) {
        const stateDescription = JSON.stringify(state, null, 2);
        const query = `Given this system state:\n${stateDescription}\n\nWhat are the recommended next actions to maintain harmonic alignment and temporal consistency?`;

        try {
            const response = await queryPerplexity(query, {
                model: this.config.model,
                systemPrompt: this.config.systemPrompt
            });

            return {
                actions: this._parseActions(response.content),
                reasoning: response.content,
                citations: response.citations,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                error: error.message,
                actions: [],
                reasoning: 'Unable to generate recommendations at this time.',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Calculate confidence score based on response characteristics
     * @private
     */
    _calculateConfidence(response) {
        let confidence = 0.5;
        
        if (response.citations && response.citations.length > 0) {
            confidence += 0.2;
        }
        
        if (response.content && response.content.length > 100) {
            confidence += 0.2;
        }
        
        if (response.usage && response.usage.completion_tokens > 50) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    /**
     * Parse action items from AI response
     * @private
     */
    _parseActions(content) {
        const actions = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (line.match(/^\d+\.|^[-*]/)) {
                const action = line.replace(/^\d+\.|^[-*]\s*/, '').trim();
                if (action.length > 0) {
                    actions.push(action);
                }
            }
        }
        
        return actions;
    }
}

export default {
    queryPerplexity,
    PerplexityAIAgent
};
