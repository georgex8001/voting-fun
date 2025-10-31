import { useState } from 'react'
import { useContract } from '../hooks/useContract'
import { PlusCircle, X } from 'lucide-react'

function CreatePoll({ onSuccess }) {
  const { createPoll } = useContract()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState(24)
  const [loading, setLoading] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter poll title')
      return
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert('Please enter at least 2 options')
      return
    }

    try {
      setLoading(true)
      setProgressMessage('')
      
      // ✅ 使用带进度回调的 createPoll（符合手册第3.5节）
      const receipt = await createPoll(title, validOptions, duration, (progress) => {
        setProgressMessage(progress.message)
        console.log(`[${progress.step}] ${progress.message} - ${progress.progress}%`)
      })
      
      // 等待区块确认
      console.log('✅ Poll created successfully!')
      setProgressMessage('✅ Poll created successfully!')
      
      // 增加等待时间到5秒，确保区块完全确认
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      console.log('🔄 Triggering poll list refresh...')
      
      // 重置表单
      setTitle('')
      setOptions(['', ''])
      setDuration(24)
      setProgressMessage('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('❌ Create poll error:', error)
      setProgressMessage('❌ Failed to create poll: ' + error.message)
      alert('Failed to create poll: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-primary-600" />
          Create New Poll
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poll Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poll Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g.: What's your favorite programming language?"
              className="input-field"
              maxLength={200}
            />
          </div>

          {/* Poll Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poll Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="input-field"
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Option
              </button>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              max="168"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Poll will automatically end in {duration} hours
            </p>
          </div>

          {/* Progress Message */}
          {progressMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              progressMessage.startsWith('✅') 
                ? 'bg-green-50 text-green-700' 
                : progressMessage.startsWith('❌')
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {progressMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (progressMessage || 'Creating...') : 'Create Poll'}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-primary-50 p-4 rounded-lg">
          <h3 className="font-semibold text-primary-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Poll cannot be modified after creation</li>
            <li>• All votes are completely confidential</li>
            <li>• Results are only visible after voting ends</li>
            <li>• Creating a poll requires a small gas fee</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreatePoll


