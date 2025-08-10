import OpenAI from 'openai';

export class OpenAIAgent {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async negotiate(prompt: string, conversationHistory: Array<{agent: string, content: string}>): Promise<string> {
    try {
      const messages = this.buildConversationContext(prompt, conversationHistory);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to generate response';
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get OpenAI response');
    }
  }

  async generateSummary(scenario: string, role: string, messages: Array<{agent: string, content: string}>): Promise<string> {
    try {
      const conversationText = messages.map(m => `${m.agent.toUpperCase()}: ${m.content}`).join('\n\n');
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages: [{
          role: 'system',
          content: `You are providing a negotiation summary from the perspective of the ${role}.`
        }, {
          role: 'user',
          content: `Please provide a summary of this negotiation:

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
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary';
      
    } catch (error) {
      console.error('OpenAI summary error:', error);
      throw new Error('Failed to generate OpenAI summary');
    }
  }

  private buildConversationContext(currentPrompt: string, history: Array<{agent: string, content: string}>): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a tough, no-nonsense negotiator representing one party in a negotiation. 
        Your responses should be:
        - Direct and assertive - cut through pleasantries
        - Aggressively focused on your objectives
        - Unwilling to give ground easily
        - Firm about your position and demands
        - Strategic but blunt in your approach
        
        DO NOT waste time on polite formalities or excessive courtesy. Get straight to the point. Push hard for your side's interests. Be willing to walk away if terms aren't favorable. Keep responses concise and impactful.`
      }
    ];
    
    // Add conversation history
    for (const msg of history) {
      const role = msg.agent === 'openai' ? 'assistant' : 'user';
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