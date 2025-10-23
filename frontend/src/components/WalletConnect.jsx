import { Wallet } from 'lucide-react'

function WalletConnect({ onConnect }) {
  return (
    <button
      onClick={onConnect}
      className="btn-primary flex items-center space-x-2 mx-auto"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect MetaMask Wallet</span>
    </button>
  )
}

export default WalletConnect


