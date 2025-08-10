'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  agent: 'claude' | 'openai'
  content: string
  timestamp: Date
}

interface NegotiationSession {
  id: string
  scenario: string
  partyA: string
  partyB: string
  messages: Message[]
  status: 'active' | 'completed' | 'failed'
}

interface NegotiationInterfaceProps {
  session: NegotiationSession
}

export default function NegotiationInterface({ session }: NegotiationInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [session.messages])

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isLastMessageFromAgent = (agent: 'claude' | 'openai') => {
    return session.messages.length > 0 && 
           session.messages[session.messages.length - 1].agent === agent
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scenario Header */}
      <div className="bg-secondary/50 p-4 rounded-lg border border-border mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-2">Active Negotiation</h2>
        <p className="text-muted text-sm mb-3">{session.scenario}</p>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-400">Claude: {session.partyA}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400">GPT: {session.partyB}</span>
          </div>
          <div className="text-muted">
            {session.messages.length} exchanges
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-secondary/20 rounded-lg border border-border flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Initial Loading State */}
            {session.status === 'active' && session.messages.length === 0 && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-4xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                    C
                  </div>
                  <div className="bg-blue-500/20 p-5 rounded-2xl rounded-tl-md border border-blue-500/30">
                    <div className="flex items-center space-x-2 text-blue-300">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-base">Preparing opening statement...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {session.messages.map((message, index) => {
              const isUser = message.agent === 'claude'
              
              return (
                <div key={index} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex space-x-4 max-w-4xl ${isUser ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isUser ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {isUser ? 'C' : 'G'}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`p-5 rounded-2xl border min-w-0 flex-1 ${
                      isUser 
                        ? 'bg-blue-500/20 border-blue-500/30 rounded-tl-md' 
                        : 'bg-green-500/20 border-green-500/30 rounded-tr-md'
                    }`}>
                      <div className="mb-3 flex justify-between items-center">
                        <span className={`text-sm font-medium ${
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
                            p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                            strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
                            em: ({children}) => <em className="italic text-muted">{children}</em>,
                            ul: ({children}) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-foreground">{children}</li>,
                            code: ({children}) => <code className="bg-secondary px-1 py-0.5 rounded text-accent">{children}</code>,
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

            {/* Typing Indicators */}
            {session.status === 'active' && session.messages.length > 0 && (
              <>
                {isLastMessageFromAgent('openai') && (
                  <div className="flex justify-start">
                    <div className="flex space-x-4 max-w-4xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                        C
                      </div>
                      <div className="bg-blue-500/20 p-5 rounded-2xl rounded-tl-md border border-blue-500/30">
                        <div className="flex items-center space-x-2 text-blue-300">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-base">Analyzing response...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLastMessageFromAgent('claude') && (
                  <div className="flex justify-end">
                    <div className="flex space-x-4 max-w-4xl flex-row-reverse space-x-reverse">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">
                        G
                      </div>
                      <div className="bg-green-500/20 p-5 rounded-2xl rounded-tr-md border border-green-500/30">
                        <div className="flex items-center space-x-2 text-green-300">
                          <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                          <span className="text-base">Formulating response...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-secondary/30 p-4 border-t border-border flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Negotiation Progress</span>
            <span className="text-xs text-muted">
              {session.status === 'active' 
                ? 'In progress...' 
                : 'Completed'}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((session.messages.length / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}