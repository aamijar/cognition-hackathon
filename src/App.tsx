import { useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import './App.css'

interface ApiProvider {
  name: string
  symbol: string
  logo: string
  logoUrl?: string
  color: string
}

const apiProviders: ApiProvider[] = [
  { 
    name: 'OpenAI', 
    symbol: 'OPENAI', 
    logo: 'O', 
    logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=64&h=64&fit=crop&crop=center',
    color: 'bg-green-600' 
  },
  { 
    name: 'Anthropic', 
    symbol: 'CLAUDE', 
    logo: 'A', 
    logoUrl: '/src/assets/logos/anthropic-logo.jpg',
    color: 'bg-orange-600' 
  },
  { 
    name: 'Google AI', 
    symbol: 'GEMINI', 
    logo: 'G', 
    logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=64&h=64&fit=crop&crop=center',
    color: 'bg-blue-600' 
  },
  { 
    name: 'Grok (X.AI)', 
    symbol: 'GROK', 
    logo: 'X', 
    logoUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=64&h=64&fit=crop&crop=center',
    color: 'bg-black' 
  },
  { 
    name: 'Groq', 
    symbol: 'GROQ', 
    logo: 'Q', 
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=64&h=64&fit=crop&crop=center',
    color: 'bg-yellow-600' 
  },
  { 
    name: 'Meta AI', 
    symbol: 'LLAMA', 
    logo: 'M', 
    logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=64&h=64&fit=crop&crop=center',
    color: 'bg-blue-700' 
  },
  { 
    name: 'Windsurf', 
    symbol: 'WIND', 
    logo: 'W', 
    logoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=64&h=64&fit=crop&crop=center',
    color: 'bg-cyan-600' 
  },
  { 
    name: 'Mistral AI', 
    symbol: 'MISTRAL', 
    logo: 'M', 
    logoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=64&h=64&fit=crop&crop=center',
    color: 'bg-purple-600' 
  },
  { 
    name: 'Cohere', 
    symbol: 'COHERE', 
    logo: 'C', 
    logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&crop=center',
    color: 'bg-indigo-600' 
  },
  { 
    name: 'Perplexity AI', 
    symbol: 'PERPLEXITY', 
    logo: 'P', 
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=center',
    color: 'bg-teal-600' 
  },
  { 
    name: 'Hugging Face', 
    symbol: 'HF', 
    logo: 'H', 
    logoUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=64&h=64&fit=crop&crop=center',
    color: 'bg-yellow-500' 
  },
  { 
    name: 'Together AI', 
    symbol: 'TOGETHER', 
    logo: 'T', 
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop&crop=center',
    color: 'bg-pink-600' 
  }
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
                        {sellProvider.logoUrl ? (
                          <img 
                            src={sellProvider.logoUrl} 
                            alt={sellProvider.name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) nextElement.style.display = 'inline';
                            }}
                          />
                        ) : null}
                        <span className={`text-xl font-bold ${!sellProvider.logoUrl ? 'block' : 'hidden'}`}>
                          {sellProvider.logo}
                        </span>
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
                          {provider.logoUrl ? (
                            <img 
                              src={provider.logoUrl} 
                              alt={provider.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'inline';
                              }}
                            />
                          ) : null}
                          <span className={`text-xl font-bold ${!provider.logoUrl ? 'block' : 'hidden'}`}>
                            {provider.logo}
                          </span>
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
                        {buyProvider.logoUrl ? (
                          <img 
                            src={buyProvider.logoUrl} 
                            alt={buyProvider.name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) nextElement.style.display = 'inline';
                            }}
                          />
                        ) : null}
                        <span className={`text-xl font-bold ${!buyProvider.logoUrl ? 'block' : 'hidden'}`}>
                          {buyProvider.logo}
                        </span>
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
                          {provider.logoUrl ? (
                            <img 
                              src={provider.logoUrl} 
                              alt={provider.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'inline';
                              }}
                            />
                          ) : null}
                          <span className={`text-xl font-bold ${!provider.logoUrl ? 'block' : 'hidden'}`}>
                            {provider.logo}
                          </span>
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
            Buy and sell API credits from 12+ providers including<br />
            OpenAI, Anthropic, Grok, Google AI, and more.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
