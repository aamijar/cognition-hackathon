# AI Negotiation Simulator

A real-time negotiation simulation web application featuring Claude Sonnet 4 and GPT-5-mini as negotiating agents. Watch two AI models negotiate various scenarios in real-time with a sleek dark-themed interface.

## Features

- **Dual AI Agents**: Claude Sonnet 4 vs GPT-5-mini negotiations
- **Real-time Interface**: WebSocket-powered live negotiation updates  
- **Multiple Scenarios**: Preset scenarios (landlord-tenant, salary, business deals) or custom scenarios
- **Dark Theme**: Minimalist, stylish interface with distinct agent panels
- **Deal Summaries**: Comprehensive analysis from both AI perspectives
- **Negotiation Timeline**: Track the complete conversation flow

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket management
- **Anthropic API** for Claude Sonnet 4
- **OpenAI API** for GPT-5-mini

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for both Anthropic and OpenAI

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  
PORT=3001
```

### 3. Getting API Keys

#### Anthropic API Key
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys" in the dashboard
4. Create a new API key
5. Copy the key to your `.env` file

#### OpenAI API Key  
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to "API keys" section
4. Create a new secret key
5. Copy the key to your `.env` file

### 4. Run the Application

```bash
# Start the backend server (in one terminal)
cd server
npm run dev

# In another terminal, start the frontend
cd ..
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Usage

1. **Choose Scenario**: Select a preset scenario or create a custom one
2. **Start Negotiation**: Click "Begin Negotiation" to start the simulation
3. **Watch Live**: See both AI agents negotiate in real-time
4. **View Results**: Review the deal summary and individual agent perspectives

## Preset Scenarios

- **Landlord-Tenant**: Rent increase discussions
- **Salary Negotiation**: Employee seeking raise vs. budget constraints
- **Business Partnership**: Technology and market access deal
- **Freelance Contract**: Developer vs. startup client terms

## Architecture

```
negotiation-app/
├── src/app/                    # Next.js frontend
│   ├── components/            # React components
│   ├── globals.css           # Dark theme styles
│   └── page.tsx              # Main app entry
├── server/                    # Backend API
│   ├── src/
│   │   ├── agents/           # AI agent integrations
│   │   ├── services/         # Business logic
│   │   └── index.ts          # Express server
│   └── package.json
└── package.json               # Frontend dependencies
```

## Troubleshooting

### Connection Issues
- Ensure backend server is running on port 3001
- Check API keys are correctly set in `server/.env`
- Verify network connectivity for API calls

### API Errors
- Confirm API keys have sufficient credits
- Check rate limits haven't been exceeded  
- Review console logs for specific error messages

## Cost Considerations

- **Anthropic**: ~$3 per million input tokens, $15 per million output tokens
- **OpenAI**: ~$0.25 per million input tokens, $2 per million output tokens
- Average negotiation: ~2,000-5,000 tokens total (~$0.01-0.05 per session)
