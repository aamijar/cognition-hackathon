import { useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import './App.css'

interface ApiProvider {
  name: string
  symbol: string
  logo: string
  color: string
}

const apiProviders: ApiProvider[] = [
  { name: 'OpenAI', symbol: 'OPENAI', logo: '🤖', color: 'bg-green-600' },
  { name: 'Anthropic', symbol: 'CLAUDE', logo: '🧠', color: 'bg-orange-600' },
  { name: 'Google AI', symbol: 'GEMINI', logo: '🔍', color: 'bg-blue-600' },
  { name: 'Groq', symbol: 'GROQ', logo: '⚡', color: 'bg-yellow-600' },
  { name: 'Meta AI', symbol: 'LLAMA', logo: '🦙', color: 'bg-blue-700' },
  { name: 'Windsurf', symbol: 'WIND', logo: '🌊', color: 'bg-cyan-600' },
  { name: 'Mistral', symbol: 'MISTRAL', logo: '🌪️', color: 'bg-purple-600' },
  { name: 'Cohere', symbol: 'COHERE', logo: '🔗', color: 'bg-indigo-600' }
]

function App() {
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [sellProvider, setSellProvider] = useState<ApiProvider | null>(apiProviders[0])
  const [buyProvider, setBuyProvider] = useState<ApiProvider | null>(null)
  const [showSellDropdown, setShowSellDropdown] = useState(false)
  const [showBuyDropdown, setShowBuyDropdown] = useState(false)

  const handleSwap = () => {
    const tempProvider = sellProvider
    const tempAmount = sellAmount
    setSellProvider(buyProvider)
    setBuyProvider(tempProvider)
    setSellAmount(buyAmount)
    setBuyAmount(tempAmount)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Swap anytime,<br />anywhere.
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
            {/* Sell Section */}
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">Sell</div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-4xl font-medium text-white outline-none flex-1"
                />
                <div className="relative">
                  <button
                    onClick={() => setShowSellDropdown(!showSellDropdown)}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full transition-colors"
                  >
                    {sellProvider ? (
                      <>
                        <span className="text-xl">{sellProvider.logo}</span>
                        <span className="font-medium">{sellProvider.symbol}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select token</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSellDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-gray-700 rounded-xl border border-gray-600 min-w-48 z-10">
                      {apiProviders.map((provider) => (
                        <button
                          key={provider.symbol}
                          onClick={() => {
                            setSellProvider(provider)
                            setShowSellDropdown(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl transition-colors"
                        >
                          <span className="text-xl">{provider.logo}</span>
                          <div className="text-left">
                            <div className="font-medium">{provider.symbol}</div>
                            <div className="text-sm text-gray-400">{provider.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                ${sellAmount ? (parseFloat(sellAmount) * 0.002).toFixed(2) : '0'}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwap}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* Buy Section */}
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">Buy</div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-4xl font-medium text-white outline-none flex-1"
                />
                <div className="relative">
                  <button
                    onClick={() => setShowBuyDropdown(!showBuyDropdown)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      buyProvider 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    {buyProvider ? (
                      <>
                        <span className="text-xl">{buyProvider.logo}</span>
                        <span className="font-medium">{buyProvider.symbol}</span>
                      </>
                    ) : (
                      <span className="font-medium">Select token</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showBuyDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-gray-700 rounded-xl border border-gray-600 min-w-48 z-10">
                      {apiProviders.map((provider) => (
                        <button
                          key={provider.symbol}
                          onClick={() => {
                            setBuyProvider(provider)
                            setShowBuyDropdown(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl transition-colors"
                        >
                          <span className="text-xl">{provider.logo}</span>
                          <div className="text-left">
                            <div className="font-medium">{provider.symbol}</div>
                            <div className="text-sm text-gray-400">{provider.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                ${buyAmount ? (parseFloat(buyAmount) * 0.002).toFixed(2) : '0'}
              </div>
            </div>

            {/* Get Started Button */}
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 rounded-2xl transition-colors">
              Get started
            </button>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8 text-gray-400">
            Buy and sell API credits from 8+ providers including<br />
            OpenAI, Anthropic, and Google AI.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
