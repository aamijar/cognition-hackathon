import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Download, MessageSquare, Users, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface NegotiationMessage {
  speaker: string
  message: string
  timestamp: string
}

interface DealSummary {
  status: string
  final_terms: string
  conversation_length: number
  summary: string
}

interface NegotiationScenario {
  scenario_description: string
  party1_role: string
  party2_role: string
  party1_goals: string
  party2_goals: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'negotiation' | 'completed'>('setup')
  const [scenario, setScenario] = useState<NegotiationScenario>({
    scenario_description: '',
    party1_role: '',
    party2_role: '',
    party1_goals: '',
    party2_goals: ''
  })
  const [negotiationId, setNegotiationId] = useState<string>('')
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [dealSummary, setDealSummary] = useState<DealSummary | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startNegotiation = async () => {
    try {
      setError('')
      const response = await fetch(`${API_BASE_URL}/start-negotiation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
      })

      if (!response.ok) {
        throw new Error('Failed to start negotiation')
      }

      const data = await response.json()
      setNegotiationId(data.negotiation_id)
      setCurrentView('negotiation')
      connectWebSocket(data.negotiation_id)
    } catch (err) {
      setError('Failed to start negotiation. Please try again.')
      console.error(err)
    }
  }

  const connectWebSocket = (negId: string) => {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/negotiation/${negId}`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setIsConnected(true)
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'deal_completed') {
        setDealSummary(data.deal_summary)
        setCurrentView('completed')
      } else if (data.speaker && data.message) {
        setMessages(prev => [...prev, data])
      }
    }

    wsRef.current.onclose = () => {
      setIsConnected(false)
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection error. Please refresh and try again.')
    }
  }

  const exportDealSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/negotiation/${negotiationId}/export`)
      const data = await response.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `negotiation-${negotiationId}-summary.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export deal summary')
      console.error(err)
    }
  }

  const resetNegotiation = () => {
    setCurrentView('setup')
    setMessages([])
    setDealSummary(null)
    setNegotiationId('')
    setIsConnected(false)
    setError('')
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  const loadPresetScenario = (preset: string) => {
    switch (preset) {
      case 'landlord-tenant':
        setScenario({
          scenario_description: 'Rent negotiation for a 2-bedroom apartment in downtown area',
          party1_role: 'Landlord',
          party2_role: 'Tenant',
          party1_goals: 'Get fair market rent of $2,500/month, find reliable long-term tenant',
          party2_goals: 'Secure affordable rent around $2,200/month, get good lease terms'
        })
        break
      case 'employer-employee':
        setScenario({
          scenario_description: 'Salary negotiation for a software engineer position',
          party1_role: 'Hiring Manager',
          party2_role: 'Job Candidate',
          party1_goals: 'Hire talented engineer within budget of $120k, retain for long term',
          party2_goals: 'Secure competitive salary of $130k+, good benefits and growth opportunities'
        })
        break
      case 'buyer-seller':
        setScenario({
          scenario_description: 'Price negotiation for a used car',
          party1_role: 'Car Seller',
          party2_role: 'Car Buyer',
          party1_goals: 'Sell car for asking price of $15,000, quick sale preferred',
          party2_goals: 'Buy reliable car for around $12,000, ensure good condition'
        })
        break
    }
  }

  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Multi-Agent Negotiator
            </h1>
            <p className="text-lg text-gray-600">Watch AI agents negotiate in real-time</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Start - Preset Scenarios</CardTitle>
              <CardDescription>Choose a preset scenario to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => loadPresetScenario('landlord-tenant')}
                  className="h-auto p-4 text-left"
                >
                  <div>
                    <div className="font-semibold">Landlord vs Tenant</div>
                    <div className="text-sm text-gray-500">Rent negotiation</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPresetScenario('employer-employee')}
                  className="h-auto p-4 text-left"
                >
                  <div>
                    <div className="font-semibold">Employer vs Employee</div>
                    <div className="text-sm text-gray-500">Salary negotiation</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPresetScenario('buyer-seller')}
                  className="h-auto p-4 text-left"
                >
                  <div>
                    <div className="font-semibold">Buyer vs Seller</div>
                    <div className="text-sm text-gray-500">Car price negotiation</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Negotiation Scenario</CardTitle>
              <CardDescription>Set up your own negotiation scenario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scenario">Scenario Description</Label>
                <Textarea
                  id="scenario"
                  placeholder="Describe the negotiation scenario..."
                  value={scenario.scenario_description}
                  onChange={(e) => setScenario({...scenario, scenario_description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="party1">Party 1 Role</Label>
                  <Input
                    id="party1"
                    placeholder="e.g., Landlord"
                    value={scenario.party1_role}
                    onChange={(e) => setScenario({...scenario, party1_role: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="party2">Party 2 Role</Label>
                  <Input
                    id="party2"
                    placeholder="e.g., Tenant"
                    value={scenario.party2_role}
                    onChange={(e) => setScenario({...scenario, party2_role: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goals1">Party 1 Goals</Label>
                  <Textarea
                    id="goals1"
                    placeholder="What does Party 1 want to achieve?"
                    value={scenario.party1_goals}
                    onChange={(e) => setScenario({...scenario, party1_goals: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="goals2">Party 2 Goals</Label>
                  <Textarea
                    id="goals2"
                    placeholder="What does Party 2 want to achieve?"
                    value={scenario.party2_goals}
                    onChange={(e) => setScenario({...scenario, party2_goals: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={startNegotiation} 
                className="w-full"
                disabled={!scenario.scenario_description || !scenario.party1_role || !scenario.party2_role}
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Negotiation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === 'negotiation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Live Negotiation
            </h1>
            <div className="flex items-center justify-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <span className="text-sm text-gray-600">ID: {negotiationId}</span>
            </div>
          </div>

          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scenario: {scenario.scenario_description}</CardTitle>
              <div className="flex gap-4 text-sm">
                <span><strong>{scenario.party1_role}:</strong> {scenario.party1_goals}</span>
                <span><strong>{scenario.party2_role}:</strong> {scenario.party2_goals}</span>
              </div>
            </CardHeader>
          </Card>

          <Card className="h-96">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Negotiation Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 w-full pr-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.speaker === scenario.party1_role ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.speaker === scenario.party1_role 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-green-100 text-green-900'
                      }`}>
                        <div className="font-semibold text-xs mb-1">{message.speaker}</div>
                        <div className="text-sm">{message.message}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <Button variant="outline" onClick={resetNegotiation}>
              Start New Negotiation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Deal Reached!</h1>
            <p className="text-lg text-gray-600">The negotiation has concluded successfully</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Deal Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {dealSummary && (
                <div className="space-y-4">
                  <div>
                    <strong>Status:</strong> {dealSummary.status}
                  </div>
                  <div>
                    <strong>Summary:</strong> {dealSummary.summary}
                  </div>
                  <div>
                    <strong>Conversation Length:</strong> {dealSummary.conversation_length} exchanges
                  </div>
                  <Separator />
                  <div>
                    <strong>Final Terms:</strong> {dealSummary.final_terms}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Full Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full">
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                      <div className="font-semibold text-sm text-gray-600">{message.speaker}</div>
                      <div className="text-sm">{message.message}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button onClick={exportDealSummary}>
              <Download className="mr-2 h-4 w-4" />
              Export Deal Summary
            </Button>
            <Button variant="outline" onClick={resetNegotiation}>
              Start New Negotiation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
