import { useState } from 'react'
import { useContract } from '../hooks/useContract'
import { PlusCircle, X } from 'lucide-react'

function CreatePoll({ onSuccess }) {
  const { createPoll } = useContract()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState(24)
  const [loading, setLoading] = useState(false)

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
      await createPoll(title, validOptions, duration)
      
      // 等待区块确认
      console.log('✅ Poll created, waiting for confirmation...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 重置表单
      setTitle('')
      setOptions(['', ''])
      setDuration(24)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Poll'}
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


