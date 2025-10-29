import { useState, useEffect } from 'react'
import { useContract, getFheStatus, getContract } from '../hooks/useContract'
import { useWallet } from '../hooks/useWallet'
import { useDecryption } from '../hooks/useDecryption'
import DecryptionProgress from './DecryptionProgress'
import { ArrowLeft, Clock, User, CheckCircle2, Lock } from 'lucide-react'

function PollDetail({ pollId, onBack }) {
  const { account } = useWallet()
  const { getPollInfo, getResults, hasVoted, vote, endPoll } = useContract()
  const [contract, setContract] = useState(null)
  
  // ✅ 新增：使用解密 Hook
  const {
    requestDecryption,
    status: decryptStatus,
    progress: decryptProgress,
    error: decryptError,
    result: decryptResult,
    reset: resetDecryption
  } = useDecryption(contract)
  
  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDecryptionModal, setShowDecryptionModal] = useState(false)

  useEffect(() => {
    initContract()
  }, [])
  
  useEffect(() => {
    if (contract) {
      loadPollData()
    }
  }, [pollId, account, contract])
  
  // ✅ 新增：初始化合约实例
  const initContract = async () => {
    try {
      const contractInstance = await getContract()
      setContract(contractInstance)
    } catch (error) {
      console.error('Failed to initialize contract:', error)
    }
  }

  const loadPollData = async () => {
    try {
      setLoading(true)
      const info = await getPollInfo(pollId)
      setPoll(info)

      if (account) {
        const voted = await hasVoted(pollId, account)
        setUserHasVoted(voted)
      }

      if (info.resultsDecrypted) {
        const res = await getResults(pollId)
        setResults(res)
      }
    } catch (error) {
      console.error('Failed to load poll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option')
      return
    }

    try {
      setActionLoading(true)
      await vote(pollId, selectedOption)
      await loadPollData()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEndPoll = async () => {
    try {
      setActionLoading(true)
      await endPoll(pollId)
      await loadPollData()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  // ✅ 重写：使用新的解密流程
  const handleRequestDecryption = async () => {
    if (!contract) {
      alert('合约未初始化，请刷新页面')
      return
    }
    
    try {
      setShowDecryptionModal(true)
      resetDecryption()
      
      console.log('🎮 开始完整解密流程...')
      const result = await requestDecryption(pollId)
      
      console.log('✅ 解密完成:', result)
      
      // 刷新投票信息
      await loadPollData()
      
      // 3秒后自动关闭模态框
      setTimeout(() => {
        setShowDecryptionModal(false)
      }, 3000)
      
    } catch (error) {
      console.error('❌ 解密失败:', error)
      // 保持模态框打开以显示错误
    }
  }

  const formatTimeRemaining = (endTime) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now

    if (remaining <= 0) return 'Ended'

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)

    if (days > 0) return `${days} days ${hours} hours`
    if (hours > 0) return `${hours} hours ${minutes} minutes`
    return `${minutes} minutes`
  }

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getTotalVotes = () => {
    return results.reduce((sum, count) => sum + count, 0)
  }

  const getPercentage = (count) => {
    const total = getTotalVotes()
    if (total === 0) return 0
    return ((count / total) * 100).toFixed(1)
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

  if (!poll) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Poll Not Found
        </h3>
        <button onClick={onBack} className="btn-primary mt-4">
          Back to List
        </button>
      </div>
    )
  }

  const isActive = poll.isActive !== false // 兼容布尔值和 undefined
  const isCreator = poll.creator.toLowerCase() === account?.toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  const hasEnded = now >= poll.endTime

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to List</span>
      </button>

      <div className="card">
        {/* Header Info */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              {poll.title}
            </h1>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isActive && !hasEnded
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isActive && !hasEnded ? 'Active' : 'Ended'}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Creator: {formatAddress(poll.creator)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(poll.endTime)}</span>
            </div>

            {poll.resultsDecrypted && (
              <div className="flex items-center space-x-2 text-primary-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Results Decrypted</span>
              </div>
            )}
          </div>
        </div>

        {/* Voting Options or Results */}
        {!hasEnded && !userHasVoted ? (
          // Active poll and user hasn't voted - Show voting form
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Please select your option
            </h3>
            <div className="space-y-3 mb-6">
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === index
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="ml-3 text-gray-800 font-medium">
                    {option}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleVote}
              disabled={actionLoading || selectedOption === null}
              className={`btn-primary w-full ${
                actionLoading || selectedOption === null
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {actionLoading ? 'Submitting...' : 'Vote'}
            </button>
          </div>
        ) : poll.resultsDecrypted ? (
          // Show results (Fallback mode or decrypted)
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Poll Results
            </h3>
            <div className="space-y-4">
              {poll.options.map((option, index) => {
                const count = results[index] || 0
                const percentage = getPercentage(count)
                const isWinner = count === Math.max(...results) && count > 0

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isWinner
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">
                        {option}
                        {isWinner && ' 🏆'}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {count} votes ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isWinner ? 'bg-primary-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 text-center text-gray-600">
              Total Votes: {getTotalVotes()}
            </div>
          </div>
        ) : (
          // Poll ended, waiting for decryption
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Poll Ended
            </h3>
            <p className="text-gray-600 mb-6">
              Waiting for decryption...
            </p>
            {isCreator && (
              <button
                onClick={handleRequestDecryption}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? 'Requesting...' : 'Request Decryption'}
              </button>
            )}
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && isActive && !hasEnded && getFheStatus() === 'up' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleEndPoll}
              disabled={actionLoading}
              className="btn-secondary w-full"
            >
              {actionLoading ? 'Processing...' : 'End Poll Now'}
            </button>
          </div>
        )}
        
        {/* Fallback Mode Notice */}
        {isCreator && isActive && !hasEnded && getFheStatus() !== 'up' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                ℹ️ In Fallback mode, polls end automatically at deadline
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Time remaining: {formatTimeRemaining(poll.endTime)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ 新增：解密进度模态框 */}
      {showDecryptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <DecryptionProgress 
              status={decryptStatus}
              progress={decryptProgress}
              error={decryptError}
            />
            
            {/* 失败时的操作按钮 */}
            {decryptStatus === 'failed' && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleRequestDecryption}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  🔄 重试
                </button>
                <button
                  onClick={() => setShowDecryptionModal(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  关闭
                </button>
              </div>
            )}
            
            {/* 成功时的操作按钮 */}
            {decryptStatus === 'success' && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDecryptionModal(false)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  ✅ 查看结果
                </button>
              </div>
            )}
            
            {/* 进行中时不允许关闭 */}
            {decryptStatus !== 'success' && decryptStatus !== 'failed' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  ⚠️ 解密进行中，请不要关闭此窗口
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PollDetail


