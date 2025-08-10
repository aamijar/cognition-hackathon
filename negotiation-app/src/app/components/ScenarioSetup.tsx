'use client'

import { useState } from 'react'

const PRESET_SCENARIOS = [
  {
    title: 'Landlord-Tenant Rent Negotiation',
    scenario: 'Annual rent increase discussion for a 2-bedroom apartment in downtown. Current rent is $2,500/month. Landlord wants to increase by 12%, tenant wants minimal increase.',
    partyA: 'Landlord seeking fair rent increase',
    partyB: 'Tenant wanting affordable housing'
  },
  {
    title: 'Salary Negotiation',
    scenario: 'Annual performance review and salary adjustment. Employee has exceeded targets and seeks 15% raise. Company has budget constraints but wants to retain talent.',
    partyA: 'Employee seeking raise',
    partyB: 'HR Manager with budget limits'
  },
  {
    title: 'Business Partnership Deal',
    scenario: 'Two companies discussing a strategic partnership. One offers technology, other offers market access. Revenue split and terms need to be determined.',
    partyA: 'Tech Company CEO',
    partyB: 'Market Access Partner'
  },
  {
    title: 'Freelance Contract Terms',
    scenario: 'Web developer negotiating project terms with startup client. Scope creep concerns vs. tight budget. Timeline and payment structure to be agreed.',
    partyA: 'Freelance Developer',
    partyB: 'Startup Founder'
  }
]

interface ScenarioSetupProps {
  onStart: (scenario: string, partyARole: string, partyBRole: string) => void
  isConnecting: boolean
}

export default function ScenarioSetup({ onStart, isConnecting }: ScenarioSetupProps) {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [customScenario, setCustomScenario] = useState('')
  const [partyA, setPartyA] = useState('')
  const [partyB, setPartyB] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const handleStart = () => {
    if (useCustom) {
      if (!customScenario.trim() || !partyA.trim() || !partyB.trim()) {
        alert('Please fill in all fields for custom scenario')
        return
      }
      onStart(customScenario, partyA, partyB)
    } else {
      const preset = PRESET_SCENARIOS[selectedPreset]
      onStart(preset.scenario, preset.partyA, preset.partyB)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Negotiation Scenario</h2>
        <p className="text-muted text-lg">
          Watch Claude Sonnet 4 and GPT-5-mini negotiate in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preset Scenarios */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="preset"
              name="scenario-type"
              checked={!useCustom}
              onChange={() => setUseCustom(false)}
              className="w-4 h-4 text-accent"
            />
            <label htmlFor="preset" className="text-xl font-semibold">
              Preset Scenarios
            </label>
          </div>

          <div className="space-y-3">
            {PRESET_SCENARIOS.map((preset, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPreset === index && !useCustom
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
                onClick={() => {
                  setSelectedPreset(index)
                  setUseCustom(false)
                }}
              >
                <h3 className="font-semibold mb-2">{preset.title}</h3>
                <p className="text-sm text-muted mb-3">{preset.scenario}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-400">Claude: {preset.partyA}</span>
                  <span className="text-green-400">GPT: {preset.partyB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Scenario */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="custom"
              name="scenario-type"
              checked={useCustom}
              onChange={() => setUseCustom(true)}
              className="w-4 h-4 text-accent"
            />
            <label htmlFor="custom" className="text-xl font-semibold">
              Custom Scenario
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Scenario Description
              </label>
              <textarea
                value={customScenario}
                onChange={(e) => setCustomScenario(e.target.value)}
                placeholder="Describe the negotiation scenario, context, and stakes..."
                className={`w-full h-32 p-3 border rounded-lg bg-secondary text-foreground ${
                  useCustom ? 'border-accent' : 'border-border opacity-50'
                }`}
                disabled={!useCustom}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Claude's Role
                </label>
                <input
                  type="text"
                  value={partyA}
                  onChange={(e) => setPartyA(e.target.value)}
                  placeholder="e.g., Landlord, Employee..."
                  className={`w-full p-3 border rounded-lg bg-secondary text-foreground ${
                    useCustom ? 'border-accent' : 'border-border opacity-50'
                  }`}
                  disabled={!useCustom}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  GPT's Role
                </label>
                <input
                  type="text"
                  value={partyB}
                  onChange={(e) => setPartyB(e.target.value)}
                  placeholder="e.g., Tenant, Manager..."
                  className={`w-full p-3 border rounded-lg bg-secondary text-foreground ${
                    useCustom ? 'border-accent' : 'border-border opacity-50'
                  }`}
                  disabled={!useCustom}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleStart}
          disabled={isConnecting}
          className={`px-8 py-4 bg-accent text-white font-semibold rounded-lg transition-colors ${
            isConnecting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-accent/90'
          }`}
        >
          {isConnecting ? 'Starting Negotiation...' : 'Begin Negotiation'}
        </button>
      </div>
    </div>
  )
}