'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import ScenarioSetup from './ScenarioSetup'
import NegotiationInterface from './NegotiationInterface'
import DealSummary from './DealSummary'

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

type AppState = 'setup' | 'negotiating' | 'completed'

export default function NegotiationApp() {
  const [appState, setAppState] = useState<AppState>('setup')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [session, setSession] = useState<NegotiationSession | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io('http://localhost:3001')
    setSocket(socketConnection)

    socketConnection.on('connect', () => {
      console.log('Connected to server')
      setConnectionError(null)
    })

    socketConnection.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionError('Failed to connect to server. Make sure the backend is running.')
    })

    socketConnection.on('session-started', (data) => {
      setSession(data.session)
      setAppState('negotiating')
      setIsConnecting(false)
    })

    socketConnection.on('negotiation-message', (data) => {
      setSession(prev => {
        if (!prev || prev.id !== data.sessionId) return prev
        return {
          ...prev,
          messages: [...prev.messages, data.message]
        }
      })
    })

    socketConnection.on('negotiation-ended', (data) => {
      setSession(prev => {
        if (!prev || prev.id !== data.sessionId) return prev
        return {
          ...prev,
          status: 'completed',
          dealSummary: data.dealSummary
        }
      })
      setAppState('completed')
    })

    socketConnection.on('error', (error) => {
      console.error('Negotiation error:', error)
      setConnectionError(error.message || 'An error occurred during negotiation')
      setIsConnecting(false)
    })

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  const startNegotiation = (scenario: string, partyARole: string, partyBRole: string) => {
    if (!socket) {
      setConnectionError('No connection to server')
      return
    }

    setIsConnecting(true)
    setConnectionError(null)
    
    socket.emit('start-negotiation', {
      scenario,
      partyARole,
      partyBRole
    })
  }

  const resetApp = () => {
    setAppState('setup')
    setSession(null)
    setConnectionError(null)
    setIsConnecting(false)
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <header className="border-b border-border bg-secondary/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">AI Negotiation Simulator</h1>
          {appState !== 'setup' && (
            <button
              onClick={resetApp}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              New Negotiation
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 py-6 overflow-hidden">
        {connectionError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
            <p className="font-semibold">Connection Error</p>
            <p>{connectionError}</p>
          </div>
        )}

        <div className="h-full">
          {appState === 'setup' && (
            <ScenarioSetup 
              onStart={startNegotiation}
              isConnecting={isConnecting}
            />
          )}

          {appState === 'negotiating' && session && (
            <NegotiationInterface session={session} />
          )}

          {appState === 'completed' && session && session.dealSummary && (
            <DealSummary 
              session={session}
              dealSummary={session.dealSummary}
            />
          )}
        </div>
      </main>
    </div>
  )
}