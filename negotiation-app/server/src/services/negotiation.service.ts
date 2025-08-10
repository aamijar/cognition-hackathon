export class NegotiationService {
  
  generateInitialPrompt(scenario: string, role: string, agentType: 'claude' | 'openai'): string {
    return `You are about to begin a negotiation. Here are the details:

SCENARIO: ${scenario}

YOUR ROLE: You are the ${role}

INSTRUCTIONS:
- This is the opening of the negotiation
- State your initial position aggressively and clearly
- Be direct about your key demands - no fluff
- Push hard for your interests from the start
- Make a strong opening proposal that favors your side
- Skip pleasantries and get straight to business

Begin the negotiation now with your opening statement. Be tough and direct.`;
  }

  generateResponsePrompt(
    scenario: string, 
    role: string, 
    conversationHistory: Array<{agent: string, content: string}>, 
    agentType: 'claude' | 'openai'
  ): string {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const otherParty = agentType === 'claude' ? 'OpenAI agent' : 'Claude agent';
    
    return `SCENARIO: ${scenario}
YOUR ROLE: ${role}

The ${otherParty} just said: "${lastMessage.content}"

Your response should:
- Push back hard against their position
- Defend your interests aggressively
- Make tough counterdemands
- Show you're willing to walk away if needed
- Be direct and cut through any fluff
- Don't give ground easily

Respond aggressively to advance your position. No politeness - be tough and direct.`;
  }

  shouldContinue(messages: Array<{agent: string, content: string}>): boolean {
    if (messages.length < 4) return true; // Need at least a few exchanges
    
    const recentMessages = messages.slice(-3).map(m => m.content.toLowerCase());
    
    // Check for deal indicators
    const dealIndicators = [
      'agree', 'deal', 'accept', 'settled', 'final', 'done',
      'shake hands', 'conclusion', 'terms are acceptable'
    ];
    
    const deadlockIndicators = [
      'cannot accept', 'deal breaker', 'final offer', 'walking away',
      'not negotiable', 'impossible', 'unacceptable'
    ];

    const hasDeal = recentMessages.some(msg => 
      dealIndicators.some(indicator => msg.includes(indicator))
    );
    
    const hasDeadlock = recentMessages.some(msg => 
      deadlockIndicators.some(indicator => msg.includes(indicator))
    );

    // Stop if there's a clear deal or deadlock
    return !(hasDeal || hasDeadlock);
  }

  extractFinalTerms(messages: Array<{agent: string, content: string}>): string[] {
    // Simple extraction of final terms from the last few messages
    const finalMessages = messages.slice(-5);
    const terms: string[] = [];
    
    finalMessages.forEach(msg => {
      // Look for specific terms, prices, conditions
      const content = msg.content;
      
      // Extract dollar amounts
      const dollarMatches = content.match(/\$[\d,]+(?:\.\d{2})?/g);
      if (dollarMatches) terms.push(...dollarMatches.map(m => `Price: ${m}`));
      
      // Extract percentages  
      const percentMatches = content.match(/\d+%/g);
      if (percentMatches) terms.push(...percentMatches.map(m => `Percentage: ${m}`));
      
      // Extract dates
      const dateMatches = content.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?|\b\d{1,2}\/\d{1,2}\/\d{4}/g);
      if (dateMatches) terms.push(...dateMatches.map(m => `Date: ${m}`));
    });
    
    // Remove duplicates and return
    return [...new Set(terms)];
  }

  generateFinalDealSummary(messages: Array<{agent: string, content: string}>, scenario: string): string {
    const lastFewMessages = messages.slice(-4);
    const dealIndicators = lastFewMessages.join(' ').toLowerCase();
    
    // Simple logic to determine if deal was reached
    if (dealIndicators.includes('agree') || dealIndicators.includes('deal') || dealIndicators.includes('accept')) {
      return `Deal successfully reached. Both parties came to a mutually acceptable agreement after ${messages.length} exchanges. Key terms were negotiated and finalized, with both sides making strategic concessions to close the deal.`;
    } else if (dealIndicators.includes('walk away') || dealIndicators.includes('no deal') || dealIndicators.includes('impossible')) {
      return `Negotiation ended without agreement. After ${messages.length} exchanges, the parties could not bridge their differences. Both sides held firm to their core positions, resulting in an impasse.`;
    } else {
      return `Negotiation concluded after ${messages.length} exchanges. The parties engaged in intensive back-and-forth discussions, with each side advocating strongly for their positions. Final outcome represents the best achievable compromise under the circumstances.`;
    }
  }
}