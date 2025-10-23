import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import WalletConnect from './components/WalletConnect'
import PollList from './components/PollList'
import CreatePoll from './components/CreatePoll'
import PollDetail from './components/PollDetail'
import { useWallet } from './hooks/useWallet'
import { initFhevmInstance } from './hooks/useContract'
import { useFheStatusNotifications } from './hooks/useFheStatusNotifications'
import { Vote, PlusCircle, List } from 'lucide-react'

function App() {
  const { account, chainId, connectWallet, disconnectWallet, isCorrectNetwork } = useWallet()
  const [currentView, setCurrentView] = useState('list') // 'list', 'create', 'detail'
  const [selectedPollId, setSelectedPollId] = useState(null)

  // 监听 FHE Gateway 状态变化并显示通知
  useFheStatusNotifications()

  // Initialize FHEVM SDK
  useEffect(() => {
    console.log('🚀 Starting app, initializing FHEVM...')
    initFhevmInstance()
  }, [])

  const handleViewPoll = (pollId) => {
    setSelectedPollId(pollId)
    setCurrentView('detail')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPollId(null)
  }

  const handleCreateSuccess = () => {
    setCurrentView('list')
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      
      <Header 
        account={account}
        chainId={chainId}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto px-4 py-8">
        {!account ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="card max-w-md w-full text-center animate-fade-in">
              <Vote className="w-20 h-20 mx-auto mb-6 text-primary-600" />
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Welcome to Voting-Fun
              </h2>
              <p className="text-gray-600 mb-8">
                Fully Confidential Voting System Powered by Zama FHEVM
              </p>
              <WalletConnect onConnect={connectWallet} />
              
              <div className="mt-8 text-left bg-primary-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">🔐 Privacy Protection</h3>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Votes are fully encrypted</li>
                  <li>• Using Fully Homomorphic Encryption</li>
                  <li>• Results decrypted only after voting ends</li>
                </ul>
              </div>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card max-w-md w-full text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Network Error
              </h2>
              <p className="text-gray-600 mb-4">
                Please switch to Sepolia Testnet
              </p>
              <button
                onClick={() => window.ethereum?.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0xaa36a7' }], // Sepolia
                })}
                className="btn-primary"
              >
                Switch Network
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="mb-8 flex justify-center space-x-4 animate-slide-up">
              <button
                onClick={() => setCurrentView('list')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentView === 'list'
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <List className="w-5 h-5" />
                <span>Poll List</span>
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentView === 'create'
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Poll</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
              {currentView === 'list' && (
                <PollList onViewPoll={handleViewPoll} />
              )}
              {currentView === 'create' && (
                <CreatePoll onSuccess={handleCreateSuccess} />
              )}
              {currentView === 'detail' && selectedPollId && (
                <PollDetail 
                  pollId={selectedPollId} 
                  onBack={handleBackToList}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-white/80">
        <p className="mb-2">
          Powered by <span className="font-semibold">Zama FHEVM</span>
        </p>
        <p className="text-sm">
          Zama Developer Program • 2025
        </p>
      </footer>
    </div>
  )
}

export default App


