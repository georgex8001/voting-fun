import { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'
import { onFheStatusChange, getFheStatus } from '../hooks/useContract'
import { Clock, Users, CheckCircle2, XCircle } from 'lucide-react'

function PollList({ onViewPoll }) {
  const { getAllPollIds, getPollInfo } = useContract()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [fheStatus, setFheStatus] = useState(getFheStatus()) // 获取初始状态

  // 监听 Gateway 状态变化，自动切换合约并重新加载
  useEffect(() => {
    console.log('🔄 PollList mounted, subscribing to FHE status changes...')
    const unsubscribe = onFheStatusChange((status) => {
      console.log(`📡 Gateway status changed: ${status}`)
      setFheStatus(status)
      // 状态改变时自动重新加载投票（切换到新合约）
      if (status !== 'unknown') {
        loadPolls()
      }
    })
    return unsubscribe
  }, [])

  // 初始加载
  useEffect(() => {
    console.log('🔄 PollList initial load...')
    loadPolls()
  }, []) // Component will remount when key changes

  const loadPolls = async () => {
    try {
      setLoading(true)
      
      // Wait longer to ensure blocks are confirmed
      console.log('⏳ Waiting for blockchain state update (2 seconds)...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('📡 Fetching poll IDs...')
      const ids = await getAllPollIds()
      console.log(`📊 Found ${ids.length} polls:`, ids)
      
      if (ids.length === 0) {
        setPolls([])
        return
      }
      
      console.log('📥 Fetching detailed information for all polls...')
      const pollsData = await Promise.all(
        ids.map(async (id) => {
          try {
            const pollInfo = await getPollInfo(id)
            console.log(`  ✓ Poll ${id}: "${pollInfo.title}"`)
            return pollInfo
          } catch (error) {
            console.error(`  ✗ Failed to fetch poll ${id}:`, error.message)
            return null
          }
        })
      )

      const validPolls = pollsData.filter(p => p !== null).reverse() // Latest first
      console.log(`✅ Successfully loaded ${validPolls.length} polls`)
      setPolls(validPolls)
    } catch (error) {
      console.error('❌ Failed to load poll list:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (endTime) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now

    if (remaining <= 0) return 'Ended'

    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} days left`
    }
    
    return `${hours}h ${minutes}m left`
  }

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-pulse-slow text-white text-xl">
          Loading...
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          No Polls Yet
        </h3>
        <p className="text-gray-600">
          Click 'Create Poll' to create your first poll!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            All Polls ({polls.length})
          </h2>
          {fheStatus !== 'unknown' && (
            <p className="text-sm text-white/70 mt-1">
              {fheStatus === 'up' 
                ? '🔐 Connected to FHE Contract (Encrypted)' 
                : '⚠️ Connected to Fallback Contract (Gateway Offline)'}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            console.log('🔄 Manual refresh triggered')
            loadPolls()
          }}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="card cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => onViewPoll(poll.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {poll.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Creator: {formatAddress(poll.creator)}
                </p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                poll.isActive && (Date.now() / 1000 < poll.endTime)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {poll.isActive && (Date.now() / 1000 < poll.endTime) ? 'Active' : 'Ended'}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{poll.options.length} options</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining(poll.endTime)}</span>
              </div>

              {poll.resultsDecrypted && (
                <div className="flex items-center space-x-1 text-primary-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Results Public</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PollList

