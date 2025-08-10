# Multi-Agent Negotiator - Cognition Hackathon Submission

## Overview
Personal Multi-Agent Negotiator built for the Cognition hackathon. Two LLM agents represent different parties in a negotiation and negotiate in real-time until they reach a deal.

## Features
✅ **Multi-Agent System**: Two LLM agents with distinct personas (OpenAI + Anthropic integration)
✅ **Real-Time Chat Viewer**: Live WebSocket updates as negotiation unfolds  
✅ **Deal Completion**: Agents negotiate until reaching agreement with [DEAL_ACCEPTED] trigger
✅ **Export Functionality**: Download complete negotiation summary as JSON
✅ **Preset Scenarios**: Landlord/Tenant, Employer/Employee, Buyer/Seller
✅ **Custom Scenarios**: User can define their own negotiation setup
✅ **Polished UI**: Modern React interface with Tailwind CSS and shadcn/ui

## Technical Stack
- **Backend**: FastAPI with WebSocket support, OpenAI/Anthropic APIs
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Real-time**: WebSocket communication for live updates
- **Demo Mode**: Simulated responses work without API keys

## Testing Results
✅ End-to-end testing completed successfully
✅ Landlord vs Tenant scenario: $2,500 → $2,350/month with 2-year lease
✅ Real-time chat updates working perfectly
✅ Deal summary generation and export functional
✅ All preset scenarios tested and working

## How to Run
1. **Backend**: `cd backend && poetry install && poetry run fastapi dev app/main.py`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. Open http://localhost:5173 and start negotiating!

## Demo Flow
1. Choose preset scenario or create custom one
2. Watch agents negotiate in real-time chat
3. See deal completion with summary
4. Export negotiation results

**Link to Devin run**: https://app.devin.ai/sessions/0d9513dcf096406e9d2fd9337a62b2ac
**Requested by**: @aamijar

## Architecture
- Backend runs on localhost:8000 with FastAPI
- Frontend runs on localhost:5173 with Vite
- WebSocket connection for real-time agent communication
- In-memory storage for active negotiations
- Simulated AI responses for demo without API keys
