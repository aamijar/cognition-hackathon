import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { NegotiationService } from './services/negotiation.service';
import { ClaudeAgent } from './agents/claude.agent';
import { OpenAIAgent } from './agents/openai.agent';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const negotiationService = new NegotiationService();

// Initialize AI agents
const claudeAgent = new ClaudeAgent(process.env.ANTHROPIC_API_KEY!);
const openaiAgent = new OpenAIAgent(process.env.OPENAI_API_KEY!);

interface NegotiationSession {
  id: string;
  scenario: string;
  partyA: string; // Claude
  partyB: string; // OpenAI
  messages: Array<{
    agent: 'claude' | 'openai';
    content: string;
    timestamp: Date;
  }>;
  status: 'active' | 'completed' | 'failed';
  dealSummary?: {
    claude: string;
    openai: string;
    finalTerms: string[];
    dealOutcome: string;
  };
}

const activeSessions = new Map<string, NegotiationSession>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-negotiation', async (data) => {
    const { scenario, partyARole, partyBRole } = data;
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: NegotiationSession = {
      id: sessionId,
      scenario,
      partyA: partyARole,
      partyB: partyBRole,
      messages: [],
      status: 'active'
    };
    
    activeSessions.set(sessionId, session);
    
    socket.emit('session-started', { sessionId, session });
    
    // Start the negotiation with Claude's first move
    try {
      const claudePrompt = negotiationService.generateInitialPrompt(scenario, partyARole, 'claude');
      const claudeResponse = await claudeAgent.negotiate(claudePrompt, []);
      
      const message = {
        agent: 'claude' as const,
        content: claudeResponse,
        timestamp: new Date()
      };
      
      session.messages.push(message);
      socket.emit('negotiation-message', { sessionId, message });
      
      // Queue OpenAI response
      setTimeout(() => handleOpenAITurn(socket, sessionId), 2000);
      
    } catch (error) {
      console.error('Error starting negotiation:', error);
      socket.emit('error', { message: 'Failed to start negotiation' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function handleOpenAITurn(socket: any, sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== 'active') return;

  try {
    const openaiPrompt = negotiationService.generateResponsePrompt(
      session.scenario,
      session.partyB,
      session.messages,
      'openai'
    );
    
    const openaiResponse = await openaiAgent.negotiate(openaiPrompt, session.messages);
    
    const message = {
      agent: 'openai' as const,
      content: openaiResponse,
      timestamp: new Date()
    };
    
    session.messages.push(message);
    socket.emit('negotiation-message', { sessionId, message });
    
    // Check if negotiation should continue or end
    const shouldContinue = negotiationService.shouldContinue(session.messages);
    
    if (shouldContinue && session.messages.length < 20) {
      // Queue Claude response
      setTimeout(() => handleClaudeTurn(socket, sessionId), 2000);
    } else {
      // End negotiation and generate summary
      await endNegotiation(socket, sessionId);
    }
    
  } catch (error) {
    console.error('Error in OpenAI turn:', error);
    socket.emit('error', { message: 'Error in negotiation' });
  }
}

async function handleClaudeTurn(socket: any, sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== 'active') return;

  try {
    const claudePrompt = negotiationService.generateResponsePrompt(
      session.scenario,
      session.partyA,
      session.messages,
      'claude'
    );
    
    const claudeResponse = await claudeAgent.negotiate(claudePrompt, session.messages);
    
    const message = {
      agent: 'claude' as const,
      content: claudeResponse,
      timestamp: new Date()
    };
    
    session.messages.push(message);
    socket.emit('negotiation-message', { sessionId, message });
    
    // Check if negotiation should continue
    const shouldContinue = negotiationService.shouldContinue(session.messages);
    
    if (shouldContinue && session.messages.length < 20) {
      // Queue OpenAI response
      setTimeout(() => handleOpenAITurn(socket, sessionId), 2000);
    } else {
      // End negotiation and generate summary
      await endNegotiation(socket, sessionId);
    }
    
  } catch (error) {
    console.error('Error in Claude turn:', error);
    socket.emit('error', { message: 'Error in negotiation' });
  }
}

async function endNegotiation(socket: any, sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.status = 'completed';
  
  try {
    // Generate summaries from both perspectives
    const claudeSummary = await claudeAgent.generateSummary(
      session.scenario,
      session.partyA,
      session.messages
    );
    
    const openaiSummary = await openaiAgent.generateSummary(
      session.scenario,
      session.partyB,
      session.messages
    );
    
    const finalTerms = negotiationService.extractFinalTerms(session.messages);
    
    // Generate objective deal summary using Claude
    const dealOutcome = await claudeAgent.generateDealOutcome(
      session.scenario,
      session.partyA,
      session.partyB,
      session.messages
    );
    
    session.dealSummary = {
      claude: claudeSummary,
      openai: openaiSummary,
      finalTerms,
      dealOutcome
    };
    
    socket.emit('negotiation-ended', { sessionId, dealSummary: session.dealSummary });
    
  } catch (error) {
    console.error('Error generating summary:', error);
    socket.emit('error', { message: 'Error generating deal summary' });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});