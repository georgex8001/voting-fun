import { Vote, LogOut } from 'lucide-react'
import FheStatusBadge from './FheStatusBadge'

function Header({ account, chainId, onDisconnect }) {
  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkName = (id) => {
    if (id === '0xaa36a7') return 'Sepolia'
    return 'Unknown Network'
  }

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Vote className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Voting-Fun</h1>
              <p className="text-xs text-white/80">Confidential Voting</p>
            </div>
          </div>

          {account && (
            <div className="flex items-center space-x-4">
              {/* FHE Gateway Status */}
              <FheStatusBadge />
              
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <div className="text-xs text-white/80">Network</div>
                <div className="text-sm font-semibold text-white">
                  {getNetworkName(chainId)}
                </div>
              </div>
              
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <div className="text-xs text-white/80">Account</div>
                <div className="text-sm font-mono text-white">
                  {formatAddress(account)}
                </div>
              </div>

              <button
                onClick={onDisconnect}
                className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                title="Disconnect"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header


