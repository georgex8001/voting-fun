import { useEffect, useState } from 'react'
import { onFheStatusChange } from '../hooks/useContract'
import { Shield, ShieldAlert, Loader } from 'lucide-react'

export default function FheStatusBadge() {
  const [status, setStatus] = useState('unknown')

  useEffect(() => {
    const unsubscribe = onFheStatusChange(setStatus)
    return unsubscribe
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case 'up':
        return {
          icon: Shield,
          text: 'FHE Encryption Online',
          bgColor: 'bg-green-500/90',
          textColor: 'text-white',
          iconColor: 'text-white',
        }
      case 'down':
        return {
          icon: ShieldAlert,
          text: 'Fallback Mode',
          bgColor: 'bg-orange-500/90',
          textColor: 'text-white',
          iconColor: 'text-white',
        }
      default:
        return {
          icon: Loader,
          text: 'Checking...',
          bgColor: 'bg-yellow-500/90',
          textColor: 'text-white',
          iconColor: 'text-white',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor} ${config.textColor} transition-all duration-300`}
      title={
        status === 'up'
          ? 'Gateway online, full encryption enabled'
          : status === 'down'
          ? 'Gateway offline, using standard EVM mode'
          : 'Checking Gateway status...'
      }
    >
      <Icon 
        className={`w-4 h-4 ${config.iconColor} ${status === 'unknown' ? 'animate-spin' : ''}`} 
      />
      <span className="text-sm font-semibold">{config.text}</span>
    </div>
  )
}

