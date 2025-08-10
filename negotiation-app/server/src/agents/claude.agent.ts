import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAgent {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  async negotiate(prompt: string, conversationHistory: Array<{agent: string, content: string}>): Promise<string> {
    try {
      const messages = this.buildConversationContext(prompt, conversationHistory);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages,
        system: `You are a tough, no-nonsense negotiator representing one party in a negotiation. 
        Your responses should be:
        - Direct and assertive - cut through pleasantries
        - Aggressively focused on your objectives
        - Unwilling to give ground easily
        - Firm about your position and demands
        - Strategic but blunt in your approach
        
        DO NOT waste time on polite formalities or excessive courtesy. Get straight to the point. Push hard for your side's interests. Be willing to walk away if terms aren't favorable. Keep responses concise and impactful.`
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : 'Unable to generate response';
      
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to get Claude response');
    }
  }

  async generateSummary(scenario: string, role: string, messages: Array<{agent: string, content: string}>): Promise<string> {
    try {
      const conversationText = messages.map(m => `${m.agent.toUpperCase()}: ${m.content}`).join('\n\n');
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Please provide a summary of this negotiation from the perspective of the ${role}:

SCENARIO: ${scenario}

CONVERSATION:
${conversationText}

Provide a summary including:
1. Key points achieved
2. Concessions made
3. Final position
4. Overall satisfaction with the outcome (1-10 scale)

Keep it concise but comprehensive.`
        }],
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : 'Unable to generate summary';
      
    } catch (error) {
      console.error('Claude summary error:', error);
      throw new Error('Failed to generate Claude summary');
    }
  }

  async generateDealOutcome(scenario: string, partyA: string, partyB: string, messages: Array<{agent: string, content: string}>): Promise<string> {
    try {
      const conversationText = messages.map(m => `${m.agent.toUpperCase()}: ${m.content}`).join('\n\n');
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Please provide a brief, objective summary of this negotiation outcome in 2-3 sentences:

SCENARIO: ${scenario}
PARTIES: ${partyA} vs ${partyB}

CONVERSATION:
${conversationText}

Summarize:
- What was the final outcome? (Deal reached/failed/partial agreement)
- What were the key final terms or sticking points?
- How did the negotiation conclude?

Keep it factual and concise - just the essential outcome.`
        }],
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : 'Unable to generate deal outcome';
      
    } catch (error) {
      console.error('Claude deal outcome error:', error);
      throw new Error('Failed to generate deal outcome');
    }
  }

  private buildConversationContext(currentPrompt: string, history: Array<{agent: string, content: string}>): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];
    
    // Add conversation history
    for (const msg of history) {
      const role = msg.agent === 'claude' ? 'assistant' : 'user';
      messages.push({
        role,
        content: msg.content
      });
    }
    
    // Add current prompt
    messages.push({
      role: 'user',
      content: currentPrompt
    });

    return messages;
  }
}