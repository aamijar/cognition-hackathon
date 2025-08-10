'use client'

import ReactMarkdown from 'react-markdown'

interface Message {
  agent: 'claude' | 'openai'
  content: string
  timestamp: Date
}

interface DealSummaryData {
  claude: string
  openai: string
  finalTerms: string[]
  dealOutcome: string
}

interface NegotiationSession {
  id: string
  scenario: string
  partyA: string
  partyB: string
  messages: Message[]
  status: 'active' | 'completed' | 'failed'
  dealSummary?: DealSummaryData
}

interface DealSummaryProps {
  session: NegotiationSession
  dealSummary: DealSummaryData
}

export default function DealSummary({ session, dealSummary }: DealSummaryProps) {
  const negotiationDuration = session.messages.length > 0 
    ? Math.ceil((new Date(session.messages[session.messages.length - 1].timestamp).getTime() - 
                 new Date(session.messages[0].timestamp).getTime()) / 1000 / 60)
    : 0

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-green-400">Negotiation Complete</h2>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-muted">
            <span>{session.messages.length} exchanges</span>
            <span>{negotiationDuration} minutes</span>
            <span>Status: Deal Reached</span>
          </div>
        </div>

        {/* Final Deal Summary */}
        <div className="bg-secondary/50 p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-4 text-accent">Final Deal Summary</h3>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({children}) => <p className="mb-3 last:mb-0 text-base leading-relaxed">{children}</p>,
                strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
              }}
            >
              {dealSummary.dealOutcome}
            </ReactMarkdown>
          </div>
          
          {dealSummary.finalTerms.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3 text-muted">Key Terms Discussed</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dealSummary.finalTerms.map((term, index) => (
                  <div key={index} className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <p className="text-sm font-medium">{term}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Agent Summaries */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Claude Summary */}
          <div className="claude-panel rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                C
              </div>
              <div>
                <h3 className="font-semibold text-lg">Claude's Perspective</h3>
                <p className="text-sm text-blue-200">{session.partyA}</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
                    em: ({children}) => <em className="italic text-muted">{children}</em>,
                    ul: ({children}) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-sm">{children}</li>,
                  }}
                >
                  {dealSummary.claude}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* OpenAI Summary */}
          <div className="openai-panel rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <h3 className="font-semibold text-lg">GPT's Perspective</h3>
                <p className="text-sm text-green-200">{session.partyB}</p>
              </div>
            </div>
            
            <div className="bg-emerald-900/30 p-4 rounded-lg">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
                    em: ({children}) => <em className="italic text-muted">{children}</em>,
                    ul: ({children}) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-sm">{children}</li>,
                  }}
                >
                  {dealSummary.openai}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Full Negotiation History */}
        <div className="bg-secondary/30 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-6 text-accent">Complete Negotiation History</h3>
          <div className="bg-secondary/20 rounded-lg border border-border p-6">
            <div className="space-y-6">
              {session.messages.map((message, index) => {
                const isUser = message.agent === 'claude'
                
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex space-x-3 max-w-4xl ${isUser ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isUser ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {isUser ? 'C' : 'G'}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl border ${
                        isUser 
                          ? 'bg-blue-500/20 border-blue-500/30 rounded-tl-md' 
                          : 'bg-green-500/20 border-green-500/30 rounded-tr-md'
                      }`}>
                        <div className="mb-2 flex justify-between items-center">
                          <span className={`text-xs font-medium ${
                            isUser ? 'text-blue-300' : 'text-green-300'
                          }`}>
                            {isUser ? `Claude (${session.partyA})` : `GPT (${session.partyB})`}
                          </span>
                          <span className="text-xs text-muted ml-3">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-foreground">
                          <ReactMarkdown 
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
                              em: ({children}) => <em className="italic text-muted">{children}</em>,
                              ul: ({children}) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-sm">{children}</li>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}